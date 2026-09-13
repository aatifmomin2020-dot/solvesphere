import hashlib
import uuid
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "pdf": "application/pdf"
}

MAGIC_BYTES = {
    "image/jpeg": [b"\xFF\xD8\xFF"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
    "application/pdf": [b"%PDF"]
}

MAX_FILE_SIZES = {
    "image/jpeg": 5 * 1024 * 1024, # 5MB
    "image/png": 5 * 1024 * 1024,
    "image/webp": 5 * 1024 * 1024,
    "application/pdf": 10 * 1024 * 1024 # 10MB
}

def validate_uploaded_file(file: UploadFile, content: bytes) -> dict:
    """
    Validates uploaded file:
    1. Extension check
    2. Size check
    3. Magic bytes signature verification
    4. SHA-256 Hash digest calculation
    5. Malware scan status tagging (NOT_SCANNED for Dev Mode)
    """
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension '.{ext}'. Allowed: jpg, jpeg, png, webp, pdf")

    mime_type = ALLOWED_EXTENSIONS[ext]
    max_size = MAX_FILE_SIZES.get(mime_type, 5 * 1024 * 1024)

    if len(content) > max_size:
        raise HTTPException(status_code=400, detail=f"File size ({len(content)} bytes) exceeds maximum allowed limit ({max_size} bytes)")

    # Check magic bytes signature
    signatures = MAGIC_BYTES.get(mime_type, [])
    is_valid_magic = any(content.startswith(sig) for sig in signatures)
    if not is_valid_magic:
        raise HTTPException(status_code=400, detail="Security Error: File content header signature does not match claimed file extension.")

    # Calculate SHA-256 Hash
    file_hash = hashlib.sha256(content).hexdigest()

    return {
        "filename": file.filename,
        "extension": ext,
        "mime_type": mime_type,
        "size_bytes": len(content),
        "sha256_hash": file_hash,
        "scan_status": "NOT_SCANNED (Dev Mode)",
        "storage_key": f"uploads/{uuid.uuid4().hex}.{ext}"
    }
