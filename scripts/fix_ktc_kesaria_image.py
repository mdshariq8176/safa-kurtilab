# scripts/fix_ktc_kesaria_image.py
"""
Safa Kurti Lab - KTC Kesaria & Full Background Neutralization Engine
Strips 100% of store backgrounds, KTC Kesaria logos, G-Pay stands, and center text overlays.
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient
from scripts.etl_pipeline.image_worker import remove_background_and_center, neural_inpaint_garment_watermark

RAW_PATH = r"d:\Website\public\images\catalog\CORD_SET_675_179467_JYOTI_WHITE.jpg"
PROCESSED_PATH = r"d:\Website\public\images\processed\CORD_SET_675_179467_JYOTI_WHITE.webp"


def clean_ktc_kesaria_image():
    print("=" * 70)
    print("🧹 EXECUTING KTC KESARIA & STORE BACKGROUND NEUTRALIZATION")
    print("=" * 70)

    if not os.path.exists(RAW_PATH):
        print(f"❌ File not found: {RAW_PATH}")
        return

    # 1. Load image
    img = cv2.imread(RAW_PATH)
    h, w, c = img.shape
    print(f"📸 Image Dimensions: {w}x{h}")

    # 2. Build precision mask for Top-Left KTC Kesaria Logo (Top 25%, Left 45%)
    mask = np.zeros((h, w), dtype=np.uint8)
    mask[0:int(h * 0.25), 0:int(w * 0.45)] = 255  # KTC Kesaria logo area
    mask[0:int(h * 0.20), int(w * 0.70):w] = 255  # Right top corner logos

    # Inpaint top logos cleanly
    cleaned_img = neural_inpaint_garment_watermark(img, mask)

    temp_clean = r"d:\Website\public\images\processed\ktc_clean_temp.png"
    cv2.imwrite(temp_clean, cleaned_img)

    # 3. Apply RMBG-1.4 Neural Background Removal to isolate ONLY model & garment
    # This completely eliminates G-Pay counter, UPI stands, factory walls, and store background!
    print("🖼️ Running RMBG-1.4 Neural Matting to eliminate store background & G-Pay counter...")
    remove_background_and_center(temp_clean, PROCESSED_PATH, target_size=(1200, 1600))

    if os.path.exists(temp_clean):
        os.remove(temp_clean)

    print(f"✅ Saved Clean Studio WebP to: {PROCESSED_PATH}")

    # 4. Audit cleaned image with Gemini Vision AI
    print("\n🔍 Running Gemini Vision AI Audit on Newly Processed Image...")
    client = GeminiVisionClient()
    prompt = (
        "Analyze this image carefully. Is there ANY remaining watermark, text, brand name, "
        "KTC, Kesaria, Khoobsurati, G Pay, UPI, or logo visible anywhere? "
        "Return a JSON with keys: 'has_watermark' (bool), 'detected_text' (str), 'ktc_kesaria_present' (bool), 'details' (str)."
    )

    with open(PROCESSED_PATH, "rb") as f:
        proc_bytes = f.read()

    audit_res = client.extract_structured_json(prompt, proc_bytes)
    print("\n" + "=" * 70)
    print("📊 GEMINI VISION AI VERIFICATION RESULT FOR CLEANED IMAGE:")
    print("=" * 70)
    print(json.dumps(audit_res, indent=2))
    print("=" * 70)


if __name__ == "__main__":
    import json
    clean_ktc_kesaria_image()
