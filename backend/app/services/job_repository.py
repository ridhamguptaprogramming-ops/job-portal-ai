from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import joinedload

from ..models.models import Application, Company, Job, Notification, SavedJob, User
from .company_logo_service import CompanyLogoService
from .database import get_session_factory


def _job_record(job: Job) -> Dict[str, Any]:
    company = job.company
    company_name = company.name if company else ""
    resolved_company = CompanyLogoService.resolve_company(
        company_name,
        company.logo_url if company else None,
        company.website_url if company else None,
    )
    company_data = {
        "id": str(company.id) if company else "",
        "name": company_name,
        "normalized_name": company.normalized_name if company else "",
        "slug": company.slug if company else "",
        "logo_url": (company.logo_url if company else None) or resolved_company.get("logo_url"),
        "logo_source": company.logo_source if company and company.logo_url else resolved_company.get("logo_source"),
        "website_url": company.website_url if company else None,
        "domain": company.domain if company else None,
        "description": company.description if company else None,
        "industry": company.industry if company else None,
        "headquarters": company.headquarters if company else None,
        "verified": bool(company.verified) if company else False,
    }
    return {
        "id": str(job.id),
        "external_id": job.external_job_id,
        "title": job.title,
        "company": company_name,
        "company_id": company_data["id"],
        "company_data": company_data,
        "company_logo": company_data["logo_url"],
        "company_website": company_data["website_url"],
        "company_overview": company_data["description"],
        "industry": company_data["industry"],
        "location": job.location,
        "workplace": job.remote_type,
        "remote_type": job.remote_type,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "salary_currency": job.salary_currency,
        "salary_formatted": job.salary_formatted,
        "employment_type": job.employment_type,
        "experience_level": job.experience_level,
        "experience_years_required": job.experience_years_required,
        "description": job.description,
        "responsibilities": job.responsibilities or [],
        "requirements": job.requirements or [],
        "skills": job.skills or [],
        "source": job.source_name,
        "source_url": job.source_url,
        "original_job_url": job.application_url or job.external_url or job.source_url,
        "retrieved_at": job.retrieved_at.isoformat() if job.retrieved_at else None,
        "posted_at": job.posted_at.isoformat() if job.posted_at else None,
        "last_verified_at": job.last_verified_at.isoformat() if job.last_verified_at else None,
        "status": job.status,
        "is_verified": bool(job.is_verified_source),
    }


def _company_record(company: Company) -> Dict[str, Any]:
    resolved = CompanyLogoService.resolve_company(
        company.name,
        company.logo_url,
        company.website_url,
    )
    return {
        "id": str(company.id),
        "name": company.name,
        "normalized_name": company.normalized_name,
        "slug": company.slug,
        "domain": company.domain,
        "logo_url": company.logo_url or resolved.get("logo_url"),
        "logo_source": company.logo_source if company.logo_url else resolved.get("logo_source"),
        "website_url": company.website_url,
        "industry": company.industry,
        "headquarters": company.headquarters,
        "description": company.description,
        "verified": bool(company.verified),
    }


def list_companies() -> list[Dict[str, Any]]:
    sessions = get_session_factory()
    try:
        with sessions() as session:
            return [
                _company_record(company)
                for company in session.scalars(select(Company).order_by(Company.name))
            ]
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Company data is temporarily unavailable.",
        ) from exc


def get_company(company_id: str) -> Optional[Dict[str, Any]]:
    sessions = get_session_factory()
    try:
        with sessions() as session:
            company = session.scalar(
                select(Company).where(
                    or_(
                        Company.slug == company_id,
                        Company.normalized_name == company_id.lower(),
                    )
                )
            )
            if company is None:
                try:
                    company = session.get(Company, UUID(company_id))
                except ValueError:
                    pass
            if company is None:
                return None
            jobs = session.scalars(
                select(Job)
                .options(joinedload(Job.company))
                .where(
                    Job.company_id == company.id,
                    Job.is_active.is_(True),
                    Job.status == "active",
                    Job.is_verified_source.is_(True),
                )
                .order_by(Job.posted_at.desc())
            ).unique().all()
            return {
                "company": _company_record(company),
                "jobs": [_job_record(job) for job in jobs],
                "active_jobs_count": len(jobs),
            }
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Company data is temporarily unavailable.",
        ) from exc


def list_jobs(filters: Dict[str, Any]) -> Dict[str, Any]:
    sessions = get_session_factory()
    try:
        with sessions() as session:
            query = (
                select(Job)
                .options(joinedload(Job.company))
                .where(
                    Job.is_active.is_(True),
                    Job.status == "active",
                    Job.is_verified_source.is_(True),
                )
            )
            term = (filters.get("search") or filters.get("q") or "").strip()
            if term:
                pattern = f"%{term}%"
                query = query.join(Job.company).where(
                    or_(
                        Job.title.ilike(pattern),
                        Company.name.ilike(pattern),
                        Job.description.ilike(pattern),
                        cast(Job.skills, String).ilike(pattern),
                    )
                )

            location = (filters.get("location") or "").strip()
            if location:
                query = query.where(Job.location.ilike(f"%{location}%"))

            workplace = (filters.get("workspace") or filters.get("workplace") or "").strip().lower()
            if workplace and workplace != "all":
                canonical_workplace = "onsite" if workplace in {"on-site", "on site"} else workplace
                query = query.where(func.lower(Job.remote_type).in_([workplace, canonical_workplace]))

            experience = (filters.get("experience") or "").strip()
            if experience and experience.lower() != "any experience":
                query = query.where(func.lower(Job.experience_level) == experience.lower())

            employment_type = (filters.get("employment_type") or "").strip()
            if employment_type and employment_type.lower() != "any employment":
                query = query.where(func.lower(Job.employment_type) == employment_type.lower())

            posted_within_days = filters.get("posted_within_days")
            if posted_within_days:
                query = query.where(Job.posted_at >= datetime.utcnow() - timedelta(days=posted_within_days))

            company_name = (filters.get("company") or "").strip()
            if company_name:
                if not term:
                    query = query.join(Job.company)
                query = query.where(Company.name.ilike(f"%{company_name}%"))

            skills = [value.strip() for value in (filters.get("skills") or "").split(",") if value.strip()]
            for skill in skills:
                query = query.where(cast(Job.skills, String).ilike(f"%{skill}%"))

            minimum_salary = filters.get("salary_min")
            if minimum_salary is not None:
                query = query.where(
                    or_(Job.salary_min >= minimum_salary, Job.salary_max >= minimum_salary)
                )

            maximum_salary = filters.get("salary_max")
            if maximum_salary is not None:
                query = query.where(
                    or_(Job.salary_min <= maximum_salary, Job.salary_max <= maximum_salary)
                )

            total = session.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0
            jobs = session.scalars(
                query.order_by(Job.posted_at.desc(), Job.created_at.desc())
                .offset(filters["offset"])
                .limit(filters["limit"])
            ).unique().all()
            return {
                "jobs": [_job_record(job) for job in jobs],
                "total": total,
                "page": (filters["offset"] // filters["limit"]) + 1,
                "page_size": filters["limit"],
                "total_pages": (total + filters["limit"] - 1) // filters["limit"],
            }
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Job data is temporarily unavailable.",
        ) from exc


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    sessions = get_session_factory()
    try:
        with sessions() as session:
            query = select(Job).options(joinedload(Job.company)).where(
                Job.is_active.is_(True),
                Job.status == "active",
                Job.is_verified_source.is_(True),
            )
            try:
                identifier = UUID(job_id)
                query = query.where(Job.id == identifier)
            except ValueError:
                query = query.where(Job.external_job_id == job_id)
            job = session.scalar(query)
            return _job_record(job) if job else None
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Job data is temporarily unavailable.",
        ) from exc


def get_saved_jobs(firebase_uid: str) -> list[Dict[str, Any]]:
    sessions = get_session_factory()
    try:
        with sessions() as session:
            jobs = session.scalars(
                select(Job)
                .join(SavedJob, SavedJob.job_id == Job.id)
                .join(User, SavedJob.user_id == User.id)
                .options(joinedload(Job.company))
                .where(
                    User.firebase_uid == firebase_uid,
                    Job.is_active.is_(True),
                    Job.status == "active",
                    Job.is_verified_source.is_(True),
                )
                .order_by(SavedJob.created_at.desc())
            ).unique().all()
            return [_job_record(job) for job in jobs]
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Saved jobs are temporarily unavailable.",
        ) from exc


def set_job_saved(firebase_uid: str, job_id: str, saved: bool) -> bool:
    sessions = get_session_factory()
    try:
        job_uuid = UUID(job_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Job not found.") from exc

    try:
        with sessions.begin() as session:
            user = session.scalar(select(User).where(User.firebase_uid == firebase_uid))
            if user is None:
                raise HTTPException(status_code=404, detail="User account not found.")
            job = session.scalar(
                select(Job).where(
                    Job.id == job_uuid,
                    Job.is_active.is_(True),
                    Job.status == "active",
                    Job.is_verified_source.is_(True),
                )
            )
            if job is None:
                raise HTTPException(status_code=404, detail="Job not found.")
            saved_record = session.scalar(
                select(SavedJob).where(
                    SavedJob.user_id == user.id,
                    SavedJob.job_id == job.id,
                )
            )
            if saved and saved_record is None:
                session.add(SavedJob(user_id=user.id, job_id=job.id))
            elif not saved and saved_record is not None:
                session.delete(saved_record)
            return saved
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Saved jobs are temporarily unavailable.",
        ) from exc


def get_applications(firebase_uid: str) -> list[Dict[str, Any]]:
    sessions = get_session_factory()
    try:
        with sessions() as session:
            applications = session.scalars(
                select(Application)
                .join(User, Application.user_id == User.id)
                .options(joinedload(Application.job).joinedload(Job.company))
                .where(User.firebase_uid == firebase_uid)
                .order_by(Application.created_at.desc())
            ).unique().all()
            return [_application_record(application) for application in applications]
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Applications are temporarily unavailable.",
        ) from exc


def _application_record(application: Application) -> Dict[str, Any]:
    job = application.job
    return {
        "id": str(application.id),
        "job_id": str(application.job_id),
        "job_title": job.title if job else "",
        "company": job.company.name if job and job.company else "",
        "job": _job_record(job) if job else None,
        "status": application.status,
        "applied_at": application.applied_date.isoformat() if application.applied_date else None,
        "updated_at": application.updated_at.isoformat() if application.updated_at else None,
        "notes": application.notes,
    }


def create_application(firebase_uid: str, job_id: str, status_value: str, notes: Optional[str]) -> Dict[str, Any]:
    sessions = get_session_factory()
    try:
        job_uuid = UUID(job_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Job not found.") from exc

    try:
        with sessions.begin() as session:
            user = session.scalar(select(User).where(User.firebase_uid == firebase_uid))
            job = session.scalar(
                select(Job).options(joinedload(Job.company)).where(
                    Job.id == job_uuid,
                    Job.is_active.is_(True),
                    Job.status == "active",
                    Job.is_verified_source.is_(True),
                )
            )
            if user is None:
                raise HTTPException(status_code=404, detail="User account not found.")
            if job is None:
                raise HTTPException(status_code=404, detail="Job not found.")
            existing = session.scalar(
                select(Application).where(
                    Application.user_id == user.id,
                    Application.job_id == job.id,
                )
            )
            if existing:
                return _application_record(existing)
            application = Application(
                user_id=user.id,
                job_id=job.id,
                job=job,
                status=status_value,
                notes=notes,
            )
            session.add(application)
            session.flush()
            return _application_record(application)
    except HTTPException:
        raise
    except IntegrityError as exc:
        raise HTTPException(status_code=409, detail="An application for this job already exists.") from exc
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Applications are temporarily unavailable.",
        ) from exc


def update_application_status(
    firebase_uid: str,
    application_id: str,
    status_value: Optional[str],
    notes: Optional[str],
) -> Dict[str, Any]:
    sessions = get_session_factory()
    try:
        application_uuid = UUID(application_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Application not found.") from exc
    try:
        with sessions.begin() as session:
            application = session.scalar(
                select(Application)
                .join(User, Application.user_id == User.id)
                .options(joinedload(Application.job).joinedload(Job.company))
                .where(Application.id == application_uuid, User.firebase_uid == firebase_uid)
            )
            if application is None:
                raise HTTPException(status_code=404, detail="Application not found.")
            if status_value is not None:
                application.status = status_value
            if notes is not None:
                application.notes = notes
            application.updated_at = datetime.utcnow()
            session.flush()
            return _application_record(application)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Applications are temporarily unavailable.",
        ) from exc


def delete_application(firebase_uid: str, application_id: str) -> None:
    sessions = get_session_factory()
    try:
        application_uuid = UUID(application_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Application not found.") from exc
    try:
        with sessions.begin() as session:
            application = session.scalar(
                select(Application)
                .join(User, Application.user_id == User.id)
                .where(Application.id == application_uuid, User.firebase_uid == firebase_uid)
            )
            if application is None:
                raise HTTPException(status_code=404, detail="Application not found.")
            session.delete(application)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Applications are temporarily unavailable.",
        ) from exc


def get_user_dashboard(firebase_uid: str) -> Dict[str, Any]:
    sessions = get_session_factory()
    try:
        with sessions() as session:
            user = session.scalar(select(User).where(User.firebase_uid == firebase_uid))
            if user is None:
                raise HTTPException(status_code=404, detail="User account not found.")
            user_id = user.id
            interviews = session.scalar(
                select(func.count())
                .select_from(Application)
                .where(Application.user_id == user_id, func.lower(Application.status) == "interview")
            ) or 0
            return {
                "metrics": {
                    "recommended": 0,
                    "saved": session.scalar(select(func.count()).select_from(SavedJob).where(SavedJob.user_id == user_id)) or 0,
                    "applications": session.scalar(select(func.count()).select_from(Application).where(Application.user_id == user_id)) or 0,
                    "interviews": interviews,
                    "completion": "100%" if user.onboarding_completed else "0%",
                },
                "user": {"name": user.display_name or user.name, "email": user.email},
            }
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Dashboard data is temporarily unavailable.",
        ) from exc


def get_user_notifications(firebase_uid: str) -> list[Dict[str, Any]]:
    sessions = get_session_factory()
    try:
        with sessions() as session:
            notifications = session.scalars(
                select(Notification)
                .join(User, Notification.user_id == User.id)
                .where(User.firebase_uid == firebase_uid)
                .order_by(Notification.created_at.desc())
            ).all()
            return [
                {
                    "id": str(notification.id),
                    "title": notification.title,
                    "message": notification.message,
                    "notification_type": notification.notification_type,
                    "job_id": str(notification.job_id) if notification.job_id else None,
                    "created_at": notification.created_at.isoformat() if notification.created_at else None,
                    "read": bool(notification.is_read),
                }
                for notification in notifications
            ]
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Notifications are temporarily unavailable.",
        ) from exc


def mark_notification_read(firebase_uid: str, notification_id: str) -> None:
    sessions = get_session_factory()
    try:
        notification_uuid = UUID(notification_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Notification not found.") from exc

    try:
        with sessions.begin() as session:
            notification = session.scalar(
                select(Notification)
                .join(User, Notification.user_id == User.id)
                .where(
                    Notification.id == notification_uuid,
                    User.firebase_uid == firebase_uid,
                )
            )
            if notification is None:
                raise HTTPException(status_code=404, detail="Notification not found.")
            notification.is_read = True
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Notifications are temporarily unavailable.",
        ) from exc


def get_connected_accounts(firebase_uid: str) -> list[Dict[str, Any]]:
    from ..models.models import ConnectedAccount

    sessions = get_session_factory()
    try:
        with sessions() as session:
            records = session.scalars(
                select(ConnectedAccount)
                .join(User, ConnectedAccount.user_id == User.id)
                .where(User.firebase_uid == firebase_uid, ConnectedAccount.status == "connected")
                .order_by(ConnectedAccount.connected_at.desc())
            ).all()
            return [
                {
                    "id": str(record.id),
                    "provider": record.provider,
                    "provider_user_id": record.provider_user_id,
                    "provider_username": record.provider_username,
                    "profile_url": record.profile_url,
                    "connected_at": record.connected_at.isoformat() if record.connected_at else None,
                    "last_synced_at": record.last_synced_at.isoformat() if record.last_synced_at else None,
                    "summary": record.summary_data or {},
                    "status": record.status,
                }
                for record in records
            ]
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connected-account data is temporarily unavailable.",
        ) from exc


def disconnect_connected_account(firebase_uid: str, provider: str) -> None:
    from ..models.models import ConnectedAccount

    sessions = get_session_factory()
    try:
        with sessions.begin() as session:
            record = session.scalar(
                select(ConnectedAccount)
                .join(User, ConnectedAccount.user_id == User.id)
                .where(
                    User.firebase_uid == firebase_uid,
                    ConnectedAccount.provider == provider,
                    ConnectedAccount.status == "connected",
                )
            )
            if record is not None:
                record.status = "disconnected"
                record.access_token_encrypted = None
                record.refresh_token_encrypted = None
                record.updated_at = datetime.utcnow()
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Connected-account data is temporarily unavailable.",
        ) from exc
