# scripts/etl_pipeline/excel_parser.py
"""
Module 3: LLM Parser with Delta Tracking & CDC (services/excel_parser)
Generates SHA-256 hashes per row and image for Change Data Capture (CDC) incremental ingestion.
"""

import hashlib
import json
import os
from typing import Dict, List, Tuple
from .schemas import NormalizedSupplierRecord, HubLocation, PatternCut, QualityGrade
from .quality_engine import determine_quality_grade


class IncrementalExcelParser:
    def __init__(self, cache_file="scripts/etl_pipeline/cdc_hashes.json"):
        self.cache_file = cache_file
        self.processed_hashes = self._load_cache()

    def _load_cache(self) -> Dict[str, str]:
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def save_cache(self):
        os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
        with open(self.cache_file, "w", encoding="utf-8") as f:
            json.dump(self.processed_hashes, f, indent=2)

    @staticmethod
    def compute_sha256(data_dict: dict, image_bytes: bytes = b"") -> str:
        """
        Computes deterministic SHA-256 fingerprint for data row + image binary.
        """
        serialized = json.dumps(data_dict, sort_keys=True).encode("utf-8")
        hasher = hashlib.sha256(serialized)
        if image_bytes:
            hasher.update(image_bytes)
        return hasher.hexdigest()

    def is_row_changed(self, row_hash: str) -> bool:
        return row_hash not in self.processed_hashes

    def mark_processed(self, row_hash: str, sku: str):
        self.processed_hashes[row_hash] = sku

    def parse_raw_row(self, raw_row: dict, image_path: str = "") -> Tuple[NormalizedSupplierRecord, bool]:
        """
        Parses raw Excel/JSON row into validated Pydantic NormalizedSupplierRecord.
        Automatically handles SKU mapping, Color Variant Grouping, and Quality Grade Hierarchy.
        """
        img_bytes = b""
        if image_path and os.path.isfile(image_path):
            with open(image_path, "rb") as f:
                img_bytes = f.read()

        row_hash = self.compute_sha256(raw_row, img_bytes)
        is_new = self.is_row_changed(row_hash)

        # Extract Fields
        raw_title = str(raw_row.get("title") or raw_row.get("Item Name") or raw_row.get("D.No") or "Wholesale Kurti Set")
        raw_sku = str(raw_row.get("supplier_sku") or raw_row.get("D.No") or raw_row.get("Code") or f"SKU-{row_hash[:8].upper()}")
        base_rate = float(raw_row.get("b2b_price") or raw_row.get("Rate") or raw_row.get("Price") or 650.0)

        listing_price = round(base_rate * 1.05, 2)
        per_piece = round(listing_price / 4.0, 2)
        msrp = round(per_piece * 2.2, 2)

        # 1. Master Group SKU Extraction (Strips color suffixes _A, _B, -Wine, -Blue to group variants under 1 parent)
        master_sku = re.sub(r"[_\-][A-Za-z0-9]$", "", raw_sku)
        master_sku = re.sub(r"[_\-](Wine|Blue|Mustard|Green|Pink|Yellow|Red|Grey|WineRed)$", "", master_sku, flags=re.IGNORECASE)

        # 2. Extract Variant Color Name
        color_name = str(raw_row.get("color") or raw_row.get("Color") or "Standard")
        if color_name == "Standard":
            if raw_sku.endswith("_A") or "-A" in raw_sku:
                color_name = "Option A (Primary Color)"
            elif raw_sku.endswith("_B") or "-B" in raw_sku:
                color_name = "Option B (Secondary Color)"
            elif raw_sku.endswith("_C") or "-C" in raw_sku:
                color_name = "Option C (Tertiary Color)"

        # 3. Hub Location Detection
        row_str = json.dumps(raw_row).lower() + " " + image_path.lower()
        hub = HubLocation.RAJASTHAN_JAIPUR
        if "surat" in row_str or "rayon" in row_str:
            hub = HubLocation.GUJARAT_SURAT
        elif "lucknow" in row_str or "modal" in row_str or "chikankari" in row_str:
            hub = HubLocation.UTTAR_PRADESH_LUCKNOW

        # 4. Multi-Factor AI Quality Grade Engine (5 Independent Signals)
        description_combined = " ".join([
            str(raw_row.get("title", "")),
            str(raw_row.get("fabric_grade", "")),
            str(raw_row.get("Item Name", "")),
            str(raw_row.get("description", "")),
            str(raw_row.get("D.No", "")),
            image_path
        ])
        
        # Taxonomy Classification
        pt_code, pt_rank, hub_code = classify_product(
            title=raw_title,
            description=description_combined,
            fabric_grade=str(raw_row.get("fabric_grade", "")),
            price=base_rate,
            hub_location=hub.value
        )

        quality, quality_score, quality_rationale = determine_quality_grade(
            description_text=description_combined,
            b2b_price=base_rate,
            hub_location=hub.value,
            image_path=image_path,
            use_gemini_vision=False  # Set True for premium single-image analysis
        )

        # 5. Pattern Cut Detection
        cut = TAXONOMY_MATRIX.get(pt_code, {}).get("pattern_cut", PatternCut.STRAIGHT_SET)
        if "anarkali" in row_str:
            cut = PatternCut.ANARKALI_FLARED
        elif "co-ord" in row_str or "coord" in row_str or "cord" in row_str:
            cut = PatternCut.CO_ORD_SET

        record = NormalizedSupplierRecord(
            raw_hash=row_hash,
            supplier_sku=raw_sku,
            master_group_sku=master_sku,
            color_variant_name=color_name,
            vendor_name=str(raw_row.get("vendor_name") or "Jaipur_Wholesale_Hub"),
            hub_location=hub,
            hub_code=hub_code,
            product_type_code=pt_code,
            product_type_rank=pt_rank,
            title=raw_title,
            fabric_grade=str(raw_row.get("fabric_grade") or "Pure Cambric Cotton 60x60"),
            pattern_cut=cut,
            quality_grade=quality,
            b2b_price=base_rate,
            listing_price=listing_price,
            per_piece_price=per_piece,
            msrp_retail_price=msrp,
            detected_crafts=[k for k in ["Block Print", "Gota Patti", "Chikankari", "Embroidery", "Thread Work", "Mirror Work"] if k.lower() in row_str],
            detected_colors=[color_name],
            reasons_flagged=[quality_rationale]
        )

        return record, is_new
