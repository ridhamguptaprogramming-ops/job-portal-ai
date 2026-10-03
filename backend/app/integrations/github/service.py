from typing import Dict, Any, List
from .client import GitHubClient

class GitHubIntegrationService:
    def __init__(self):
        self.client = GitHubClient()

    def normalize_profile(self, user_data: Dict[str, Any], repos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Normalizes permitted GitHub profile & repository information (Section 15, 16)."""
        languages = set()
        top_repos = []

        for r in repos[:6]:
            lang = r.get("language")
            if lang:
                languages.add(lang)
            top_repos.append({
                "name": r.get("name", ""),
                "description": r.get("description") or "Open source software project",
                "language": lang or "Code",
                "stars": r.get("stargazers_count", 0),
                "forks": r.get("forks_count", 0),
                "url": r.get("html_url", ""),
                "updated_at": r.get("updated_at", "")
            })

        return {
            "provider_user_id": str(user_data.get("id", "")),
            "provider_username": user_data.get("login", ""),
            "name": user_data.get("name") or user_data.get("login", ""),
            "avatar_url": user_data.get("avatar_url", ""),
            "bio": user_data.get("bio") or "Software developer",
            "company": user_data.get("company", ""),
            "location": user_data.get("location", ""),
            "profile_url": user_data.get("html_url", ""),
            "repos_count": user_data.get("public_repos", 0),
            "followers": user_data.get("followers", 0),
            "top_skills": sorted(list(languages)),
            "top_repos": top_repos
        }
