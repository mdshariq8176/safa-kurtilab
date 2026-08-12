# scripts/inspect_image_with_gemini.py
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.stdout.reconfigure(encoding="utf-8")

from config.gemini_client import GeminiVisionClient

def inspect_images():
    client = GeminiVisionClient()

    raw_path = r"d:\Website\public\images\catalog\CORD_SET_675_179467_JYOTI_WHITE.jpg"
    proc_path = r"d:\Website\public\images\processed\CORD_SET_675_179467_JYOTI_WHITE.webp"

    prompt = (
        "Perform a deep visual audit of this product image. "
        "Search carefully in all 4 corners, margins, and center. "
        "Check if any text, watermark, logo, brand name (e.g. KTC, Kesaria, Kesaria Textile, Jyoti, Surat, Jaipur), "
        "or manufacturer price codes are visible anywhere on the image. "
        "Return a JSON with keys: 'has_watermark' (bool), 'detected_text' (str), 'ktc_kesaria_present' (bool), 'details' (str)."
    )

    print("🔍 Analyzing RAW Wholesaler Image with Gemini Vision AI...")
    if os.path.exists(raw_path):
        with open(raw_path, "rb") as f:
            raw_bytes = f.read()
        raw_res = client.extract_structured_json(prompt, raw_bytes)
        print(f"RAW IMAGE AUDIT RESULT:\n{raw_res}\n")

    print("🔍 Analyzing PROCESSED Studio WebP Image with Gemini Vision AI...")
    if os.path.exists(proc_path):
        with open(proc_path, "rb") as f:
            proc_bytes = f.read()
        proc_res = client.extract_structured_json(prompt, proc_bytes)
        print(f"PROCESSED IMAGE AUDIT RESULT:\n{proc_res}\n")

if __name__ == "__main__":
    inspect_images()
