import os
from datetime import datetime
from threading import Lock
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from sqlalchemy import create_engine, func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from ..models.models import User, UserConsent

_session_factory = None
_session_factory_lock = Lock()


def _sessions() -> sessionmaker[Session]:
    global _session_factory
    if _session_factory is None:
        with _session_factory_lock:
            if _session_factory is None:
                database_url = os.getenv("DATABASE_URL", "").strip()
                if not database_url:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="User storage is not configured.",
                    )
                try:
                    engine = create_engine(database_url, pool_pre_ping=True)
                    _session_factory = sessionmaker(bind=engine, expire_on_commit=False)
                except (SQLAlchemyError, ValueError) as exc:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="User storage could not be initialized.",
                    ) from exc
    return _session_factory


def _as_user_record(user: User) -> Dict[str, Any]:
    return {
        "id": str(user.id),
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "email_verified": user.email_verified,
        "name": user.name,
        "display_name": user.display_name,
        "photo_url": user.photo_url,
        "headline": "Candidate on openroles",
        "location": "",
        "onboarding_completed": user.onboarding_completed,
        "terms_accepted": user.terms_accepted,
        "terms_version": user.terms_version,
        "terms_accepted_at": user.terms_accepted_at.isoformat() if user.terms_accepted_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
    }


def _find_user(session: Session, firebase_uid: str) -> Optional[User]:
    return session.scalar(select(User).where(User.firebase_uid == firebase_uid))


def get_user_by_firebase_uid(firebase_uid: str) -> Optional[Dict[str, Any]]:
    sessions = _sessions()
    try:
        with sessions() as session:
            user = _find_user(session, firebase_uid)
            return _as_user_record(user) if user else None
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="User storage is temporarily unavailable.",
        ) from exc


def get_or_create_firebase_user(claims: Dict[str, Any]) -> Dict[str, Any]:
    firebase_uid = claims["uid"]
    email = (claims.get("email") or "").strip().lower()
    if not email or not claims.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your email address before creating or accessing an account.",
        )
    if len(email) > 255:
        raise HTTPException(status_code=400, detail="The verified email address is too long.")

    display_name = (claims.get("display_name") or "").strip()[:255] or email.split("@", maxsplit=1)[0]
    photo_url = claims.get("photo_url")
    if not isinstance(photo_url, str):
        photo_url = None
    else:
        photo_url = photo_url[:512]
    sessions = _sessions()
    try:
        with sessions.begin() as session:
            user = _find_user(session, firebase_uid)
            email_owner = session.scalar(
                select(User).where(func.lower(User.email) == email)
            )
            if email_owner and email_owner.firebase_uid != firebase_uid:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "code": "account_conflict",
                        "message": "This verified email is already associated with another account. Sign in to the existing account and link the provider from Firebase.",
                    },
                )

            now = datetime.utcnow()
            if user is None:
                user = User(
                    firebase_uid=firebase_uid,
                    email=email,
                    email_verified=True,
                    name=display_name,
                    display_name=display_name,
                    photo_url=photo_url,
                    last_login_at=now,
                    created_at=now,
                    updated_at=now,
                )
                session.add(user)
            else:
                user.email = email
                user.email_verified = True
                user.last_login_at = now
                user.updated_at = now
                user.name = display_name
                user.display_name = display_name
                if photo_url:
                    user.photo_url = photo_url
            session.flush()
            record = _as_user_record(user)
        return record
    except HTTPException:
        raise
    except IntegrityError as exc:
        with sessions() as session:
            created = _find_user(session, firebase_uid)
            if created:
                return _as_user_record(created)
            email_owner = session.scalar(
                select(User).where(func.lower(User.email) == email)
            )
            if email_owner:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "code": "account_conflict",
                        "message": "This verified email is already associated with another account. Sign in to the existing account and link the provider from Firebase.",
                    },
                ) from exc
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The account could not be created because its identity conflicts with an existing record.",
        ) from exc
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="User storage is temporarily unavailable.",
        ) from exc


def complete_user_onboarding(
    firebase_uid: str,
    terms_version: str,
    privacy_version: str,
    ip_address: Optional[str],
    user_agent: Optional[str],
) -> Dict[str, Any]:
    sessions = _sessions()
    try:
        with sessions.begin() as session:
            user = _find_user(session, firebase_uid)
            if user is None:
                raise HTTPException(status_code=404, detail="User account not found.")

            accepted_at = datetime.utcnow()
            for document_type, version in (
                ("terms_and_conditions", terms_version),
                ("privacy_policy", privacy_version),
            ):
                session.add(UserConsent(
                    user_id=user.id,
                    document_type=document_type,
                    document_version=version,
                    accepted_at=accepted_at,
                    ip_address=ip_address,
                    user_agent=user_agent,
                ))
            user.terms_accepted = True
            user.terms_version = terms_version
            user.terms_accepted_at = accepted_at
            user.onboarding_completed = True
            user.updated_at = accepted_at
            session.flush()
            return _as_user_record(user)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="User storage is temporarily unavailable.",
        ) from exc
