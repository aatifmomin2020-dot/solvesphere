import uuid
import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Integer, JSON
from app.core.database import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    primary_role = Column(String(50), nullable=False, default="CITIZEN")
    organization_id = Column(String(36), nullable=True)

    is_demo = Column(Boolean, default=False)


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)


class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_name = Column(String(50), nullable=False)


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    org_type = Column(String(50), nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=True)
    metadata_json = Column(JSON, nullable=True)


class University(Base, TimestampMixin):
    __tablename__ = "universities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    nirf_rank = Column(Integer, nullable=True)
    location_district = Column(String(100), nullable=False)
    facilities_json = Column(JSON, default=list)
    capacity_projects = Column(Integer, default=10)
    is_demo = Column(Boolean, default=True)


class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    university_id = Column(String(36), ForeignKey("universities.id"), nullable=False)
    name = Column(String(255), nullable=False)
    domain_focus = Column(String(100), nullable=False)
    head_faculty_name = Column(String(255), nullable=True)


class Faculty(Base, TimestampMixin):
    __tablename__ = "faculty"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    designation = Column(String(100), nullable=False)
    research_areas = Column(JSON, default=list)
    is_available = Column(Boolean, default=True)


class StudentTeam(Base, TimestampMixin):
    __tablename__ = "student_teams"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    university_id = Column(String(36), ForeignKey("universities.id"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    team_name = Column(String(255), nullable=False)
    faculty_mentor_id = Column(String(36), ForeignKey("faculty.id"), nullable=False)


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("student_teams.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role_in_team = Column(String(50), default="MEMBER")


class IndustryOrganization(Base, TimestampMixin):
    __tablename__ = "industry_organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    industry_sector = Column(String(100), nullable=False)
    offering_types = Column(JSON, default=list)
    is_demo = Column(Boolean, default=True)
