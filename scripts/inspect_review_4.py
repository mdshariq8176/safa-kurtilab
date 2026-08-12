# scripts/inspect_review_4.py
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient
from scripts.etl_pipeline.image_worker import neural_inpaint_garment_watermark, remove_background_and_center
import cv2
import numpy as np

raw_path = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets\review_4_raw.jpg"
proc_path = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets\review_4_proc.webp"

client = GeminiVisionClient()

print("🔍 Auditing review_4_proc.webp with Gemini Vision AI...")
prompt = (
    "Analyze this image very carefully. Search every corner and margin. "
    "Is there any number, text, design code (e.g. 8040 or D.NO-8040), or logo remaining? "
    "Describe exactly where it is located."
)

with open(proc_path, "rb") as f:
    proc_b = f.read()

res = client.extract_structured_json(prompt, proc_b)
print(f"AUDIT RESULT FOR review_4_proc.webp:\n{res}\n")

# Now let's perform precision bottom-left & margin inpainting on review_4_raw.jpg
img = cv2.imread(raw_path)
h, w, c = img.shape

# Mask bottom 15% and left 40% margin explicitly
mask = np.zeros((h, w), dtype=np.uint8)
mask[int(h * 0.82):h, 0:int(w * 0.45)] = 255  # Bottom-left text area
mask[0:int(h * 0.15), 0:int(w * 0.35)] = 255  # Top-left logo area

clean_bgr = neural_inpaint_garment_watermark(img, mask)

temp_clean = proc_path + ".temp.png"
cv2.imwrite(temp_clean, clean_bgr)

# Standardize 3:4 studio canvas
remove_background_and_center(temp_clean, proc_path, target_size=(1200, 1600))
if os.path.exists(temp_clean):
    os.remove(temp_clean)

print("✨ Re-inpainted review_4_proc.webp with targeted bottom-left margin mask!")

# Re-audit
with open(proc_path, "rb") as f:
    proc_b2 = f.read()

res2 = client.extract_structured_json(prompt, proc_b2)
print(f"RE-AUDIT RESULT FOR review_4_proc.webp:\n{res2}")
