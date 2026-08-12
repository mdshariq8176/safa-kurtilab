# scripts/audit_10_review_images.py
import os
import sys
import glob
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient

def audit_10_images():
    client = GeminiVisionClient()
    review_dir = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets"
    
    proc_files = sorted(glob.glob(os.path.join(review_dir, "*_proc.webp")))
    
    print(f"🔍 Starting Gemini Vision AI Audit on {len(proc_files)} review images...\n")
    
    prompt = (
        "Perform a visual quality audit of this product image. "
        "Check: 1. Is there any visible watermark, text, brand name, or manufacturer code? "
        "2. Is the model's face/hair clear and unblurred? "
        "3. Is the studio background clean? "
        "Return a JSON object with keys: 'clean_background' (bool), 'face_crisp' (bool), 'has_watermark' (bool), 'detected_text' (str), 'overall_verdict' (str)."
    )

    results = []
    for idx, fpath in enumerate(proc_files, 1):
        with open(fpath, "rb") as f:
            img_bytes = f.read()
        res = client.extract_structured_json(prompt, img_bytes)
        filename = os.path.basename(fpath)
        print(f"[{idx}/10] {filename}: {res}")
        results.append({
            "index": idx,
            "filename": filename,
            "audit": res
        })

    with open(os.path.join(review_dir, "audit_summary.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    audit_10_images()
