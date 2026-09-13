import uuid
import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Float, JSON
from app.core.database import Base
from app.models.base import TimestampMixin


class Challenge(Base, TimestampMixin):
    __tablename__ = "challenges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    domain = Column(String(100), nullable=False, default="Environment")
    sub_domain = Column(String(100), nullable=True)
    
    ai_priority_score = Column(Float, default=0.5)
    official_priority = Column(String(50), default="MEDIUM")
    priority_reason = Column(Text, nullable=True)
    
    status = Column(String(50), default="SUBMITTED", index=True, nullable=False)
    
    district = Column(String(100), nullable=False, index=True)
    locality = Column(String(150), nullable=True)
    approx_latitude = Column(Float, nullable=True)
    approx_longitude = Column(Float, nullable=True)
    precise_latitude = Column(Float, nullable=True)
    precise_longitude = Column(Float, nullable=True)
    
    affected_population = Column(Integer, default=100)
    severity_level = Column(String(50), default="MODERATE")
    frequency = Column(String(50), default="OCCASIONAL")
    
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    is_anonymous = Column(Boolean, default=False)
    
    assigned_department = Column(String(255), nullable=True)
    assigned_officer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    verified_at = Column(DateTime, nullable=True)
    verified_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    is_demo = Column(Boolean, default=True)


class ChallengeMedia(Base, TimestampMixin):
    __tablename__ = "challenge_media"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_hash_sha256 = Column(String(64), nullable=False)
    scan_status = Column(String(50), default="NOT_SCANNED")
    file_size_bytes = Column(Integer, nullable=False)


class ChallengeStatusHistory(Base):
    __tablename__ = "challenge_status_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class ChallengeFeedback(Base, TimestampMixin):
    __tablename__ = "challenge_feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    citizen_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    rating = Column(Integer, nullable=False)
    is_resolved = Column(String(20), default="YES")
    comment = Column(Text, nullable=True)


try:
    from pgvector.sqlalchemy import Vector
    PGVECTOR_AVAILABLE = True
except ImportError:
    Vector = None
    PGVECTOR_AVAILABLE = False


class ChallengeEmbedding(Base, TimestampMixin):
    __tablename__ = "challenge_embeddings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), unique=True, nullable=False)
    embedding = Column(Vector(384), nullable=True) if Vector is not None else Column(JSON, nullable=True)
    embedding_json = Column(JSON, nullable=False)
    model_name = Column(String(100), default="all-MiniLM-L6-v2")

