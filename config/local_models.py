# config/local_models.py
"""
Safa Kurti Lab - Open-Source Local AI Model Loaders
Singleton initializers for rembg (RMBG-1.4 Neural Background Removal),
PaddleOCR Engine, and CLIP (openai/clip-vit-base-patch32 Visual Vector Embeddings).
"""

import sys
from typing import Optional, List

# Singleton Model Cache Instances
_REMBG_SESSION = None
_PADDLE_OCR_ENGINE = None
_CLIP_MODEL = None
_CLIP_PROCESSOR = None


def get_rembg_session():
    """
    Singleton loader for rembg RMBG-1.4 background removal model session.
    Avoids re-loading 170MB weights on every single image call.
    """
    global _REMBG_SESSION
    if _REMBG_SESSION is None:
        try:
            from rembg import new_session
            # Uses RMBG-1.4 state-of-the-art background removal model
            _REMBG_SESSION = new_session("isnet-general-use")
            print("🟢 rembg (RMBG-1.4) Neural Session Loaded Successfully.")
        except Exception as e:
            print(f"⚠️ rembg Session Fallback: {e}")
            _REMBG_SESSION = "DEFAULT"
    return _REMBG_SESSION


def get_paddle_ocr_engine():
    """
    Singleton loader for PaddleOCR local price tag & brand label reader engine.
    """
    global _PADDLE_OCR_ENGINE
    if _PADDLE_OCR_ENGINE is None:
        try:
            from paddleocr import PaddleOCR
            _PADDLE_OCR_ENGINE = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
            print("🟢 PaddleOCR Engine Initialized Successfully.")
        except Exception as e:
            print(f"⚠️ PaddleOCR Fallback (pytesseract/OpenCV mode): {e}")
            _PADDLE_OCR_ENGINE = None
    return _PADDLE_OCR_ENGINE


def get_clip_vector_model():
    """
    Singleton loader for OpenAI CLIP model (clip-vit-base-patch32).
    Returns (model, processor) tuple.
    """
    global _CLIP_MODEL, _CLIP_PROCESSOR
    if _CLIP_MODEL is None or _CLIP_PROCESSOR is None:
        try:
            import torch
            from transformers import CLIPProcessor, CLIPModel
            _CLIP_MODEL = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            _CLIP_PROCESSOR = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            _CLIP_MODEL.eval()
            print("🟢 OpenAI CLIP (ViT-B/32) 512-dim Vector Engine Loaded Successfully.")
        except Exception as e:
            print(f"⚠️ CLIP Vector Model Fallback: {e}")
            _CLIP_MODEL = None
            _CLIP_PROCESSOR = None
    return _CLIP_MODEL, _CLIP_PROCESSOR
