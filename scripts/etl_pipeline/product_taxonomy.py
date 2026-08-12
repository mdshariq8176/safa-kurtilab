# scripts/etl_pipeline/product_taxonomy.py
"""
Safa Kurti Lab — Top 50 B2B Manufacturing Hub Product Taxonomy Matrix
Defines the 5 Manufacturing Hubs & 10 Highest-Demand Product Types per Hub (50 Total).
Includes auto-classifier `classify_product()`.
"""

from typing import Dict, List, Tuple, Any
from .schemas import HubLocation, PatternCut, QualityGrade

# ─────────────────────────────────────────────────────────────────────────────
# 50 TOP B2B PRODUCT TYPE CATALOG DEFINITIONS
# ─────────────────────────────────────────────────────────────────────────────
TAXONOMY_MATRIX: Dict[str, Dict[str, Any]] = {
    # ── 1. JAIPUR & RAJASTHAN HUB (JR) ──
    "JR_01": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 1,
        "title": "60x60 Cambric Cotton 3-Piece Flared Anarkali Set",
        "keywords": ["anarkali", "60x60", "cambric", "flared"],
        "pattern_cut": PatternCut.ANARKALI_FLARED,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_02": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 2,
        "title": "60x60 Cambric Cotton Straight 3-Piece Set (with Mulmul Dupatta)",
        "keywords": ["mulmul", "dupatta", "straight", "60x60", "cambric"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_03": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 3,
        "title": "Sanganeri Block Print Cotton Kurti with Pant",
        "keywords": ["sanganeri", "block print", "pant", "kurti with pant"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_04": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 4,
        "title": "Gota Patti Work Festive 3-Piece Suit Set",
        "keywords": ["gota patti", "festive", "suit set", "gota work"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_05": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 5,
        "title": "Alia Cut & Nyra Cut Cotton Printed Sets",
        "keywords": ["alia cut", "nyra cut", "alia", "nyra"],
        "pattern_cut": PatternCut.ALIA_CUT,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_06": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 6,
        "title": "Bagru / Dabu Print Natural Dye Kurti",
        "keywords": ["bagru", "dabu", "natural dye", "indigo"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_07": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 7,
        "title": "40x40 Regular Cotton Dailywear Kurti (Budget Volume)",
        "keywords": ["40x40", "regular cotton", "budget", "dailywear"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_08": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 8,
        "title": "Cotton Flex / Slub Thread Embroidered Sets",
        "keywords": ["cotton flex", "slub", "thread embroidered"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_09": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 9,
        "title": "Pure Mulmul Printed Dupatta 3-Piece Sets",
        "keywords": ["pure mulmul", "mulmul dupatta"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },
    "JR_10": {
        "hub_code": "JR",
        "hub_location": HubLocation.RAJASTHAN_JAIPUR,
        "rank": 10,
        "title": "Short Cotton Tunics / Daily Tops (30\" Length)",
        "keywords": ["tunic", "short top", "30 inch", "short kurti"],
        "pattern_cut": PatternCut.SHORT_TUNIC,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Jaipur & Rajasthan Hub",
        "category": "Pure Cotton & Block Print"
    },

    # ── 2. SURAT & GUJARAT HUB (SG) ──
    "SG_01": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 1,
        "title": "Heavy Pakistani Concept Lawn Cotton Suits (Schiffli Lace & Organza)",
        "keywords": ["pakistani", "schiffli", "lawn cotton", "organza dupatta"],
        "pattern_cut": PatternCut.PAKISTANI_LONG_PANEL,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_02": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 2,
        "title": "18kg Heavy Liva Viscose Rayon Sharara / Gharara Sets",
        "keywords": ["18kg", "sharara", "gharara", "liva rayon"],
        "pattern_cut": PatternCut.SHARARA_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_03": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 3,
        "title": "Micro Fox Georgette Sequence & Zari Embroidered Sets",
        "keywords": ["fox georgette", "sequence", "zari", "georgette"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_04": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 4,
        "title": "14kg Rayon Foil Print & Rubber Print Kurti-Palazzo Sets",
        "keywords": ["14kg", "foil print", "rubber print", "palazzo"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_05": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 5,
        "title": "Chinon Silk & Organza Digital Printed Designer Sets",
        "keywords": ["chinon", "chinon silk", "organza digital print"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_06": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 6,
        "title": "Indo-Western Co-ord Sets (Rayon / Muslin Top + Pants)",
        "keywords": ["co-ord", "coord", "muslin top", "indo western"],
        "pattern_cut": PatternCut.CO_ORD_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_07": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 7,
        "title": "Roman Silk / Jacquard Weaving Festive Suit Sets",
        "keywords": ["roman silk", "jacquard", "weaving festive"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_08": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 8,
        "title": "Unstitched Synthetic Dress Materials (Micro / Lizi-Bizi)",
        "keywords": ["unstitched", "micro", "lizi-bizi", "lizi bizi"],
        "pattern_cut": PatternCut.UNSTITCHED_MATERIAL,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_09": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 9,
        "title": "Poly-Crepe Digital Print Dailywear Kurtis",
        "keywords": ["poly crepe", "poly-crepe", "crepe print"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },
    "SG_10": {
        "hub_code": "SG",
        "hub_location": HubLocation.GUJARAT_SURAT,
        "rank": 10,
        "title": "Heavy Velvet Micro 9000 Embroidered Winter Sets",
        "keywords": ["velvet", "micro 9000", "velvet winter"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Surat & Gujarat Hub",
        "category": "Rayon, Georgette & Synthetics"
    },

    # ── 3. LUCKNOW & UTTAR PRADESH HUB (LK) ──
    "LK_01": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 1,
        "title": "Faux Georgette Hand Chikankari Long Kurti with Inner",
        "keywords": ["chikankari", "faux georgette", "inner", "georgette chikankari"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_02": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 2,
        "title": "Modal Silk Viscose Heavy Chikankari 3-Piece Sets",
        "keywords": ["modal silk", "modal chikankari", "heavy chikankari"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_03": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 3,
        "title": "Cotton Mulmul Shadow Work (Bakhiya) Chikankari Kurti",
        "keywords": ["bakhiya", "shadow work", "mulmul chikankari"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_04": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 4,
        "title": "Muslin Silk Mukaish / Badla Work Chikankari Suits",
        "keywords": ["mukaish", "badla", "muslin chikankari"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_05": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 5,
        "title": "Banarasi Silk Weaving Suits & Dupattas (Varanasi Hub)",
        "keywords": ["banarasi", "banarasi silk", "varanasi weaving"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_06": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 6,
        "title": "Chiffon / Organza Chikankari Anarkali Gowns",
        "keywords": ["chikankari anarkali", "chikankari gown"],
        "pattern_cut": PatternCut.ANARKALI_FLARED,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_07": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 7,
        "title": "Chikankari Short Crop Tops & Tunics",
        "keywords": ["crop top chikankari", "short tunic chikankari"],
        "pattern_cut": PatternCut.SHORT_TUNIC,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_08": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 8,
        "title": "Cotton Lizi-Bizi Printed Unstitched Dress Materials",
        "keywords": ["lizi bizi dress material", "up unstitched"],
        "pattern_cut": PatternCut.UNSTITCHED_MATERIAL,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_09": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 9,
        "title": "Zardozi Embroidered Heavy Festive Suits",
        "keywords": ["zardozi", "zardozi festive"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },
    "LK_10": {
        "hub_code": "LK",
        "hub_location": HubLocation.UTTAR_PRADESH_LUCKNOW,
        "rank": 10,
        "title": "Chikankari Bottomwear (Lace & Embroidered Pants)",
        "keywords": ["chikankari pant", "chikankari palazzo", "lace bottomwear"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Lucknow & UP Hub",
        "category": "Chikankari & Handloom"
    },

    # ── 4. PUNJAB & NORTH INDIA HUB (PB) ──
    "PB_01": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 1,
        "title": "Pure Cotton Printed Patiala Suit Sets (Bahubali / Baaghi Concept)",
        "keywords": ["patiala", "bahubali", "baaghi", "patiala suit"],
        "pattern_cut": PatternCut.PATIALA_SUIT,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_02": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 2,
        "title": "Heavy Phulkari Embroidered Punjabi Suits with Dupattas",
        "keywords": ["phulkari", "phulkari dupatta", "punjabi suit"],
        "pattern_cut": PatternCut.PATIALA_SUIT,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_03": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 3,
        "title": "Kashmiri Aari Work Spun Pashmina Winter Suits",
        "keywords": ["aari work", "pashmina", "spun winter", "kashmiri"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_04": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 4,
        "title": "Glace Cotton Embroidered Salwar Suits",
        "keywords": ["glace cotton", "glace cotton embroidered"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_05": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 5,
        "title": "Cambric Cotton Suit with Printed Chiffon Dupatta",
        "keywords": ["chiffon dupatta suit", "cambric chiffon"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_06": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 6,
        "title": "Heavy Designer Bridal Suits (Chandni Chowk Concept)",
        "keywords": ["bridal suit", "chandni chowk", "heavy designer suit"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_07": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 7,
        "title": "Cotton PC Print Suits with Nazneen Dupattas",
        "keywords": ["pc print", "nazneen dupatta"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_08": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 8,
        "title": "Velvet Winter Kurti & Pant Sets",
        "keywords": ["velvet winter set", "velvet pant set"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_09": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 9,
        "title": "Georgette Designer Heavy Partywear Suits",
        "keywords": ["partywear suit", "georgette partywear"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },
    "PB_10": {
        "hub_code": "PB",
        "hub_location": HubLocation.PUNJAB_AMRITSAR,
        "rank": 10,
        "title": "Cotton Lycra Stretchable Leggings & Plazos",
        "keywords": ["lycra stretchable", "leggings", "cotton plazo"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Punjab & North Hub",
        "category": "Punjabi Suits, Phulkari & Winterwear"
    },

    # ── 5. KOLKATA & WEST BENGAL HUB (KB) ──
    "KB_01": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 1,
        "title": "Pure Cotton Printed Dailywear Unstitched Suits / Kurtis",
        "keywords": ["kolkata cotton", "bengal cotton", "dailywear unstitched"],
        "pattern_cut": PatternCut.UNSTITCHED_MATERIAL,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_02": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 2,
        "title": "Bengal Handloom Cotton Jamdani Work Suit Sets",
        "keywords": ["jamdani", "bengal handloom", "jamdani work"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_03": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 3,
        "title": "Kantha Stitch & Batik Print Hand Embroidered Kurtis",
        "keywords": ["kantha stitch", "batik print", "kantha"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_04": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 4,
        "title": "Murshidabad Silk & Tussar Printed Suits",
        "keywords": ["murshidabad silk", "tussar silk", "tussar print"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_05": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 5,
        "title": "Dailywear Budget Straight Cut Cotton Kurtis",
        "keywords": ["budget cotton", "kolkata straight kurti"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_06": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 6,
        "title": "Khadi Cotton Handloom Kurti Sets",
        "keywords": ["khadi", "khadi cotton", "handloom kurti"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_07": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 7,
        "title": "Designer Organza & Chanderi Dupatta Sets",
        "keywords": ["organza dupatta set", "chanderi dupatta set"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.LUXURY_EXPORT_GRADE_AAA,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_08": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 8,
        "title": "Alpine & Hosiery Cotton Nighties / Loungewear Sets",
        "keywords": ["nighty", "loungewear", "hosiery cotton", "alpine"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_09": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 9,
        "title": "Short Tops & Tunics (College / Office Wear)",
        "keywords": ["college wear", "office tunic", "short top kolkata"],
        "pattern_cut": PatternCut.SHORT_TUNIC,
        "default_quality": QualityGrade.VOLUME_COMMERCIAL_GRADE_A,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    },
    "KB_10": {
        "hub_code": "KB",
        "hub_location": HubLocation.WEST_BENGAL_KOLKATA,
        "rank": 10,
        "title": "South Cotton Slub Thread Work Sets",
        "keywords": ["south cotton", "slub thread work"],
        "pattern_cut": PatternCut.STRAIGHT_SET,
        "default_quality": QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA,
        "hub_name": "Kolkata & Bengal Hub",
        "category": "Handloom Cotton, Jamdani & Kantha"
    }
}


def classify_product(
    title: str,
    description: str = "",
    fabric_grade: str = "",
    price: float = 0.0,
    hub_location: str = "RAJASTHAN_JAIPUR"
) -> Tuple[str, int, str]:
    """
    Classifies incoming product raw metadata into 1 of 50 Product Type Codes.
    Returns: (product_type_code e.g. 'JR_01', rank e.g. 1, hub_code e.g. 'JR')
    """
    text = f"{title} {description} {fabric_grade}".lower()

    # Determine default hub prefix
    hub_prefix = "JR"
    if "surat" in hub_location.lower() or "gujarat" in hub_location.lower():
        hub_prefix = "SG"
    elif "lucknow" in hub_location.lower() or "uttar_pradesh" in hub_location.lower():
        hub_prefix = "LK"
    elif "amritsar" in hub_location.lower() or "punjab" in hub_location.lower():
        hub_prefix = "PB"
    elif "kolkata" in hub_location.lower() or "bengal" in hub_location.lower():
        hub_prefix = "KB"

    # Score each product type in matrix
    best_code = f"{hub_prefix}_01"
    max_score = -1

    for code, defn in TAXONOMY_MATRIX.items():
        score = 0
        # Hub matching bonus
        if defn["hub_code"] == hub_prefix:
            score += 10

        # Keyword matching
        for kw in defn["keywords"]:
            if kw in text:
                score += 15

        if score > max_score:
            max_score = score
            best_code = code

    target_defn = TAXONOMY_MATRIX[best_code]
    return best_code, target_defn["rank"], target_defn["hub_code"]
