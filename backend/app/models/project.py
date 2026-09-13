import uuid
import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, Float, JSON
from app.core.database import Base
from app.models.base import TimestampMixin


class Proposal(Base, TimestampMixin):
    __tablename__ = "proposals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String(36), ForeignKey("challenges.id"), nullable=False)
    team_id = Column(String(36), ForeignKey("student_teams.id"), nullable=False)
    university_id = Column(String(36), ForeignKey("universities.id"), nullable=False)
    faculty_mentor_id = Column(String(36), ForeignKey("faculty.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    problem_interpretation = Column(Text, nullable=False)
    proposed_solution = Column(Text, nullable=False)
    technical_architecture = Column(Text, nullable=False)
    estimated_timeline_weeks = Column(Integer, default=12)
    budget_estimate_inr = Column(Float, default=250000.0)
    
    status = Column(String(50), default="SUBMITTED")
    government_reviewer_notes = Column(Text, nullable=True)


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=False)
    challenge_id = Column(String(36), ForeignKey("challenges.id"), nullable=False)
    university_id = Column(String(36), ForeignKey("universities.id"), nullable=False)
    team_id = Column(String(36), ForeignKey("student_teams.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    stage = Column(String(50), default="ACTIVE", index=True, nullable=False)
    progress_percentage = Column(Integer, default=10)
    
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    target_completion_date = Column(DateTime, nullable=True)
    deployed_at = Column(DateTime, nullable=True)
    
    is_delayed = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=True)


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False)


class Partnership(Base, TimestampMixin):
    __tablename__ = "partnerships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    industry_id = Column(String(36), ForeignKey("industry_organizations.id"), nullable=False)
    
    contribution_types = Column(JSON, default=list)
    funding_amount_inr = Column(Float, default=150000.0)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="ACCEPTED")
    is_demo = Column(Boolean, default=True)


class Milestone(Base, TimestampMixin):
    __tablename__ = "milestones"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sequence_order = Column(Integer, nullable=False)
    
    due_date = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="NOT_STARTED", index=True, nullable=False)
    completion_percentage = Column(Integer, default=0)
    evidence_url = Column(String(500), nullable=True)


class ImpactMetric(Base, TimestampMixin):
    __tablename__ = "impact_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    people_reached = Column(Integer, default=2450)
    incident_reduction_percentage = Column(Float, default=76.0)
    time_saved_hours_per_month = Column(Float, default=140.0)
    cost_saved_inr = Column(Float, default=450000.0)
    environmental_score = Column(String(50), default="REDUCED_FLOODING_90%")
    is_demo = Column(Boolean, default=True)
