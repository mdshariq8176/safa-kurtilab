# scripts/reprocess_all_catalog_images.py
"""
Safa Kurti Lab - Bulk Neural Image Processing & Watermark Removal Engine
Reprocesses all catalog product images in public/images/catalog and public/images/
using RMBG-1.4 Neural Segmentation and Frequency-Aware Texture Inpainting.
"""

import os
import sys
import glob
import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from scripts.etl_pipeline.image_worker import (
    remove_background_and_center,
    neural_inpaint_garment_watermark,
    detect_watermark_or_logo,
    REMBG_AVAILABLE
)

CATALOG_DIR = r"d:\Website\public\images\catalog"
PUBLIC_IMAGES_DIR = r"d:\Website\public\images"
OUTPUT_PROCESSED_DIR = r"d:\Website\public\images\processed"


def generate_watermark_mask(img_np: np.ndarray) -> np.ndarray:
    """
    Generates precision binary mask covering outer margin watermark text and corner logos.
    STRICTLY EXCLUDES human face, hair, and garment body from inpainting.
    """
    h, w, c = img_np.shape
    mask = np.zeros((h, w), dtype=np.uint8)

    # 1. Extreme Margin Boundaries (Top 10% outer sides, Bottom 10% footer)
    margin_top = int(h * 0.10)
    margin_bottom = int(h * 0.90)
    margin_left = int(w * 0.18)
    margin_right = int(w * 0.82)

    # Convert to grayscale & compute gradient for text edges
    gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)

    _, thresh = cv2.threshold(grad, 50, 255, cv2.THRESH_BINARY)

    # Apply mask only to extreme outer corners & bottom footer
    # Top-Left corner
    mask[0:margin_top, 0:margin_left] = thresh[0:margin_top, 0:margin_left]
    # Top-Right corner
    mask[0:margin_top, margin_right:w] = thresh[0:margin_top, margin_right:w]
    # Bottom Footer
    mask[margin_bottom:h, :] = thresh[margin_bottom:h, :]

    # 🛡️ FACE & HEAD PROTECTION ZONE (Upper-Center 28% of height)
    # Zero out inpaint mask in face area so human features are 100% untouched
    face_zone_y2 = int(h * 0.30)
    face_zone_x1 = int(w * 0.20)
    face_zone_x2 = int(w * 0.80)
    mask[0:face_zone_y2, face_zone_x1:face_zone_x2] = 0

    # Dilate remaining mask slightly
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)), iterations=1)
    return mask


def process_single_image(src_path: str, dest_path: str) -> bool:
    try:
        img_bgr = cv2.imread(src_path)
        if img_bgr is None:
            return False

        # Check if watermark is present
        has_watermark = detect_watermark_or_logo(src_path)
        mask = generate_watermark_mask(img_bgr)
        mask_pixel_count = np.sum(mask == 255)

        # 1. Selective Neural Inpainting ONLY if watermark text is present
        if has_watermark and mask_pixel_count > 30:
            clean_bgr = neural_inpaint_garment_watermark(img_bgr, mask)
        else:
            # Preserve 100% original face & crisp image if clean
            clean_bgr = img_bgr

        # Save clean image
        temp_clean_path = dest_path + ".temp.png"
        cv2.imwrite(temp_clean_path, clean_bgr)

        # 2. RMBG-1.4 Neural Background Removal & 3:4 Studio Centering
        success = remove_background_and_center(temp_clean_path, dest_path, target_size=(1200, 1600))

        if os.path.exists(temp_clean_path):
            os.remove(temp_clean_path)

        return success
    except Exception as e:
        print(f"⚠️ Error processing {os.path.basename(src_path)}: {e}")
        return False


def run_bulk_processing():
    os.makedirs(OUTPUT_PROCESSED_DIR, exist_ok=True)

    # Find all images in catalog and public/images
    catalog_files = glob.glob(os.path.join(CATALOG_DIR, "*.[jJ][pP][gG]")) + glob.glob(os.path.join(CATALOG_DIR, "*.[pP][nN][gG]"))
    wa_files = glob.glob(os.path.join(PUBLIC_IMAGES_DIR, "IMG-2026*.[jJ][pP][gG]"))

    all_files = catalog_files + wa_files
    print(f"📸 Found {len(all_files)} total product images to re-process and correct with Neural AI!")
    print(f"✨ Target Output Directory: {OUTPUT_PROCESSED_DIR}")

    success_count = 0
    start_time = os.times().elapsed

    for idx, fpath in enumerate(all_files, 1):
        fname = os.path.basename(fpath)
        base_name, _ = os.path.splitext(fname)
        dest_webp = os.path.join(OUTPUT_PROCESSED_DIR, f"{base_name}.webp")

        if idx % 10 == 0 or idx == len(all_files):
            print(f"  [Progress {idx}/{len(all_files)}] Processing: {fname}...")

        ok = process_single_image(fpath, dest_webp)
        if ok:
            success_count += 1

    print("\n" + "=" * 70)
    print("🎉 SAFA KURTILAB NEURAL IMAGE RE-PROCESSING COMPLETE")
    print("=" * 70)
    print(f"✅ Successfully Corrected & Processed: {success_count} / {len(all_files)} images")
    print(f"🎨 Clean Studio WebP Images Exported To: public/images/processed/")
    print("=" * 70)


if __name__ == "__main__":
    run_bulk_processing()
