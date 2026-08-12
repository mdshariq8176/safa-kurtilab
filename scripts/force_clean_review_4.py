# scripts/force_clean_review_4.py
import cv2
import numpy as np
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from scripts.etl_pipeline.image_worker import neural_inpaint_garment_watermark
from config.gemini_client import GeminiVisionClient

proc_path = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets\review_4_proc.webp"

img = cv2.imread(proc_path)
h, w, c = img.shape

# Zero out bottom 18% margin (replace with studio background #F8F9FA)
img[int(h * 0.82):h, :] = (248, 249, 250)

# Zero out top 10% margin
img[0:int(h * 0.10), :] = (248, 249, 250)

cv2.imwrite(proc_path, img, [int(cv2.IMWRITE_WEBP_QUALITY), 85])
print("✅ Force-cleared bottom & top margins of review_4_proc.webp!")

client = GeminiVisionClient()
prompt = "Is there ANY text, number (e.g. 8026, 8040), or watermark remaining in this image? Answer JSON with 'has_text' (bool) and 'text' (str)."

with open(proc_path, "rb") as f:
    b = f.read()

res = client.extract_structured_json(prompt, b)
print(f"VERIFICATION RESULT:\n{res}")
