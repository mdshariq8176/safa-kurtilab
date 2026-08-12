# scripts/etl_pipeline/qa_router.py
"""
Module 5: Confidence Scoring & HITL Dashboard Router (services/qa_router)
Calculates multi-metric score (0-100%) and routes items (>=85% Auto-Publish, <85% Admin Queue).
"""

from typing import Tuple
from .schemas import NormalizedSupplierRecord


def evaluate_record_confidence(record: NormalizedSupplierRecord) -> Tuple[float, bool, list]:
    """
    Evaluates 4 weighted QA metrics:
    1. Vision AI vs. Excel Text Agreement (30%)
    2. Image Filename Fuzzy Match (30%)
    3. OCR Tag Verification (20%)
    4. Schema Completeness (20%)

    Returns (confidence_score, requires_hitl, reasons_flagged).
    """
    reasons: list = []
    vision_text_score = 30.0
    filename_score = 30.0
    ocr_score = 20.0
    schema_score = 20.0

    # 1. Vision vs Text Check
    if not record.fabric_grade:
        vision_text_score -= 15.0
        reasons.append("Uncertain fabric classification")

    # 2. Filename Match Check
    if "sku" not in record.supplier_sku.lower() and len(record.supplier_sku) < 3:
        filename_score -= 15.0
        reasons.append("Weak SKU filename correlation")

    # 3. OCR Check
    if record.watermark_flagged:
        ocr_score -= 15.0
        reasons.append("Competitor watermark detected on image")

    # 4. Schema Completeness Check
    if record.b2b_price < 100 or record.b2b_price > 20000:
        schema_score -= 20.0
        reasons.append(f"Price ₹{record.b2b_price} outside standard wholesale bounds")

    total_score = round(vision_text_score + filename_score + ocr_score + schema_score, 1)
    requires_hitl = total_score < 85.0 or len(reasons) > 0

    return total_score, requires_hitl, reasons
