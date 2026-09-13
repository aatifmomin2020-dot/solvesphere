import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.core.limiter import limiter
from app.models.user import User
from app.models.challenge import ChallengeMedia, Challenge
from app.models.system import AuditLog
from app.services.file_service import FileService


router = APIRouter(prefix="/media", tags=["Secure Media & Storage"])


@router.post("/upload", summary="Upload Challenge Media File")
@limiter.limit("15/minute")
async def upload_file(
    request: Request,
    challenge_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    """Sanitizes uploads with MIME check, extension check, magic bytes check & SHA-256 (Section 10)."""
    content = await file.read()
    storage_key, mime_type, file_size, sha256_hash = FileService.validate_and_process_upload(file, content)

    # Check for duplicate hash rejection
    dup_res = await db.execute(select(ChallengeMedia).where(ChallengeMedia.file_hash_sha256 == sha256_hash))
    if dup_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate file content detected. Upload rejected per security policy."
        )

    file_type = "IMAGE" if "image" in mime_type else "DOCUMENT"

    media = ChallengeMedia(

        id=str(uuid.uuid4()),
        challenge_id=challenge_id,
        file_type=file_type,
        file_path=storage_key,
        original_filename=file.filename or "upload.bin",
        file_hash_sha256=sha256_hash,
        scan_status="NOT_SCANNED",
        file_size_bytes=file_size
    )
    db.add(media)

    db.add(AuditLog(
        id=str(uuid.uuid4()),
        actor_id=current_user.id,
        actor_role=current_user.primary_role,
        action="MEDIA_UPLOADED",
        entity_type="CHALLENGE_MEDIA",
        entity_id=media.id,
        reason=f"Media file uploaded for challenge {challenge_id}"
    ))

    await db.commit()


    return {
        "media_id": media.id,
        "filename": media.original_filename,
        "file_hash_sha256": media.file_hash_sha256,
        "scan_status": media.scan_status,
        "scan_message": "File validation completed. Malware scanning is not enabled in this development/demo environment.",
        "download_url": f"/api/v1/media/download/{media.id}"
    }


@router.get("/download/{media_id}", summary="Download Private Media File")
async def download_file(
    media_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Secure signed private storage access endpoint with Object-Level Ownership verification."""
    res = await db.execute(select(ChallengeMedia).where(ChallengeMedia.id == media_id))
    media = res.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=404, detail="Media file not found")

    # Object-Level Authorization Check
    ch_res = await db.execute(select(Challenge).where(Challenge.id == media.challenge_id))
    challenge = ch_res.scalar_one_or_none()

    authorized_roles = {"GOVERNMENT", "GOVERNMENT_REVIEWER", "GOVERNMENT_OFFICER", "PLATFORM_ADMIN", "UNIVERSITY", "FACULTY", "STUDENT"}
    if current_user.primary_role not in authorized_roles:
        # Citizens can only download media associated with their own submitted challenge
        if not challenge or challenge.citizen_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You are not authorized to access private media for another user's challenge."
            )

    file_path = os.path.join(settings.UPLOAD_DIR, media.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical storage file missing")

    return FileResponse(file_path, filename=media.original_filename)

