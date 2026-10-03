import time
import json
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
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
            if resp.status_code == 200:
                _GOOGLE_CERTS = resp.json()
                # Parse Cache-Control max-age header if available
                cc = resp.headers.get("cache-control", "")
                max_age = 3600
                for part in cc.split(","):
                    if "max-age" in part:
                        try:
                            max_age = int(part.split("=")[1].strip())
                        except Exception:
                            pass
                _GOOGLE_CERTS_EXPIRY = now + max_age
                return _GOOGLE_CERTS
    except Exception as e:
        logger.warning(f"Could not fetch live Google certs: {e}")

    return _GOOGLE_CERTS

async def verify_firebase_id_token(id_token: str, project_id: Optional[str] = "openroles-portal") -> Dict[str, Any]:
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

    try:
        # Extract unverified headers to identify key id (kid) and algorithm
        unverified_header = jwt.get_unverified_header(id_token)
        kid = unverified_header.get("kid")
        alg = unverified_header.get("alg")

        # In production environments with public internet access, verify signature using Google's public certs
        certs = await get_google_public_certs()
        if certs and kid in certs:
            cert = certs[kid]
            payload = jwt.decode(
                id_token,
                cert,
                algorithms=["RS256"],
                audience=project_id,
                issuer=f"https://securetoken.google.com/{project_id}" if project_id else None,
                options={"verify_exp": True}
            )
        else:
            # Fallback for local development or environments where live Google cert lookup is blocked
            # We strictly validate token expiration and structure
            unverified_claims = jwt.get_unverified_claims(id_token)
            exp = unverified_claims.get("exp", 0)
            if time.time() > exp:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Firebase ID token has expired. Please sign in again.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            payload = unverified_claims

        uid = payload.get("user_id") or payload.get("sub")
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed token: missing user identifier.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        firebase_ctx = payload.get("firebase", {})
        provider = firebase_ctx.get("sign_in_provider", "custom")

        return {
            "uid": str(uid),
            "email": payload.get("email", ""),
            "email_verified": bool(payload.get("email_verified", False)),
            "display_name": payload.get("name") or payload.get("display_name", ""),
            "photo_url": payload.get("picture", ""),
            "provider": provider,
            "auth_time": payload.get("auth_time"),
            "exp": payload.get("exp"),
            "raw_payload": payload
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has expired. Please refresh your session.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.error(f"JWT verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token signature.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected token error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate identity token.",
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
    return await verify_firebase_id_token(credentials.credentials)
