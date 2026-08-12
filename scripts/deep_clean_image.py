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
from scripts.etl_pipeline.image_worker import neural_inpaint_garment_watermark

RAW_PATH = r"d:\Website\public\images\catalog\CORD_SET_675_179467_JYOTI_WHITE.jpg"
PROCESSED_PATH = r"d:\Website\public\images\processed\CORD_SET_675_179467_JYOTI_WHITE.webp"


def deep_clean_image():
    print("=" * 70)
    print("🧹 DEEP CLEANING: KHOOBSURATI CENTER TEXT & G-PAY COUNTER STAND")
    print("=" * 70)

    img = cv2.imread(RAW_PATH)
    if img is None:
        return
    h, w, c = img.shape

    # 1. Mask Top-Left KTC Kesaria Logo (Top 22%, Left 40%)
    mask = np.zeros((h, w), dtype=np.uint8)
    mask[0:int(h * 0.22), 0:int(w * 0.40)] = 255

    # 2. Mask Center 'KHOOBSURATI' Tunic Overlay (y: 35% -> 60%, x: 30% -> 70%)
    # Inpaint semi-transparent watermark text over garment using Frequency Inpainting
    mask[int(h * 0.35):int(h * 0.60), int(w * 0.30):int(w * 0.70)] = 255

    # 3. Mask Right-side G-Pay / UPI Payment Counter Stand (Right 35%, y: 30% -> 80%)
    mask[int(h * 0.30):int(h * 0.85), int(w * 0.65):w] = 255

    # Run Deep Neural & Frequency-Aware Texture Inpainting
    print("✨ Running Frequency-Aware Neural Inpainting across Watermarks & Store Counter...")
    clean_bgr = neural_inpaint_garment_watermark(img, mask)

    # 4. Create Studio Background Frame (1200x1600 WebP)
    # Crop model region (Center-Left) and place on clean #F8F9FA Studio Background
    garment_crop = clean_bgr[:, 0:int(w * 0.70)]  # Exclude extreme right store counter
    ch, cw, _ = garment_crop.shape

    # Fit into 1200x1600 studio frame
    target_w, target_h = 1200, 1600
    scale = min(target_w / cw, target_h / ch) * 0.90
    nw, nh = int(cw * scale), int(ch * scale)
    resized_garment = cv2.resize(garment_crop, (nw, nh), interpolation=cv2.INTER_LANCZOS4)

    # Light studio background (#F8F9FA)
    studio_canvas = np.full((target_h, target_w, 3), (250, 249, 248), dtype=np.uint8)
    offset_x = (target_w - nw) // 2
    offset_y = (target_h - nh) // 2
    studio_canvas[offset_y:offset_y+nh, offset_x:offset_x+nw] = resized_garment

    # Save final cleaned WebP
    cv2.imwrite(PROCESSED_PATH, studio_canvas, [int(cv2.IMWRITE_WEBP_QUALITY), 85])
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
