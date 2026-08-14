# scripts/deep_clean_image.py
"""
Safa Kurti Lab - Deep Neural Image Cleaning & Watermark Eraser Engine
Eliminates center 'KHOOBSURATI' garment text and right-side G-Pay/UPI counter stand.
"""

import os
import sys
import cv2
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient
from scripts.etl_pipeline.image_worker import gemini_auto_inpaint_unknown_watermarks

RAW_PATH = r"d:\Website\public\images\catalog\CORD_SET_675_179467_JYOTI_WHITE.jpg"
PROCESSED_PATH = r"d:\Website\public\images\processed\CORD_SET_675_179467_JYOTI_WHITE.webp"


def deep_clean_image():
    print("=" * 70)
    print("🧹 DEEP CLEANING: AI BOUNDING BOX SEGMENTATION & REMBG MATTING")
    print("=" * 70)

    if not os.path.exists(RAW_PATH):
        print(f"❌ Input path not found: {RAW_PATH}")
        return

    success = gemini_auto_inpaint_unknown_watermarks(RAW_PATH, PROCESSED_PATH)
    if success:
        print(f"✅ Saved Deep-Cleaned Studio WebP to: {PROCESSED_PATH}")

    # 5. Verify with Gemini Vision AI
    print("\n🔍 Running Gemini Vision AI Final Verification Audit...")
    client = GeminiVisionClient()
    prompt = (
        "Analyze this product image carefully. "
        "Is there ANY remaining watermark, logo, text, brand name (KTC, Kesaria, Khoobsurati), "
        "G Pay, UPI stand, or store text visible anywhere? "
        "Return a JSON with keys: 'has_watermark' (bool), 'detected_text' (str), 'ktc_kesaria_present' (bool), 'details' (str)."
    )

    with open(PROCESSED_PATH, "rb") as f:
        proc_bytes = f.read()

    res = client.extract_structured_json(prompt, proc_bytes)
    print("\n" + "=" * 70)
    print("📊 GEMINI VISION AI AUDIT RESULT FOR DEEP-CLEANED ASSET:")
    print("=" * 70)
    import json
    print(json.dumps(res, indent=2))
    print("=" * 70)


if __name__ == "__main__":
    deep_clean_image()
