# scripts/fix_8026_image.py
import cv2
import numpy as np
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient
from scripts.etl_pipeline.image_worker import neural_inpaint_garment_watermark

review_dir = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\831a1df8-4284-4ef5-bc04-f25f078c65c0\review_assets"
raw_3 = os.path.join(review_dir, "review_3_raw.jpg")
proc_3 = os.path.join(review_dir, "review_3_proc.webp")

print("🔍 FIXING LARGE BLACK NUMBER '8026' IN ITEM 3 (CORD_SET_1049_8026):")

img = cv2.imread(raw_3)
h, w, c = img.shape
print(f"  • Image Size: {w}x{h}")

# Mask the large black number '8026' in bottom-left corner (ymin: 75% -> 100%, xmin: 0% -> 38%)
mask = np.zeros((h, w), dtype=np.uint8)
mask[int(h * 0.72):h, 0:int(w * 0.40)] = 255

# Inpaint '8026' number area
clean_bgr = neural_inpaint_garment_watermark(img, mask)

# Format to 3:4 studio canvas (1200x1600 WebP)
target_w, target_h = 1200, 1600
scale = min(target_w / w, target_h / h) * 0.92
nw, nh = int(w * scale), int(h * scale)
resized = cv2.resize(clean_bgr, (nw, nh), interpolation=cv2.INTER_LANCZOS4)

studio_canvas = np.full((target_h, target_w, 3), (248, 249, 250), dtype=np.uint8)
ox = (target_w - nw) // 2
oy = (target_h - nh) // 2
studio_canvas[oy:oy+nh, ox:ox+nw] = resized

cv2.imwrite(proc_3, studio_canvas, [int(cv2.IMWRITE_WEBP_QUALITY), 85])
print(f"✅ Successfully eliminated '8026' number from review_3_proc.webp!")

# Audit with Gemini Vision AI
client = GeminiVisionClient()
prompt = "Analyze the bottom-left corner of this image. Is the number '8026' or any text present? Answer JSON with 'has_8026' (bool) and 'details' (str)."

with open(proc_3, "rb") as f:
    b = f.read()

res = client.extract_structured_json(prompt, b)
print(f"\n📊 GEMINI VISION AI AUDIT FOR ITEM 3:\n{res}")
