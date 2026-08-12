# scripts/etl_pipeline/schemas.py
"""
Safa Kurtilab Enterprise ETL Pipeline - Pydantic Data Schemas
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl

class HubLocation(str, Enum):
    RAJASTHAN_JAIPUR = "RAJASTHAN_JAIPUR"
    GUJARAT_SURAT = "GUJARAT_SURAT"
    UTTAR_PRADESH_LUCKNOW = "UTTAR_PRADESH_LUCKNOW"
    PUNJAB_AMRITSAR = "PUNJAB_AMRITSAR"
    WEST_BENGAL_KOLKATA = "WEST_BENGAL_KOLKATA"

class PatternCut(str, Enum):
    STRAIGHT_SET = "STRAIGHT_SET"
    ANARKALI_FLARED = "ANARKALI_FLARED"
    CO_ORD_SET = "CO_ORD_SET"
    SHORT_TUNIC = "SHORT_TUNIC"
    PAKISTANI_LONG_PANEL = "PAKISTANI_LONG_PANEL"
    SHARARA_SET = "SHARARA_SET"
    ALIA_CUT = "ALIA_CUT"
    NYRA_CUT = "NYRA_CUT"
    PATIALA_SUIT = "PATIALA_SUIT"
    UNSTITCHED_MATERIAL = "UNSTITCHED_MATERIAL"

class QualityGrade(str, Enum):
    LUXURY_EXPORT_GRADE_AAA = "LUXURY_EXPORT_GRADE_AAA"  # Roman Silk, Organza, Handwork (MSRP ₹2500+)
    BOUTIQUE_PREMIUM_GRADE_AA = "BOUTIQUE_PREMIUM_GRADE_AA" # 60x60 Cambric Cotton, Heavy 14kg Rayon (MSRP ₹1200-₹2499)
    VOLUME_COMMERCIAL_GRADE_A = "VOLUME_COMMERCIAL_GRADE_A" # Daily Volume Wear (MSRP Under ₹1200)

class NormalizedSupplierRecord(BaseModel):
    raw_hash: str = Field(..., description="SHA-256 hash of row + image payload for CDC delta tracking")
    supplier_sku: str = Field(..., description="Extracted vendor design code e.g., D.NO-129_A")
    master_group_sku: str = Field(..., description="Parent Master Design Code e.g., CORD_SET_1049_8013")
    color_variant_name: str = Field(default="Standard", description="Color variant e.g., Wine Red, Mustard, Peacock Blue")
    vendor_name: str = Field(default="Jaipur_Wholesale_Hub")
    hub_location: HubLocation = Field(default=HubLocation.RAJASTHAN_JAIPUR)
    hub_code: str = Field(default="JR", description="Hub prefix code e.g. JR, SG, LK, PB, KB")
    product_type_code: str = Field(default="JR_01", description="50 Top B2B Product Type Code e.g. JR_01, SG_03")
    product_type_rank: int = Field(default=1, ge=1, le=10, description="B2B Volume & Demand Rank 1-10 within Hub")
    title: str
    fabric_grade: str = Field(default="Pure Cambric Cotton 60x60")
    pattern_cut: PatternCut = Field(default=PatternCut.STRAIGHT_SET)
    quality_grade: QualityGrade = Field(default=QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA)
    b2b_price: float = Field(..., description="Wholesale Base Rate in INR")
    listing_price: float = Field(..., description="Base rate + 5% GST")
    per_piece_price: float = Field(..., description="Price per individual piece in 4-pc set")
    msrp_retail_price: float = Field(..., description="Suggested Retail MSRP")
    detected_crafts: List[str] = Field(default_factory=list)
    detected_colors: List[str] = Field(default_factory=list)
    ocr_extracted_text: Optional[str] = None
    watermark_flagged: bool = False
    image_vector_512: Optional[List[float]] = None
    is_duplicate: bool = False
    duplicate_sku_match: Optional[str] = None
    confidence_score: float = Field(default=0.0, ge=0.0, le=100.0)
    requires_hitl: bool = False
    reasons_flagged: List[str] = Field(default_factory=list)

class GeneratedCopywriting(BaseModel):
    title_en: str
    title_bn: str
    bullet_points_en: List[str]
    bullet_points_bn: List[str]
    b2b_selling_pitch: str
    margin_potential_pct: float
