import os
import httpx
from typing import Dict, Any
from .oauth import LINKEDIN_TOKEN_URL

class LinkedInClient:
    """Official LinkedIn OAuth & UserInfo API client (Section 11, 13)."""

    def __init__(self):
        self.client_id = os.getenv("LINKEDIN_CLIENT_ID", "openroles_linkedin_client_id")
        self.client_secret = os.getenv("LINKEDIN_CLIENT_SECRET", "openroles_linkedin_client_secret")

    async def exchange_code(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(LINKEDIN_TOKEN_URL, data=data)
            resp.raise_for_status()
            return resp.json()

    async def fetch_userinfo(self, access_token: str) -> Dict[str, Any]:
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get("https://api.linkedin.com/v2/userinfo", headers=headers)
            resp.raise_for_status()
            return resp.json()
