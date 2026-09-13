import uuid
import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Float, JSON
from app.core.database import Base
from app.models.base import TimestampMixin


class AIAnalysis(Base, TimestampMixin):
    __tablename__ = "ai_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    domain_recommended = Column(String(100), nullable=False)
    sub_domain_recommended = Column(String(100), nullable=True)
    summary_generated = Column(Text, nullable=False)
    keywords_extracted = Column(JSON, default=list)
    confidence_score = Column(Float, default=0.92)
    priority_recommended = Column(String(50), default="HIGH")
    priority_score_breakdown = Column(JSON, default=dict)
    latency_ms = Column(Integer, default=120)
    model_version = Column(String(100), default="sentence-transformers/all-MiniLM-L6-v2 + RuleEngine-v1")
    is_fallback = Column(Boolean, default=False)


class SimilarityResult(Base, TimestampMixin):
    __tablename__ = "similarity_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    target_challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    cosine_similarity = Column(Float, nullable=False)
    decision = Column(String(50), nullable=False)
    geographic_distance_km = Column(Float, nullable=True)


class RecommendationRecord(Base, TimestampMixin):
    __tablename__ = "recommendation_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    university_id = Column(String(36), ForeignKey("universities.id"), nullable=False)
    overall_match_score = Column(Float, nullable=False)
    factor_breakdown_json = Column(JSON, nullable=False)
    algorithm_version = Column(String(50), default="MatchingEngine-v1")
