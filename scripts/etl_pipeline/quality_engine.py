# scripts/etl_pipeline/quality_engine.py
"""
Safa Kurti Lab - AI-Powered Multi-Factor Quality Grading Engine
Combines 5 independent signal sources to determine Quality Grade:
  1. Fabric Keyword Signals (Excel/OCR description text analysis)
  2. Craft & Handwork Keyword Signals (Artisanal work detection)
  3. Price Bracket Analysis (Wholesale base rate)
  4. Gemini Vision AI Visual Fabric Inspection (Real-time image analysis)
  5. Production Hub & Supplier Trust Index
"""

import os
import sys
from typing import Tuple

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from .schemas import QualityGrade


# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 1: FABRIC KEYWORD SCORING TABLE
# ─────────────────────────────────────────────────────────────────────────────
FABRIC_SIGNALS = {
    # Luxury Tier (Score: +30 each)
    "roman silk":        30, "pure organza":      30, "real organza":       30,
    "poly chinon":       30, "mul chanderi":       30, "pure chiffon":       30,
    "georget":           30, "kota doria":         30, "tissue silk":        30,
    "chanderi silk":     30, "banaras silk":       30, "handloom silk":      30,
    "tussar silk":       30, "raw silk":           30, "satin crepe":        25,

    # Premium Tier (Score: +20 each)
    "cambric 60x60":     20, "60x60 cotton":       20, "60x60 cambric":      20,
    "pure cambric":      20, "heavy rayon 14kg":   20, "heavy rayon 14 kg":  20,
    "rayon 14kg":        20, "rayon 14 kg":        20, "rayon viscose":      15,
    "modal muslin":      20, "mulmul":             20, "heavy georgette":    18,
    "american crepe":    18, "dola silk":          18, "vichitra silk":      18,
    "pure cotton":       15, "lawn cotton":        15, "karachi lawn":       15,
    "straight cotton":   12,

    # Volume Tier (Score: +5 each)
    "cotton blend":       5, "polyester":           5, "mix fabric":          5,
    "hosiery":            3, "net fabric":          5,
}

# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 2: CRAFT & ARTISANAL WORK SCORING TABLE
# ─────────────────────────────────────────────────────────────────────────────
CRAFT_SIGNALS = {
    # Luxury Handwork (Score: +25 each)
    "real mirror work":  25, "zardozi":            25, "khatli work":        25,
    "aari work":         25, "lucknow chikankari": 25, "heavy handwork":     22,
    "c-cut embroidery":  22, "foil print":         20, "heavy embroidery":   20,
    "heavy thread work": 20, "designer work":      18,

    # Premium Artisanal (Score: +15 each)
    "jaipuri block print": 15, "hand block print":  15, "gota patti":         15,
    "neckline embroidery": 15, "thread work":       12, "stone work":         12,
    "sequence work":       12, "sequin work":       12, "butti work":         12,
    "printed embroidery":  10, "machine embroidery": 10, "shifli":            15,
    "gota border":         12, "patchwork":         10, "lace border":         8,

    # Basic (Score: +5 each)
    "block print":         5, "digital print":      5, "floral print":        5,
    "plain dyed":          2,
}

# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 3: PRICE BRACKET SCORING
# ─────────────────────────────────────────────────────────────────────────────
def price_score(b2b_price: float) -> int:
    if b2b_price >= 1000:  return 40
    elif b2b_price >= 750: return 30
    elif b2b_price >= 500: return 20
    elif b2b_price >= 350: return 10
    return 5


# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 4: GEMINI VISION AI VISUAL FABRIC INSPECTION
# ─────────────────────────────────────────────────────────────────────────────
def gemini_visual_fabric_score(image_path: str) -> Tuple[int, str]:
    """
    Asks Gemini Vision AI to visually assess the garment quality from image.
    Returns (score 0-40, fabric_description).
    """
    try:
        if not image_path or not os.path.exists(image_path):
            return 0, ""

        from config.gemini_client import GeminiVisionClient
        client = GeminiVisionClient()

        with open(image_path, "rb") as f:
            img_bytes = f.read()

        prompt = (
            "Visually inspect this garment/kurti product image and assess its quality. "
            "Look for: fabric sheen (silk/organza vs plain cotton), visible embroidery or handwork, "
            "print richness and resolution, stitching quality, and overall presentation. "
            "Return a JSON with keys: "
            "'visual_quality_score' (int 0-40, where 40=luxury silk/heavy embroidery, 20=premium printed cotton, 5=basic daily wear), "
            "'fabric_type_detected' (str), "
            "'craft_detected' (str), "
            "'quality_tier' (str: 'LUXURY', 'PREMIUM', or 'VOLUME')."
        )

        res = client.extract_structured_json(prompt, img_bytes)
        score = int(res.get("visual_quality_score", 0))
        description = f"{res.get('fabric_type_detected', '')} — {res.get('craft_detected', '')}"
        return min(score, 40), description
    except Exception as e:
        return 0, ""


# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 5: PRODUCTION HUB TRUST SCORE
# ─────────────────────────────────────────────────────────────────────────────
HUB_SCORES = {
    "GUJARAT_SURAT":             15,   # Surat: Premium Rayon, Georgette, Chinon, Chiffon
    "UTTAR_PRADESH_LUCKNOW":     20,   # Lucknow: Chikankari, Zardozi, High Artisanal Value
    "RAJASTHAN_JAIPUR":          12,   # Jaipur: Block Print, Gota Patti, Sanganeri Print
    "WEST_BENGAL_KOLKATA":       10,   # WB: Muslin, Kantha
}


# ─────────────────────────────────────────────────────────────────────────────
# MASTER QUALITY GRADER: Combines all 5 Signals
# ─────────────────────────────────────────────────────────────────────────────
def determine_quality_grade(
    description_text: str,
    b2b_price: float,
    hub_location: str = "RAJASTHAN_JAIPUR",
    image_path: str = "",
    use_gemini_vision: bool = False
) -> Tuple[QualityGrade, int, str]:
    """
    Master Multi-Factor Quality Grader.
    Returns: (QualityGrade, total_score, grading_rationale)
    """
    text = description_text.lower()
    total_score = 0
    rationale = []

    # Signal 1: Fabric Keywords
    fabric_score = sum(v for k, v in FABRIC_SIGNALS.items() if k in text)
    fabric_score = min(fabric_score, 40)  # Cap at 40
    total_score += fabric_score
    if fabric_score > 0:
        matched_fabrics = [k for k in FABRIC_SIGNALS if k in text]
        rationale.append(f"Fabric Signal (+{fabric_score}): {', '.join(matched_fabrics[:3])}")

    # Signal 2: Craft Keywords
    craft_score = sum(v for k, v in CRAFT_SIGNALS.items() if k in text)
    craft_score = min(craft_score, 40)  # Cap at 40
    total_score += craft_score
    if craft_score > 0:
        matched_crafts = [k for k in CRAFT_SIGNALS if k in text]
        rationale.append(f"Craft Signal (+{craft_score}): {', '.join(matched_crafts[:3])}")

    # Signal 3: Price Bracket
    p_score = price_score(b2b_price)
    total_score += p_score
    rationale.append(f"Price Signal (+{p_score}): ₹{b2b_price} wholesale rate")

    # Signal 4: Gemini Vision AI (Optional — used only for 1-off analysis, not bulk)
    vision_score, vision_desc = 0, ""
    if use_gemini_vision and image_path:
        vision_score, vision_desc = gemini_visual_fabric_score(image_path)
        total_score += vision_score
        if vision_desc:
            rationale.append(f"Vision Signal (+{vision_score}): {vision_desc}")

    # Signal 5: Hub Trust Score
    hub_score = HUB_SCORES.get(hub_location, 10)
    total_score += hub_score
    rationale.append(f"Hub Signal (+{hub_score}): {hub_location}")

    # Final Grade Determination (Total score out of max ~160)
    if total_score >= 80:
        grade = QualityGrade.LUXURY_EXPORT_GRADE_AAA
    elif total_score >= 40:
        grade = QualityGrade.BOUTIQUE_PREMIUM_GRADE_AA
    else:
        grade = QualityGrade.VOLUME_COMMERCIAL_GRADE_A

    rationale_str = " | ".join(rationale) + f" | TOTAL SCORE: {total_score}/160"
    return grade, total_score, rationale_str
