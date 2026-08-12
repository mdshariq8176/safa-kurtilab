# config/__init__.py
"""
Safa Kurti Lab Configuration Package
"""
from .gemini_client import GeminiVisionClient
from .storage_client import CloudflareR2StorageClient
from .local_models import get_rembg_session, get_paddle_ocr_engine, get_clip_vector_model
