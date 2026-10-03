from typing import Dict, Any
from .client import LinkedInClient

class LinkedInIntegrationService:
    def __init__(self):
        self.client = LinkedInClient()

    def normalize_profile(self, userinfo: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes permitted LinkedIn data (Section 13)."""
        return {
            "provider_user_id": userinfo.get("sub", ""),
            "name": userinfo.get("name", ""),
            "email": userinfo.get("email", ""),
            "avatar_url": userinfo.get("picture", ""),
            "headline": userinfo.get("headline", "Candidate on openroles"),
            "locale": userinfo.get("locale", {}).get("country", "IN"),
        }
