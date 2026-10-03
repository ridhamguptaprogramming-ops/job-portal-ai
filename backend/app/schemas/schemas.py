from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class JobBase(BaseModel):
    title: str
    company_name: str
    location: str
    remote_type: str
    salary_formatted: Optional[str] = None
    employment_type: str
    experience_level: str
    description: str
    responsibilities: List[str] = []
    requirements: List[str] = []
    skills: List[str] = []
    external_url: Optional[str] = None
    source_name: str

class JobResponse(JobBase):
    id: UUID
    posted_at: datetime
    source_count: int = 1
    class Config:
        from_attributes = True

class MatchBreakdown(BaseModel):
    job_id: str
    overall_score: int
    skills_score: int
    experience_score: int
    role_score: int
    location_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    why_matches: str

class ResumeAnalysisResponse(BaseModel):
    candidate_name: str
    current_role: str
    experience_level: str
    years_of_experience: int
    location: str
    summary: str
    skills: Dict[str, List[str]]
    all_skills: List[str]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    recommended_roles: List[str]
    completeness_score: int
    insights: Dict[str, Any]

class ApplicationCreate(BaseModel):
    job_id: UUID
    notes: Optional[str] = None
    status: str = "applied"

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[datetime] = None
    salary_offer: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    status: str
    applied_date: datetime
    interview_date: Optional[datetime] = None
    notes: Optional[str] = None
    updated_at: datetime
    class Config:
        from_attributes = True

class JobAlertCreate(BaseModel):
    title: str
    keywords: Optional[str] = None
    location: Optional[str] = None
    remote_only: bool = False
    experience_level: Optional[str] = None
    frequency: str = "daily"

class JobAlertResponse(JobAlertCreate):
    id: UUID
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True
