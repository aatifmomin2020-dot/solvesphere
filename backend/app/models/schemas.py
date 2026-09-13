import uuid
import datetime
from typing import Optional, List
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from pydantic import BaseModel, EmailStr
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

# ========================================================
# SQLALCHEMY ORM MODELS
# ========================================================

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="CITIZEN")  # CITIZEN, GOVERNMENT, UNIVERSITY, INDUSTRY
    organization_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class GovernmentProfile(Base):
    __tablename__ = "government_profiles"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    jurisdiction = Column(String, nullable=False)


class University(Base):
    __tablename__ = "universities"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    city = Column(String, nullable=False)
    departments = Column(JSON, default=list)
    domains = Column(JSON, default=list)
    research_areas = Column(JSON, default=list)
    facilities = Column(JSON, default=list)


class Faculty(Base):
    __tablename__ = "faculty"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    department = Column(String, nullable=False)
    expertise = Column(JSON, default=list)
    research_areas = Column(JSON, default=list)


class StudentTeam(Base):
    __tablename__ = "student_teams"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    university_id = Column(String, ForeignKey("universities.id"), nullable=False)
    team_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    skills = Column(JSON, default=list)
    leader_name = Column(String, nullable=False)
    member_count = Column(Integer, default=4)


class IndustryOrganization(Base):
    __tablename__ = "industry_organizations"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    org_name = Column(String, nullable=False)
    industry_domain = Column(String, nullable=False)
    expertise = Column(JSON, default=list)
    support_types = Column(JSON, default=list)
    funding_available_inr = Column(Float, default=0.0)


class Challenge(Base):
    __tablename__ = "challenges"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    sub_category = Column(String, nullable=True)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    severity = Column(String, default="MEDIUM")
    people_affected = Column(Integer, default=100)
    frequency = Column(String, default="Daily")
    evidence_url = Column(String, nullable=True)
    contact_info = Column(String, nullable=True)
    
    priority_score = Column(Float, default=50.0)
    impact_score = Column(Float, default=50.0)
    urgency_score = Column(Float, default=50.0)
    evidence_score = Column(Float, default=50.0)
    priority_level = Column(String, default="MEDIUM")
    ai_confidence = Column(Float, default=0.85)
    embedding_json = Column(JSON, nullable=True)
    
    status = Column(String, default="AI_ANALYZED")
    upvotes_count = Column(Integer, default=1)
    
    citizen_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    citizen = relationship(User, foreign_keys=[citizen_id])


User.challenges = relationship(Challenge, back_populates="citizen", foreign_keys=[Challenge.citizen_id])


class ChallengeDuplicate(Base):
    __tablename__ = "challenge_duplicates"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    duplicate_challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    status = Column(String, default="POTENTIAL_DUPLICATE")


class IndustryOpportunity(Base):
    __tablename__ = "industry_opportunities"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    industry_id = Column(String, ForeignKey("industry_organizations.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    support_type = Column(String, nullable=False)
    budget_inr = Column(Float, default=0.0)
    domains = Column(JSON, default=list)
    location = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="TEAM_FORMED")
    
    university_id = Column(String, ForeignKey("universities.id"), nullable=True)
    faculty_id = Column(String, ForeignKey("faculty.id"), nullable=True)
    student_team_id = Column(String, ForeignKey("student_teams.id"), nullable=True)
    industry_id = Column(String, ForeignKey("industry_organizations.id"), nullable=True)
    gov_officer_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class ProjectMilestone(Base):
    __tablename__ = "project_milestones"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    stage = Column(String, nullable=False)
    status = Column(String, default="PENDING")
    due_date = Column(String, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    proof_url = Column(String, nullable=True)

    project = relationship(Project, foreign_keys=[project_id])


Project.milestones = relationship(ProjectMilestone, back_populates="project", foreign_keys=[ProjectMilestone.project_id])


class ImpactMetric(Base):
    __tablename__ = "impact_metrics"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    citizens_affected = Column(Integer, default=2450)
    incidents_before_monthly = Column(Integer, default=500)
    incidents_after_monthly = Column(Integer, default=120)
    response_time_before_hours = Column(Float, default=72.0)
    response_time_after_hours = Column(Float, default=12.0)
    cost_before_inr = Column(Float, default=500000.0)
    cost_after_inr = Column(Float, default=120000.0)
    user_satisfaction_percent = Column(Float, default=92.0)
    deployment_status = Column(String, default="PILOT_TESTING")
    is_demo_data = Column(Boolean, default=True)

    project = relationship(Project, foreign_keys=[project_id])


Project.impact_metrics = relationship(ImpactMetric, back_populates="project", foreign_keys=[ImpactMetric.project_id])


class CitizenFeedback(Base):
    __tablename__ = "citizen_feedback"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    challenge_id = Column(String, ForeignKey("challenges.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    citizen_id = Column(String, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=False)
    problem_status = Column(String, default="RESOLVED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship(User, foreign_keys=[user_id])


User.notifications = relationship(Notification, back_populates="user", foreign_keys=[Notification.user_id])


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=generate_uuid)
    action = Column(String, nullable=False)
    actor_id = Column(String, nullable=True)
    actor_role = Column(String, nullable=True)
    target_type = Column(String, nullable=False)
    target_id = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


# ========================================================
# PYDANTIC SCHEMAS FOR REST API REQUESTS / RESPONSES
# ========================================================

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "CITIZEN"
    organization_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class ChallengeCreate(BaseModel):
    title: str
    description: str
    category: str
    sub_category: Optional[str] = None
    location_name: str
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0
    severity: Optional[str] = "MEDIUM"
    people_affected: Optional[int] = 100
    frequency: Optional[str] = "Daily"
    evidence_url: Optional[str] = None
    contact_info: Optional[str] = None

class ChallengeVerifyRequest(BaseModel):
    action: Optional[str] = None
    decision: Optional[str] = None
    notes: Optional[str] = None
    official_priority: Optional[str] = None
    priority_reason: Optional[str] = None
    merge_with_id: Optional[str] = None

class FeedbackCreate(BaseModel):
    challenge_id: str
    project_id: Optional[str] = None
    rating: int = 5
    comment: str
    problem_status: str = "RESOLVED"

class MilestoneUpdate(BaseModel):
    milestone_id: str
    status: str
    proof_url: Optional[str] = None
