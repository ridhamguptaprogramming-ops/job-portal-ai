from abc import ABC, abstractmethod
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class NormalizedJob:
    external_id: str
    title: str
    company_name: str
    location: str
    remote_type: str  # remote, hybrid, onsite
    salary_min: int | None
    salary_max: int | None
    salary_currency: str
    salary_formatted: str
    employment_type: str
    experience_level: str
    experience_years_required: str
    description: str
    responsibilities: List[str]
    requirements: List[str]
    skills: List[str]
    source_name: str
    source_url: str
    posted_at: datetime
    company_overview: str | None = None
    industry: str | None = None

class BaseJobProvider(ABC):
    """
    Abstract Base Class for all external syndicated job providers and feeds.
    Enforces normalized output schema and duplicate detection keys.
    """

    def __init__(self, name: str, is_verified: bool = True):
        self.name = name
        self.is_verified = is_verified

    @abstractmethod
    async def fetch_jobs(self, query: str = "", location: str = "") -> List[NormalizedJob]:
        """Fetch and normalize jobs from this provider."""
        pass

    def generate_dedup_hash(self, job: NormalizedJob) -> str:
        """
        Calculates canonical fingerprint based on normalized company name,
        job title, and normalized location to identify syndicated duplicates.
        """
        norm_company = job.company_name.lower().strip()
        norm_title = job.title.lower().strip()
        norm_location = job.location.lower().strip()
        return f"{norm_company}::{norm_title}::{norm_location}"
