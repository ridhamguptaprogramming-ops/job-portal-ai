from typing import Dict, Any, List

class JobPortalGatewayRegistry:
    """
    Manages official recruitment portal API/OAuth integration gateways (Section 17).
    Strictly permits authorized APIs only; never attempts unauthorized scraping or anti-bot bypass.
    """

    SUPPORTED_GATEWAYS = [
        {
            "id": "naukri_enterprise",
            "name": "Naukri.com Enterprise ATS Gateway",
            "type": "authorized_api",
            "status": "ready",
            "description": "Authorized direct application dispatch via partner REST API.",
            "auth_method": "OAuth 2.0 Client Credentials",
            "scraping_permitted": False,
        },
        {
            "id": "indeed_direct",
            "name": "Indeed Apply & Workday Gateway",
            "type": "authorized_api",
            "status": "ready",
            "description": "Official Indeed Apply API integration with JSON payload mapping.",
            "auth_method": "Indeed Verified Developer API",
            "scraping_permitted": False,
        },
        {
            "id": "instahyre_gateway",
            "name": "Instahyre Candidate Gateway",
            "type": "authorized_api",
            "status": "ready",
            "description": "Candidate profile synchronization with Instahyre partner accounts.",
            "auth_method": "Partner API Key",
            "scraping_permitted": False,
        },
        {
            "id": "unsupported_scraping",
            "name": "General Web Scraping / Unauthorized Portals",
            "type": "prohibited",
            "status": "not_available",
            "description": "Not available. openroles adheres to web scraping prohibitions and anti-bot policies.",
            "auth_method": "None",
            "scraping_permitted": False,
        }
    ]

    @classmethod
    def get_supported_gateways(cls) -> List[Dict[str, Any]]:
        return cls.SUPPORTED_GATEWAYS
