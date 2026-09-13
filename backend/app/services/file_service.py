import os
import io
import hashlib
import uuid
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
from app.core.config import settings
from app.core.logging import logger

ALLOWED_IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
ALLOWED_DOC_TYPES = {"application/pdf": ".pdf"}
MAGIC_BYTES = {
    "image/jpeg": [b"\xFF\xD8\xFF"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
    "application/pdf": [b"%PDF"]
}


class FileService:

    @staticmethod
    def validate_and_process_upload(file: UploadFile, content: bytes) -> Tuple[str, str, int, str]:
        """Validates file magic bytes, MIME type, size, calculates SHA-256, strips EXIF data."""
        # 1. Size Check
        file_size = len(content)
        max_size = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed limit of {settings.MAX_IMAGE_SIZE_MB}MB"
            )

        # 2. MIME & Extension Check
        mime_type = file.content_type
        if mime_type not in ALLOWED_IMAGE_TYPES and mime_type not in ALLOWED_DOC_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file MIME type: '{mime_type}'. Allowed: JPEG, PNG, WEBP, PDF."
            )

        # 3. Magic Bytes Signature Check
        expected_magics = MAGIC_BYTES.get(mime_type, [])
        is_valid_magic = any(content.startswith(magic) for magic in expected_magics)
        if not is_valid_magic:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content magic bytes signature mismatch. Upload rejected for security reasons."
            )

        # 4. SHA-256 Hashing
        sha256_hash = hashlib.sha256(content).hexdigest()

        # 5. Image EXIF Stripping / Reprocessing
        sanitized_content = content
        if mime_type in ALLOWED_IMAGE_TYPES:
            try:
                img = Image.open(io.BytesIO(content))
                img_data = list(img.getdata())
                clean_img = Image.new(img.mode, img.size)
                clean_img.putdata(img_data)
                out_buffer = io.BytesIO()
                fmt = "JPEG" if mime_type == "image/jpeg" else "PNG" if mime_type == "image/png" else "WEBP"
                clean_img.save(out_buffer, format=fmt)
                sanitized_content = out_buffer.getvalue()
            except Exception as e:
                logger.warning(f"Image EXIF metadata stripping fallback: {e}")

        # 6. Save to Private Storage
        ext = ALLOWED_IMAGE_TYPES.get(mime_type) or ALLOWED_DOC_TYPES.get(mime_type) or ".bin"
        storage_key = f"{uuid.uuid4()}{ext}"
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, storage_key)

        with open(file_path, "wb") as f:
            f.write(sanitized_content)

        return storage_key, mime_type, file_size, sha256_hash
