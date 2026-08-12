# scripts/gemini_bounding_box_inpaint.py
"""
Safa Kurti Lab - Gemini AI Bounding Box Auto-Segmentation & Inpainting Engine
Asks Gemini 1.5/2.5 Flash Vision AI to locate exact 2D bounding boxes [ymin, xmin, ymax, xmax]
of all watermarks, logos, and text overlays, creating pixel-perfect masks with ZERO haziness or smudging.
"""

import os
import sys
import json
import cv2
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient
from scripts.etl_pipeline.image_worker import neural_inpaint_garment_watermark

RAW_PATH = r"d:\Website\public\images\catalog\CORD_SET_675_179467_JYOTI_WHITE.jpg"
PROCESSED_PATH = r"d:\Website\public\images\processed\CORD_SET_675_179467_JYOTI_WHITE.webp"


def gemini_autodetect_bounding_boxes(image_bytes: bytes) -> list:
    """
    Queries Gemini Vision AI to detect exact 2D normalized bounding boxes [0-1000]
    for all watermarks, manufacturer logos, brand stamps, and store text overlays.
    """
    client = GeminiVisionClient()
    prompt = (
        "Locate all watermarks, manufacturer brand logos (e.g. KTC, Kesaria), "
        "text overlays (e.g. KHOOBSURATI), seller codes, and payment stands (G Pay, UPI) in this image. "
        "Return a JSON array named 'watermark_boxes' containing objects with keys: "
        "'label' (str), 'box_2d' (list of 4 integers: [ymin, xmin, ymax, xmax] normalized to 0-1000 scale)."
    )

    try:
        res = client.extract_structured_json(prompt, image_bytes)
        boxes = res.get("watermark_boxes", [])
        if not boxes and isinstance(res, list):
            boxes = res
        return boxes
    except Exception as e:
        print(f"⚠️ Bounding box detection error: {e}")
        return []


def run_gemini_precision_inpaint():
    print("=" * 70)
    print("🎯 GEMINI AI PRECISION BOUNDING BOX AUTO-INPAINTING ENGINE")
    print("=" * 70)

    if not os.path.exists(RAW_PATH):
        return

    with open(RAW_PATH, "rb") as f:
        img_bytes = f.read()

    img_bgr = cv2.imread(RAW_PATH)
    h, w, c = img_bgr.shape

    # 1. Ask Gemini Vision AI for exact 2D bounding boxes
    print("🔍 Asking Gemini Vision AI for exact 2D bounding box coordinates of watermarks & logos...")
    boxes = gemini_autodetect_bounding_boxes(img_bytes)
    print(f"📦 Gemini AI Detected {len(boxes)} Target Watermark Boxes:")

    # 2. Build pixel-perfect mask from Gemini 2D coordinates
    mask = np.zeros((h, w), dtype=np.uint8)

    for box_info in boxes:
        label = box_info.get("label", "watermark")
        b = box_info.get("box_2d")
        if b and len(b) == 4:
            ymin = int((b[0] / 1000.0) * h)
            xmin = int((b[1] / 1000.0) * w)
            ymax = int((b[2] / 1000.0) * h)
            xmax = int((b[3] / 1000.0) * w)

            # Clamp coordinates
            ymin, xmin = max(0, ymin), max(0, xmin)
            ymax, xmax = min(h, ymax), min(w, xmax)

            print(f"  • Found '{label}': Bounding Box [{ymin}, {xmin}, {ymax}, {xmax}]")

            # Check if box is inside Face Protection Zone (Upper Center)
            if ymax < int(h * 0.28) and xmin > int(w * 0.25) and xmax < int(w * 0.75):
                print(f"    🛡️ Protected Face Zone - Skipping inpaint for face features.")
                continue

            # Draw precise mask ONLY over detected box
            mask[ymin:ymax, xmin:xmax] = 255

    # If Gemini auto-detection returned no boxes, use targeted outer corner mask fallback
    if np.sum(mask == 255) == 0:
        print("  ℹ️ Using targeted top-left corner fallback mask...")
        mask[0:int(h * 0.15), 0:int(w * 0.35)] = 255
        # Protect face zone
        mask[0:int(h * 0.30), int(w * 0.22):int(w * 0.78)] = 0

    # 3. Apply Frequency-Aware Inpainting ONLY on the precise Gemini bounding boxes
    print("✨ Running Frequency-Aware Neural Inpainting on Gemini Precision Mask...")
    clean_bgr = neural_inpaint_garment_watermark(img_bgr, mask)

    # 4. Crop right-side store counter (if present) and save crisp studio WebP (1200x1600)
    target_w, target_h = 1200, 1600
    garment_crop = clean_bgr[:, 0:int(w * 0.72)]
    ch, cw, _ = garment_crop.shape

    scale = min(target_w / cw, target_h / ch) * 0.92
    nw, nh = int(cw * scale), int(ch * scale)
    resized = cv2.resize(garment_crop, (nw, nh), interpolation=cv2.INTER_LANCZOS4)

    studio_canvas = np.full((target_h, target_w, 3), (248, 249, 250), dtype=np.uint8)
    ox = (target_w - nw) // 2
    oy = (target_h - nh) // 2
    studio_canvas[oy:oy+nh, ox:ox+nw] = resized

    cv2.imwrite(PROCESSED_PATH, studio_canvas, [int(cv2.IMWRITE_WEBP_QUALITY), 85])
    print(f"✅ Saved Precision Crisp Studio WebP to: {PROCESSED_PATH}")


if __name__ == "__main__":
    run_gemini_precision_inpaint()
