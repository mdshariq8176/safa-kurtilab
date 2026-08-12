# config/storage_client.py
"""
Safa Kurti Lab - Cloudflare R2 Object Storage Client
Configures S3-compatible boto3 client for Cloudflare R2 free tier storage (10GB / 10M requests).
Uploads optimized WebP assets and returns public CDN URLs.
"""

import os
try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False
    BotoCoreError = Exception
    ClientError = Exception

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "mock_account_id")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "mock_access_key")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "mock_secret_key")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "safa-kurtilab-cdn")
R2_PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN", "https://cdn.safakurtilab.com").rstrip("/")


class CloudflareR2StorageClient:
    def __init__(self):
        self.account_id = R2_ACCOUNT_ID
        self.bucket_name = R2_BUCKET_NAME
        self.public_domain = R2_PUBLIC_DOMAIN

        # R2 Endpoint S3 format
        self.endpoint_url = f"https://{self.account_id}.r2.cloudflarestorage.com"
        
        self.is_configured = bool(
            R2_ACCOUNT_ID != "mock_account_id" and
            R2_ACCESS_KEY_ID != "mock_access_key" and
            R2_SECRET_ACCESS_KEY != "mock_secret_key"
        )

        self.s3_client = None
        if self.is_configured and BOTO3_AVAILABLE:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    endpoint_url=self.endpoint_url,
                    aws_access_key_id=R2_ACCESS_KEY_ID,
                    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
                    region_name="auto"
                )
            except Exception as e:
                print(f"⚠️ R2 Storage Init Warning: {e}")

    def upload_webp_to_r2(self, file_bytes: bytes, file_name: str, content_type: str = "image/webp") -> str:
        """
        Uploads raw file bytes to Cloudflare R2 bucket and returns public CDN URL.
        """
        clean_filename = os.path.basename(file_name)
        object_key = f"products/{clean_filename}"

        if self.is_configured and self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=object_key,
                    Body=file_bytes,
                    ContentType=content_type
                )
                return f"{self.public_domain}/{object_key}"
            except (BotoCoreError, ClientError) as e:
                print(f"⚠️ R2 Upload Error: {e}. Falling back to domain URL.")

        # Development Fallback CDN URL
        return f"https://safa-kurtilab-bivv.vercel.app/images/processed/{clean_filename}"
