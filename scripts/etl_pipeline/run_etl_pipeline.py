# scripts/etl_pipeline/run_etl_pipeline.py
"""
Master Runner: Hyper-Automated AI-Driven ETL Pipeline Execution Script
Executes all 6 modules end-to-end for Safa Kurtilab enterprise vendor ingestion.
"""

import os
import sys
import json
import csv
import time
from typing import List

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
sys.stdout.reconfigure(encoding="utf-8")

from scripts.etl_pipeline import (
    IncrementalExcelParser,
    remove_background_and_center,
    extract_ocr_price_tags,
    detect_watermark_or_logo,
    VisualVectorEngine,
    generate_b2b_copywriting,
    evaluate_record_confidence,
    CloudSyncEngine,
    NormalizedSupplierRecord
)


def run_pipeline(csv_path: str, raw_images_dir: str, output_webp_dir: str = "public/images/processed"):
    print("=" * 70)
    print("🚀 SAFA KURTILAB ENTERPRISE AI ETL PIPELINE - EXECUTION START")
    print("=" * 70)

    start_time = time.time()

    # Initialize Modules
    parser = IncrementalExcelParser()
    vector_engine = VisualVectorEngine()
    cloud_sync = CloudSyncEngine()

    os.makedirs(output_webp_dir, exist_ok=True)

    # Database Vector Store (Simulated active catalog vectors)
    existing_catalog_vectors = [
        ("SKU-JPR-101", vector_engine.generate_embedding("scripts/folder1_tb2_sample.png")),
    ]

    # Load raw catalog data
    rows = []
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for r in reader:
                rows.append(r)
    else:
        # Fallback sample rows if CSV doesn't exist
        rows = [
            {
                "D.No": "D.NO-8891",
                "Item Name": "Sanganeri Printed Pure Cambric Cotton Kurti Set",
                "Rate": "680",
                "Fabric": "Pure Cambric Cotton 60x60",
                "Vendor": "Jaipur_Textile_Mills",
                "Image": "folder1_tb2_sample.png"
            },
            {
                "Code": "D.NO-9920",
                "Particulars": "Heavy Rayon Foil Print Alia Cut Anarkali",
                "Price": "850",
                "Stuff": "14kg Heavy Rayon",
                "Vendor": "Surat_Fashion_Hub",
                "Image": "folder2_sample.png"
            }
        ]

    print(f"📦 Total Input Raw Rows: {len(rows)}")

    stats = {
        "processed": 0,
        "skipped_cdc": 0,
        "auto_approved": 0,
        "hitl_flagged": 0,
        "duplicates_detected": 0
    }

    for idx, raw_row in enumerate(rows, 1):
        print(f"\n--------------------------------------------------")
        print(f"▶️ Processing Item {idx}/{len(rows)}: {raw_row.get('Item Name') or raw_row.get('D.No') or raw_row.get('title')}")

        # Find image path
        img_name = raw_row.get("Image") or raw_row.get("image") or ""
        img_path = ""
        if img_name:
            cand1 = os.path.join(raw_images_dir, img_name)
            cand2 = os.path.join("scripts", img_name)
            if os.path.isfile(cand1):
                img_path = cand1
            elif os.path.isfile(cand2):
                img_path = cand2

        # 1. CDC & Incremental Parse
        record, is_new = parser.parse_raw_row(raw_row, img_path)
        if not is_new:
            print(f"  ⚡ CDC Hash Match: Row unchanged. Skipping heavy processing.")
            stats["skipped_cdc"] += 1
            continue

        stats["processed"] += 1

        # 2. Image Pipeline & Background Removal
        target_webp_path = os.path.join(output_webp_dir, f"{record.supplier_sku.lower()}_studio.webp")
        if img_path and os.path.exists(img_path):
            print(f"  🖼️ Running RMBG-1.4 Background Removal & 3:4 Studio Padding...")
            remove_background_and_center(img_path, target_webp_path)
            
            ocr_text = extract_ocr_price_tags(img_path)
            if ocr_text:
                record.ocr_extracted_text = ocr_text
                print(f"  🔍 OCR Tag Text Extracted: '{ocr_text[:50]}...'")

            record.watermark_flagged = detect_watermark_or_logo(img_path)
            if record.watermark_flagged:
                print("  ⚠️ Watermark/Logo overlay detected on image!")
        else:
            print("  ℹ️ No raw image provided. Using default web asset.")

        # 3. Vector Embeddings & Deduplication
        if os.path.exists(target_webp_path):
            vector = vector_engine.generate_embedding(target_webp_path)
        else:
            vector = vector_engine.generate_embedding(img_path if img_path and os.path.exists(img_path) else "default")
        
        record.image_vector_512 = vector
        is_dup, dup_sku, sim_score = vector_engine.check_duplicate(vector, existing_catalog_vectors)
        if is_dup:
            record.is_duplicate = True
            record.duplicate_sku_match = dup_sku
            stats["duplicates_detected"] += 1
            print(f"  👯 Duplicate Design Flagged! Matches existing {dup_sku} with similarity {sim_score:.4f}")

        # 4. Copywriting Engine
        copy = generate_b2b_copywriting(record)
        print(f"  ✍️ B2B Copy Generated: Title='{copy.title_en}' | Retailer Margin={copy.margin_potential_pct}%")

        # 5. QA Confidence Scoring & HITL Router
        confidence, requires_hitl, reasons = evaluate_record_confidence(record)
        record.confidence_score = confidence
        record.requires_hitl = requires_hitl
        record.reasons_flagged = reasons

        if requires_hitl:
            stats["hitl_flagged"] += 1
            print(f"  🚩 QA Score {confidence}% < 85% -> Routed to HITL Admin Approval Queue ({', '.join(reasons)})")
        else:
            stats["auto_approved"] += 1
            print(f"  ✅ QA Score {confidence}% >= 85% -> Auto-Approved for Direct Publishing!")

        # 6. Cloud Sync & Transactional Upsert
        cdn_url = cloud_sync.upload_image_cdn(target_webp_path, record.supplier_sku)
        success, msg = cloud_sync.transactional_upsert(record, copy, cdn_url)
        print(f"  ☁️ Cloud Upsert: {msg}")

        # Mark CDC processed
        parser.mark_processed(record.raw_hash, record.supplier_sku)

    parser.save_cache()

    elapsed = round(time.time() - start_time, 2)
    print("\n" + "=" * 70)
    print("📊 SAFA KURTILAB ETL PIPELINE - SUMMARY REPORT")
    print("=" * 70)
    print(f"⏱️ Total Execution Time: {elapsed} seconds")
    print(f"📥 Total Input Records: {len(rows)}")
    print(f"🔄 CDC Unchanged Skipped: {stats['skipped_cdc']}")
    print(f"⚡ Full AI Pipelines Run: {stats['processed']}")
    print(f"✅ Auto-Approved & Published: {stats['auto_approved']}")
    print(f"🚩 Routed to Admin HITL Queue: {stats['hitl_flagged']}")
    print(f"👯 Visual Duplicates Flagged: {stats['duplicates_detected']}")
    print("=" * 70)


if __name__ == "__main__":
    csv_file = "catalog_import_template.csv"
    img_dir = "raw-images"
    run_pipeline(csv_file, img_dir)
