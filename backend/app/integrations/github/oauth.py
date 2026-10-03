import os
import secrets
from urllib.parse import urlencode

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"

# Minimal permitted scopes (Section 14, 15, 16)
GITHUB_SCOPES = ["read:user", "user:email"]

def generate_oauth_state() -> str:
    """Generates cryptographically secure state token to prevent CSRF (Section 43)."""
    return secrets.token_urlsafe(32)

def build_github_auth_url(redirect_uri: str, state: str) -> str:
    client_id = os.getenv("GITHUB_CLIENT_ID", "openroles_github_client_id")
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": state,
        "scope": " ".join(GITHUB_SCOPES),
    }
    return f"{GITHUB_AUTH_URL}?{urlencode(params)}"
