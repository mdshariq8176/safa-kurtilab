# scripts/prepare_10_review_images.py
import os
import shutil
import glob
import cv2
import sys
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")

DEST_DIR = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets"
os.makedirs(DEST_DIR, exist_ok=True)

CATALOG_DIR = r"d:\Website\public\images\catalog"
PROCESSED_DIR = r"d:\Website\public\images\processed"

# Select 10 diverse catalog images
catalog_files = sorted(glob.glob(os.path.join(CATALOG_DIR, "*.[jJ][pP][gG]")))[:10]

print(f"📦 Selected {len(catalog_files)} images for review artifact:")

items = []
for idx, cfile in enumerate(catalog_files, 1):
    fname = os.path.basename(cfile)
    bname, _ = os.path.splitext(fname)
    pfile = os.path.join(PROCESSED_DIR, f"{bname}.webp")

    # If processed webp doesn't exist, generate standard studio webp
    if not os.path.exists(pfile):
        from scripts.etl_pipeline.image_worker import remove_background_and_center
        remove_background_and_center(cfile, pfile)

    raw_dest = os.path.join(DEST_DIR, f"review_{idx}_raw.jpg")
    proc_dest = os.path.join(DEST_DIR, f"review_{idx}_proc.webp")

    shutil.copy(cfile, raw_dest)
    shutil.copy(pfile, proc_dest)

    items.append({
        "index": idx,
        "filename": fname,
        "raw_dest": raw_dest,
        "proc_dest": proc_dest
    })
    print(f"  [{idx}/10] Prepared: {fname}")

print("\n✅ All 10 review image pairs copied to artifact directory!")
