from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseOAuthProvider(ABC):
    """Abstract base class for third-party OAuth providers."""

    @abstractmethod
    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        """Constructs secure authorization URL with PKCE / state validation."""
        pass

    @abstractmethod
    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchanges authorization code for access token securely on the server."""
        pass

    @abstractmethod
    async def get_profile(self, access_token: str) -> Dict[str, Any]:
        """Fetches permitted profile fields from the provider."""
        pass
