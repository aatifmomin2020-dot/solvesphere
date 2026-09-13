import uuid
import secrets
import hashlib
import datetime
from typing import Tuple, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException, status

from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.system import AuditLog
from app.core.security import create_access_token


class AuthService:

    @staticmethod
    def hash_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    @classmethod
    async def create_session_tokens(
        cls, db: AsyncSession, user: User, family_id: Optional[str] = None
    ) -> Tuple[str, str]:
        """Issues new Access Token and persists hashed Refresh Token with family tracking."""
        raw_refresh_token = secrets.token_urlsafe(48)
        token_hash = cls.hash_token(raw_refresh_token)
        fam_id = family_id or str(uuid.uuid4())

        expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=7)

        token_record = RefreshToken(
            id=str(uuid.uuid4()),
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            family_id=fam_id
        )
        db.add(token_record)

        # Audit Log entry
        db.add(AuditLog(
            id=str(uuid.uuid4()),
            actor_id=user.id,
            actor_role=user.primary_role,
            action="USER_LOGIN",
            entity_type="USER",
            entity_id=user.id,
            reason="User authenticated and session tokens issued."
        ))

        await db.commit()

        access_token = create_access_token(data={"sub": user.id, "role": user.primary_role})
        return access_token, raw_refresh_token

    @classmethod
    async def rotate_refresh_token(cls, db: AsyncSession, raw_token: str) -> Dict[str, str]:
        """
        Verifies refresh token, enforces reuse detection family revocation,
        revokes old token, and issues new rotated token pair.
        """
        token_hash = cls.hash_token(raw_token)
        res = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
        token = res.scalar_one_or_none()

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or unrecognized refresh token."
            )

        # Reuse Detection Security Check
        if token.revoked_at is not None:
            # Token Reuse Attack Detected! Revoke entire token family
            await db.execute(
                update(RefreshToken)
                .where(RefreshToken.family_id == token.family_id, RefreshToken.revoked_at == None)
                .values(revoked_at=datetime.datetime.utcnow())
            )
            db.add(AuditLog(
                id=str(uuid.uuid4()),
                actor_id=token.user_id,
                actor_role="UNKNOWN",
                action="SECURITY_TOKEN_REUSE_DETECTED",
                entity_type="REFRESH_TOKEN",
                entity_id=token.id,
                reason="Revoked refresh token presented. Entire token family revoked for security."
            ))
            await db.commit()

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Security Alert: Refresh token reuse detected. All active sessions in this token family have been revoked."
            )

        if token.expires_at < datetime.datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired. Please log in again."
            )

        user_res = await db.execute(select(User).where(User.id == token.user_id))
        user = user_res.scalar_one_or_none()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account inactive or missing.")

        # Revoke presented token
        token.revoked_at = datetime.datetime.utcnow()

        # Issue new rotated token with same family_id
        new_access_token, new_refresh_token = await cls.create_session_tokens(
            db=db, user=user, family_id=token.family_id
        )

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    @classmethod
    async def revoke_session(cls, db: AsyncSession, user_id: str, raw_token: Optional[str] = None):
        """Revokes specific token or all active user tokens during logout."""
        if raw_token:
            token_hash = cls.hash_token(raw_token)
            await db.execute(
                update(RefreshToken)
                .where(RefreshToken.token_hash == token_hash)
                .values(revoked_at=datetime.datetime.utcnow())
            )
        else:
            await db.execute(
                update(RefreshToken)
                .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at == None)
                .values(revoked_at=datetime.datetime.utcnow())
            )

        db.add(AuditLog(
            id=str(uuid.uuid4()),
            actor_id=user_id,
            actor_role="USER",
            action="USER_LOGOUT",
            entity_type="USER",
            entity_id=user_id,
            reason="User logged out and refresh session revoked."
        ))

        await db.commit()
