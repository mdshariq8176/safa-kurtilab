# scripts/check_bottom_left_numbers.py
import os
import sys
import glob
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient

def check_bottom_left():
    client = GeminiVisionClient()
    review_dir = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets"
    
    raw_files = sorted(glob.glob(os.path.join(review_dir, "*_raw.jpg")))
    proc_files = sorted(glob.glob(os.path.join(review_dir, "*_proc.webp")))
    
    prompt = (
        "Focus ONLY on the BOTTOM-LEFT CORNER of this image (the bottom-left 25% area). "
        "Is there any number, design code (e.g., D.NO 8013, D.NO 8016, 8026), phone number, or text printed there? "
        "Return a JSON object with keys: 'raw_or_proc' (str), 'number_found' (bool), 'detected_text' (str), 'details' (str)."
    )

    print("🔍 Auditing Bottom-Left Corner of Raw & Processed Image Pairs:\n")
    
    for idx in range(len(raw_files)):
        raw_p = raw_files[idx]
        proc_p = proc_files[idx]
        
        with open(raw_p, "rb") as f:
            raw_b = f.read()
        raw_res = client.extract_structured_json(prompt, raw_b)
        
        with open(proc_p, "rb") as f:
            proc_b = f.read()
        proc_res = client.extract_structured_json(prompt, proc_b)

        print(f"[{idx+1}/10] RAW Bottom-Left: {raw_res}")
        print(f"[{idx+1}/10] PROCESSED Bottom-Left: {proc_res}\n")

if __name__ == "__main__":
    check_bottom_left()
