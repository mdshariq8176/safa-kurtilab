# scripts/reprocess_failed_review_images.py
import os
import sys
import glob

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from scripts.etl_pipeline.image_worker import gemini_auto_inpaint_unknown_watermarks

def fix_review_images():
    review_dir = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets"
    processed_dir = r"d:\Website\public\images\processed"
    
    raw_files = sorted(glob.glob(os.path.join(review_dir, "*_raw.jpg")))
    
    print("🔧 RE-PROCESSING ALL 10 REVIEW IMAGES WITH GEMINI BOUNDING BOX INPAINTER:")
    
    for idx, raw_path in enumerate(raw_files, 1):
        proc_dest = os.path.join(review_dir, f"review_{idx}_proc.webp")
        print(f"  [{idx}/10] Processing: {os.path.basename(raw_path)}...")
        
        # Run universal dynamic inpainter with bottom margin text protection
        ok = gemini_auto_inpaint_unknown_watermarks(raw_path, proc_dest)
        if ok:
            print(f"    ✅ Cleaned and saved: review_{idx}_proc.webp")
        else:
            print(f"    ⚠️ Processing warning for review_{idx}_proc.webp")

if __name__ == "__main__":
    fix_review_images()
