import os
import httpx
from typing import Dict, Any, List

class GitHubClient:
    """Official GitHub OAuth & REST API client (Section 14, 15, 16)."""

    def __init__(self):
        self.client_id = os.getenv("GITHUB_CLIENT_ID", "openroles_github_client_id")
        self.client_secret = os.getenv("GITHUB_CLIENT_SECRET", "openroles_github_client_secret")

    async def exchange_code(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        }
        headers = {"Accept": "application/json"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post("https://github.com/login/oauth/access_token", data=data, headers=headers)
            resp.raise_for_status()
            return resp.json()

    async def fetch_user_profile(self, access_token: str) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "openroles-job-portal"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get("https://api.github.com/user", headers=headers)
            resp.raise_for_status()
            return resp.json()

    async def fetch_public_repositories(self, access_token: str, limit: int = 6) -> List[Dict[str, Any]]:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "openroles-job-portal"
        }
        params = {"sort": "updated", "per_page": limit, "type": "public"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get("https://api.github.com/user/repos", headers=headers, params=params)
            resp.raise_for_status()
            return resp.json()
