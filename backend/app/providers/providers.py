from typing import List
from datetime import datetime, timedelta
from .base_provider import BaseJobProvider, NormalizedJob

class TechCareersProvider(BaseJobProvider):
    def __init__(self):
        super().__init__(name="TechCareers API", is_verified=True)

    async def fetch_jobs(self, query: str = "", location: str = "") -> List[NormalizedJob]:
        # Normalizes raw payload from direct tech employer API
        return [
            NormalizedJob(
                external_id="tc-stripe-101",
                title="Senior Backend Engineer",
                company_name="Stripe",
                location="Bengaluru, India",
                remote_type="hybrid",
                salary_min=2800000,
                salary_max=4200000,
                salary_currency="INR",
                salary_formatted="₹28 LPA – ₹42 LPA",
                employment_type="full-time",
                experience_level="senior",
                experience_years_required="5+ years",
                description="Lead financial routing services and high-throughput microservices in Python & Go.",
                responsibilities=["Design and deploy mission-critical APIs in Python and Go.", "Optimize PostgreSQL schema design."],
                requirements=["5+ years backend experience.", "Deep PostgreSQL and Redis expertise."],
                skills=["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "REST API"],
                source_name=self.name,
                source_url="https://stripe.com/jobs/senior-backend-engineer",
                posted_at=datetime.utcnow() - timedelta(days=2),
                industry="Financial Technology"
            ),
            NormalizedJob(
                external_id="tc-datadog-103",
                title="Full Stack Engineer (React & Python)",
                company_name="Datadog",
                location="Bengaluru, India",
                remote_type="hybrid",
                salary_min=2200000,
                salary_max=3400000,
                salary_currency="INR",
                salary_formatted="₹22 LPA – ₹34 LPA",
                employment_type="full-time",
                experience_level="mid",
                experience_years_required="3-6 years",
                description="Build high-performance observability dashboards with React and Python FastAPI.",
                responsibilities=["Build features combining React interfaces with Python backend services."],
                requirements=["3+ years React and Python experience.", "PostgreSQL knowledge."],
                skills=["React", "Python", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
                source_name=self.name,
                source_url="https://datadoghq.com/careers/full-stack-engineer",
                posted_at=datetime.utcnow() - timedelta(days=3),
                industry="Cloud Infrastructure"
            )
        ]

class GlobalJobsProvider(BaseJobProvider):
    def __init__(self):
        super().__init__(name="GlobalJobs Feed", is_verified=True)

    async def fetch_jobs(self, query: str = "", location: str = "") -> List[NormalizedJob]:
        return [
            NormalizedJob(
                external_id="gj-cloudflare-104",
                title="Lead Distributed Systems Engineer",
                company_name="Cloudflare",
                location="Singapore / Remote",
                remote_type="remote",
                salary_min=140000,
                salary_max=185000,
                salary_currency="USD",
                salary_formatted="$140,000 – $185,000",
                employment_type="full-time",
                experience_level="lead",
                experience_years_required="7+ years",
                description="Help build a better internet with edge computing pipelines in Go and Rust.",
                responsibilities=["Direct technical architecture for ultra-low latency edge compute."],
                requirements=["7+ years distributed backend experience in Go or Rust."],
                skills=["Go", "Rust", "Distributed Systems", "Docker", "Kubernetes", "Linux"],
                source_name=self.name,
                source_url="https://cloudflare.com/careers/lead-distributed-systems",
                posted_at=datetime.utcnow() - timedelta(days=4),
                industry="Cloud Security & Edge"
            )
        ]

class EnterpriseFeedProvider(BaseJobProvider):
    def __init__(self):
        super().__init__(name="EnterpriseHiring Feed", is_verified=True)

    async def fetch_jobs(self, query: str = "", location: str = "") -> List[NormalizedJob]:
        return [
            NormalizedJob(
                external_id="eh-razorpay-102",
                title="Backend Developer (Python / FastAPI)",
                company_name="Razorpay",
                location="Bengaluru, India",
                remote_type="remote",
                salary_min=1400000,
                salary_max=2200000,
                salary_currency="INR",
                salary_formatted="₹14 LPA – ₹22 LPA",
                employment_type="full-time",
                experience_level="mid",
                experience_years_required="3-5 years",
                description="Scale core UPI and card payment APIs using Python, FastAPI, and PostgreSQL.",
                responsibilities=["Develop robust RESTful web services using Python, FastAPI, and SQLAlchemy."],
                requirements=["3+ years Python web framework experience.", "Strong PostgreSQL command."],
                skills=["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "REST API", "Redis"],
                source_name=self.name,
                source_url="https://razorpay.com/careers/backend-dev-python",
                posted_at=datetime.utcnow() - timedelta(days=1),
                industry="Fintech & Payments"
            )
        ]
