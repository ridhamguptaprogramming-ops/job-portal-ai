import os
from threading import Lock

from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

_session_factory: sessionmaker[Session] | None = None
_session_factory_lock = Lock()


def get_session_factory() -> sessionmaker[Session]:
    global _session_factory
    if _session_factory is None:
        with _session_factory_lock:
            if _session_factory is None:
                database_url = os.getenv("DATABASE_URL", "").strip()
                if not database_url:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Database storage is not configured.",
                    )
                try:
                    engine = create_engine(database_url, pool_pre_ping=True)
                    _session_factory = sessionmaker(bind=engine, expire_on_commit=False)
                except (SQLAlchemyError, ValueError) as exc:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Database storage could not be initialized.",
                    ) from exc
    return _session_factory
