import time
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError
import httpx

logger = logging.getLogger("firebase_auth")

security = HTTPBearer(auto_error=False)

# Google public certs cache
_GOOGLE_CERTS: Dict[str, str] = {}
_GOOGLE_CERTS_EXPIRY: float = 0.0

GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"

async def get_google_public_certs() -> Dict[str, str]:
    """Retrieves Google public certs for Firebase ID Token verification with caching."""
    global _GOOGLE_CERTS, _GOOGLE_CERTS_EXPIRY
    now = time.time()
    if _GOOGLE_CERTS and now < _GOOGLE_CERTS_EXPIRY:
        return _GOOGLE_CERTS

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(GOOGLE_CERTS_URL)
            resp.raise_for_status()
            certs = resp.json()
            if not isinstance(certs, dict) or not certs:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Firebase signing keys are temporarily unavailable.",
                )
            _GOOGLE_CERTS = certs
            cache_control = resp.headers.get("cache-control", "")
            max_age = 3600
            for part in cache_control.split(","):
                key, _, value = part.strip().partition("=")
                if key.lower() == "max-age":
                    try:
                        max_age = max(0, int(value.strip()))
                    except ValueError:
                        logger.warning("Firebase signing-key response had an invalid max-age header.")
                    break
            _GOOGLE_CERTS_EXPIRY = now + max_age
            return _GOOGLE_CERTS
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError) as exc:
        if _GOOGLE_CERTS:
            logger.warning("Using previously cached Firebase signing keys after refresh failed: %s", exc)
            return _GOOGLE_CERTS
        logger.error("Could not retrieve Firebase signing keys: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase token verification is temporarily unavailable.",
        ) from exc

async def verify_firebase_id_token(
    id_token: str,
    project_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Verifies a Firebase ID token.
    Extracts and returns:
    - uid (sub)
    - email
    - email_verified
    - name / display_name
    - picture
    - sign_in_provider
    Validates expiration, issuer, audience, and algorithm.
    """
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not project_id:
        from ..core.config import settings
        project_id = settings.FIREBASE_PROJECT_ID
    if not project_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase token verification is not configured.",
        )

    try:
        unverified_header = jwt.get_unverified_header(id_token)
        kid = unverified_header.get("kid")
        if unverified_header.get("alg") != "RS256" or not isinstance(kid, str):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase ID token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        certs = await get_google_public_certs()
        cert = certs.get(kid)
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firebase ID token signing key is unknown.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        payload = jwt.decode(
            id_token,
            cert,
            algorithms=["RS256"],
            audience=project_id,
            issuer=f"https://securetoken.google.com/{project_id}",
            options={"verify_exp": True, "verify_iat": True, "verify_aud": True},
        )

        uid = payload.get("user_id") or payload.get("sub")
        if not isinstance(uid, str) or not uid or len(uid) > 128:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed Firebase ID token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        firebase_ctx = payload.get("firebase") or {}
        provider = firebase_ctx.get("sign_in_provider", "custom")

        return {
            "uid": str(uid),
            "email": payload.get("email"),
            "email_verified": bool(payload.get("email_verified", False)),
            "display_name": payload.get("name") or payload.get("display_name", ""),
            "photo_url": payload.get("picture"),
            "provider": provider,
            "auth_time": payload.get("auth_time"),
            "exp": payload.get("exp"),
        }

    except HTTPException:
        raise
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has expired. Please refresh your session.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.warning("Firebase ID token verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_firebase_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Dict[str, Any]:
    """Dependency for securing FastAPI endpoints using Bearer <Firebase ID Token>."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please include Authorization: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )
    claims = await verify_firebase_id_token(credentials.credentials)
    if not claims.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify your email address before accessing your account.",
        )
    return claims
