import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint,
    Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    email_verified = Column(Boolean, default=False)
    display_name = Column(String(255), nullable=True)
    photo_url = Column(String(512), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    onboarding_completed = Column(Boolean, default=False)
    terms_accepted = Column(Boolean, default=False)
    terms_version = Column(String(50), nullable=True)
    terms_accepted_at = Column(DateTime, nullable=True)
    last_login_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    resumes = relationship("Resume", back_populates="user")
    saved_jobs = relationship("SavedJob", back_populates="user")
    applications = relationship("Application", back_populates="user")
    alerts = relationship("JobAlert", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    connected_accounts = relationship("ConnectedAccount", back_populates="user", cascade="all, delete-orphan")
    consents = relationship("UserConsent", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    headline = Column(String(255))
    location = Column(String(255))
    about = Column(Text)
    phone = Column(String(50))
    github_url = Column(String(255))
    linkedin_url = Column(String(255))
    portfolio_url = Column(String(255))
    preferences = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50))
    file_path = Column(String(512))
    raw_text = Column(Text)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False)

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), unique=True)
    current_role = Column(String(255))
    experience_level = Column(String(50))
    years_of_experience = Column(Integer)
    skills = Column(JSONB, default={})
    experience = Column(JSONB, default=[])
    education = Column(JSONB, default=[])
    projects = Column(JSONB, default=[])
    recommended_roles = Column(JSONB, default=[])
    completeness_score = Column(Integer, default=80)
    insights = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analysis")

class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    source_type = Column(String(50))  # api, feed, ats
    website = Column(String(255))
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    normalized_name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True)
    logo_url = Column(String(512), nullable=True)
    logo_source = Column(String(50), default="official")  # official, provider, licensed, verified_external, cached
    website_url = Column(String(255), nullable=True)
    domain = Column(String(255), nullable=True, index=True)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    headquarters = Column(String(255), nullable=True)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    jobs = relationship("Job", back_populates="company")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey("job_sources.id"), nullable=True)
    external_job_id = Column(String(255), nullable=True, index=True)
    source_name = Column(String(100), nullable=True)
    source_url = Column(String(512), nullable=True)
    application_url = Column(String(512), nullable=True)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    title = Column(String(255), nullable=False, index=True)
    location = Column(String(255), index=True)
    remote_type = Column(String(50), index=True)  # remote, hybrid, onsite
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    salary_currency = Column(String(10), default="INR")
    salary_formatted = Column(String(100))
    employment_type = Column(String(50), index=True)  # full-time, contract, internship, apprenticeship, fellowship, graduate
    experience_level = Column(String(50), index=True)  # entry, mid, senior, lead
    experience_years_required = Column(String(50))
    description = Column(Text, nullable=False)
    responsibilities = Column(JSONB, default=[])
    requirements = Column(JSONB, default=[])
    skills = Column(JSONB, default=[])
    external_url = Column(String(512))
    duplicate_of_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    source_count = Column(Integer, default=1)
    status = Column(String(50), default="active")  # active, expired, removed, verification_failed
    is_active = Column(Boolean, default=True)
    is_verified_source = Column(Boolean, default=True)
    posted_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="jobs")

    __table_args__ = (
        Index("idx_jobs_search", "title", "location", "remote_type", "experience_level"),
    )

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")

class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    status = Column(String(50), default="applied", index=True)  # saved, applied, screening, interview, offer, rejected
    applied_date = Column(DateTime, default=datetime.utcnow)
    interview_date = Column(DateTime, nullable=True)
    notes = Column(Text)
    salary_offer = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")

class JobAlert(Base):
    __tablename__ = "job_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    keywords = Column(String(255))
    location = Column(String(255))
    remote_only = Column(Boolean, default=False)
    experience_level = Column(String(50))
    frequency = Column(String(50), default="daily")  # daily, weekly
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50))
    job_id = Column(UUID(as_uuid=True), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class ConnectedAccount(Base):
    __tablename__ = "connected_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # 'linkedin', 'github', 'naukri', etc.
    provider_user_id = Column(String(255), nullable=True)
    provider_username = Column(String(255), nullable=True)
    access_token_encrypted = Column(Text, nullable=True)
    refresh_token_encrypted = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    scopes = Column(JSONB, default=[])
    profile_url = Column(String(512), nullable=True)
    connected_at = Column(DateTime, default=datetime.utcnow)
    last_synced_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="connected")  # 'connected', 'disconnected', 'error'
    summary_data = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="connected_accounts")

    __table_args__ = (
        UniqueConstraint("user_id", "provider", name="uq_user_provider"),
    )

class UserConsent(Base):
    __tablename__ = "user_consents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False)  # 'terms_and_conditions', 'privacy_policy'
    document_version = Column(String(50), nullable=False)  # e.g. '2026-10-01'
    accepted_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(Text, nullable=True)

    user = relationship("User", back_populates="consents")

class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_type = Column(String(50), nullable=False, index=True)  # 'terms_and_conditions', 'privacy_policy'
    version = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    published_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    details = Column(JSONB, default={})
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
