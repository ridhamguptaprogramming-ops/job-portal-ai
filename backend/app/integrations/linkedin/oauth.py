import os
import secrets
from urllib.parse import urlencode

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"

# Minimum approved scopes for openroles candidate verification
LINKEDIN_SCOPES = ["openid", "profile", "email"]

def generate_oauth_state() -> str:
    """Generates cryptographically secure state token to prevent CSRF (Section 43)."""
    return secrets.token_urlsafe(32)

def build_linkedin_auth_url(redirect_uri: str, state: str) -> str:
    client_id = os.getenv("LINKEDIN_CLIENT_ID", "openroles_linkedin_client_id")
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": state,
        "scope": " ".join(LINKEDIN_SCOPES),
    }
    return f"{LINKEDIN_AUTH_URL}?{urlencode(params)}"
