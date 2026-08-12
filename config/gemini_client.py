# config/gemini_client.py
"""
Safa Kurti Lab - Gemini Vision API Client Wrapper
Handles connection to Google Gemini 1.5 Flash (Free Tier: 15 RPM limit),
structured JSON extraction, safety settings, and exponential backoff retry logic.
"""

import os
import time
import json

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Load API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-flash-latest")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

# Generation & Safety Configuration
GENERATION_CONFIG = {
    "temperature": 0.2,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048,
    "response_mime_type": "application/json",
}

SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

class GeminiVisionClient:
    def __init__(self, api_key: str = None, model_name: str = MODEL_NAME):
        self.api_key = api_key or GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            os.environ["GOOGLE_API_KEY"] = self.api_key
        
        # Auto-fallback sequence for available Gemini Flash models
        candidate_models = [model_name, "gemini-flash-latest", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-lite-latest"]
        self.model = None
        self.model_name = candidate_models[0]

        for m_name in candidate_models:
            try:
                m = genai.GenerativeModel(
                    model_name=m_name,
                    generation_config=GENERATION_CONFIG,
                    safety_settings=SAFETY_SETTINGS
                )
                # Test generate content to ensure model works
                res = m.generate_content("Ping")
                if res and res.text:
                    self.model = m
                    self.model_name = m_name
                    print(f"🟢 Active Gemini Model Selected: {m_name}")
                    break
            except Exception as ex:
                continue

        if self.model is None:
            # Fallback to base constructor if ping failed
            self.model = genai.GenerativeModel(
                model_name="gemini-flash-latest",
                generation_config=GENERATION_CONFIG,
                safety_settings=SAFETY_SETTINGS
            )

    def extract_structured_json(self, prompt: str, image_bytes: bytes = None, max_retries: int = 3) -> dict:
        """
        Sends prompt + optional image to Gemini Vision AI and extracts structured JSON response.
        Includes automatic rate-limit retry logic (handles 15 RPM Free Tier limits).
        """
        content_payload = [prompt]
        if image_bytes:
            content_payload.append({
                "mime_type": "image/jpeg",
                "data": image_bytes
            })

        for attempt in range(1, max_retries + 1):
            try:
                response = self.model.generate_content(content_payload)
                raw_text = response.text.strip()
                return json.loads(raw_text)
            except Exception as e:
                err_str = str(e).lower()
                if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                    wait_sec = 4 * attempt
                    print(f"⚠️ Gemini 15 RPM Rate Limit hit. Retrying in {wait_sec}s (Attempt {attempt}/{max_retries})...")
                    time.sleep(wait_sec)
                else:
                    if attempt == max_retries:
                        print(f"❌ Gemini API Error after {max_retries} attempts: {e}")
                        return {"error": str(e), "success": False}
                    time.sleep(2)
        return {"error": "Max retries exceeded", "success": False}
