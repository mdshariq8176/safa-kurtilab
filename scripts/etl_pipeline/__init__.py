# scripts/etl_pipeline/__init__.py
"""
Safa Kurtilab Enterprise AI ETL Pipeline Package
"""
from .schemas import NormalizedSupplierRecord, GeneratedCopywriting, HubLocation, PatternCut, QualityGrade
from .image_worker import (
    remove_background_and_center,
    extract_ocr_price_tags,
    detect_watermark_or_logo,
    neural_inpaint_garment_watermark,
    gemini_auto_inpaint_unknown_watermarks
)
from .vector_engine import VisualVectorEngine
from .excel_parser import IncrementalExcelParser
from .copywriter import generate_b2b_copywriting
from .qa_router import evaluate_record_confidence
from .sync import CloudSyncEngine
