# scripts/final_10_image_check.py
import os
import sys
import glob
import time
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient

def final_check():
    client = GeminiVisionClient()
    review_dir = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets"
    
    proc_files = sorted(glob.glob(os.path.join(review_dir, "*_proc.webp")))
    
    print(f"🔍 Running Final Gemini Vision AI Audit on All {len(proc_files)} Review Assets:\n")
    
    prompt = (
        "Perform a thorough visual quality check of this product asset. "
        "Check: 1. Is there ANY visible watermark, logo, brand name, design code (e.g. 8040, 8026), or phone number? "
        "2. Is the background clean? "
        "Return a JSON with keys: 'has_watermark_or_text' (bool), 'detected_text' (str), 'background_clean' (bool), 'status' (str)."
    )

    results = []
    for idx, fpath in enumerate(proc_files, 1):
        filename = os.path.basename(fpath)
        with open(fpath, "rb") as f:
            img_bytes = f.read()
        res = client.extract_structured_json(prompt, img_bytes)
        print(f"  [{idx}/10] {filename}: {res}")
        results.append({
            "index": idx,
            "filename": filename,
            "result": res
        })
        time.sleep(1.5)

    print("\n✅ Final Audit Execution Finished!")

if __name__ == "__main__":
    final_check()
