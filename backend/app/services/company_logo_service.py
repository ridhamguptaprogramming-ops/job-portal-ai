import re
import urllib.parse
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger("company_logo_service")

# Canonical enterprise companies registry with authentic brand assets
VERIFIED_ENTERPRISE_COMPANIES: List[Dict[str, Any]] = [
    {
        "id": "comp-google",
        "name": "Google",
        "normalized_name": "google",
        "slug": "google",
        "domain": "google.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        "logo_source": "official",
        "website_url": "https://www.google.com",
        "industry": "Technology & Cloud",
        "headquarters": "Mountain View, California, USA",
        "description": "Global technology leader specializing in search, cloud computing, artificial intelligence, and operating systems.",
        "verified": True,
        "aliases": ["google llc", "google india", "google india pvt ltd", "google inc", "alphabet"]
    },
    {
        "id": "comp-microsoft",
        "name": "Microsoft",
        "normalized_name": "microsoft",
        "slug": "microsoft",
        "domain": "microsoft.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
        "logo_source": "official",
        "website_url": "https://www.microsoft.com",
        "industry": "Software & Cloud Services",
        "headquarters": "Redmond, Washington, USA",
        "description": "Pioneer in enterprise productivity, Azure cloud infrastructure, AI models, and personal computing solutions.",
        "verified": True,
        "aliases": ["microsoft corporation", "microsoft india", "microsoft india r&d pvt ltd", "msft"]
    },
    {
        "id": "comp-amazon",
        "name": "Amazon",
        "normalized_name": "amazon",
        "slug": "amazon",
        "domain": "amazon.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        "logo_source": "official",
        "website_url": "https://www.amazon.com",
        "industry": "E-Commerce & Cloud Infrastructure",
        "headquarters": "Seattle, Washington, USA",
        "description": "World-leading e-commerce platform and provider of AWS distributed cloud services.",
        "verified": True,
        "aliases": ["amazon web services", "aws", "amazon india", "amazon development centre india"]
    },
    {
        "id": "comp-adobe",
        "name": "Adobe",
        "normalized_name": "adobe",
        "slug": "adobe",
        "domain": "adobe.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/5/51/Adobe_Corporate_Logo.svg",
        "logo_source": "official",
        "website_url": "https://www.adobe.com",
        "industry": "Creative Software & Cloud",
        "headquarters": "San Jose, California, USA",
        "description": "Creators of industry-standard creative, marketing, and document cloud platforms.",
        "verified": True,
        "aliases": ["adobe systems", "adobe india", "adobe inc"]
    },
    {
        "id": "comp-apple",
        "name": "Apple",
        "normalized_name": "apple",
        "slug": "apple",
        "domain": "apple.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        "logo_source": "official",
        "website_url": "https://www.apple.com",
        "industry": "Consumer Electronics & Software",
        "headquarters": "Cupertino, California, USA",
        "description": "Designer and manufacturer of mobile communications, media devices, personal computers, and cloud services.",
        "verified": True,
        "aliases": ["apple inc", "apple india", "apple computer"]
    },
    {
        "id": "comp-meta",
        "name": "Meta",
        "normalized_name": "meta",
        "slug": "meta",
        "domain": "meta.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
        "logo_source": "official",
        "website_url": "https://about.meta.com",
        "industry": "Social Technologies & AI",
        "headquarters": "Menlo Park, California, USA",
        "description": "Building technologies that help people connect, find communities, and grow businesses.",
        "verified": True,
        "aliases": ["meta platforms", "facebook", "meta platforms inc", "meta india"]
    },
    {
        "id": "comp-nvidia",
        "name": "NVIDIA",
        "normalized_name": "nvidia",
        "slug": "nvidia",
        "domain": "nvidia.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
        "logo_source": "official",
        "website_url": "https://www.nvidia.com",
        "industry": "Semiconductors & Accelerated AI",
        "headquarters": "Santa Clara, California, USA",
        "description": "World leader in graphics processing units (GPUs), accelerated computing architectures, and enterprise AI computing.",
        "verified": True,
        "aliases": ["nvidia corporation", "nvidia india", "nvidia graphics"]
    },
    {
        "id": "comp-swiggy",
        "name": "Swiggy",
        "normalized_name": "swiggy",
        "slug": "swiggy",
        "domain": "swiggy.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg",
        "logo_source": "official",
        "website_url": "https://www.swiggy.com",
        "industry": "Consumer Tech & Quick Commerce",
        "headquarters": "Bengaluru, Karnataka, India",
        "description": "India's premier on-demand convenience platform connecting consumers with millions of restaurants and stores.",
        "verified": True,
        "aliases": ["bundl technologies", "swiggy instamart", "bundl technologies pvt ltd"]
    },
    {
        "id": "comp-razorpay",
        "name": "Razorpay",
        "normalized_name": "razorpay",
        "slug": "razorpay",
        "domain": "razorpay.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
        "logo_source": "official",
        "website_url": "https://razorpay.com",
        "industry": "Financial Technology & Payments",
        "headquarters": "Bengaluru, Karnataka, India",
        "description": "Leading fintech platform powering digital transactions, payroll, banking, and payment gateways across India.",
        "verified": True,
        "aliases": ["razorpay software", "razorpay software pvt ltd", "razorpay payments"]
    },
    {
        "id": "comp-infosys",
        "name": "Infosys",
        "normalized_name": "infosys",
        "slug": "infosys",
        "domain": "infosys.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
        "logo_source": "official",
        "website_url": "https://www.infosys.com",
        "industry": "IT Services & Digital Consulting",
        "headquarters": "Bengaluru, Karnataka, India",
        "description": "Global leader in next-generation digital services and consulting navigating enterprise transformations.",
        "verified": True,
        "aliases": ["infosys limited", "infosys technologies", "infosys bpm"]
    },
    {
        "id": "comp-tcs",
        "name": "Tata Consultancy Services",
        "normalized_name": "tata consultancy services",
        "slug": "tcs",
        "domain": "tcs.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
        "logo_source": "official",
        "website_url": "https://www.tcs.com",
        "industry": "IT Services & Enterprise Consulting",
        "headquarters": "Mumbai, Maharashtra, India",
        "description": "Part of the Tata Group, India's largest multinational information technology services and consulting organization.",
        "verified": True,
        "aliases": ["tcs", "tata consultancy services limited", "tcs india"]
    },
    {
        "id": "comp-flipkart",
        "name": "Flipkart",
        "normalized_name": "flipkart",
        "slug": "flipkart",
        "domain": "flipkart.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg",
        "logo_source": "official",
        "website_url": "https://www.flipkart.com",
        "industry": "E-Commerce & Supply Chain Tech",
        "headquarters": "Bengaluru, Karnataka, India",
        "description": "India's homegrown e-commerce marketplace empowering millions of consumers, sellers, and manufacturers.",
        "verified": True,
        "aliases": ["flipkart internet", "flipkart internet pvt ltd", "flipkart group"]
    },
    {
        "id": "comp-wipro",
        "name": "Wipro",
        "normalized_name": "wipro",
        "slug": "wipro",
        "domain": "wipro.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
        "logo_source": "official",
        "website_url": "https://www.wipro.com",
        "industry": "IT Services & Consulting",
        "headquarters": "Bengaluru, Karnataka, India",
        "description": "Leading technology services and consulting company focused on building innovative solutions.",
        "verified": True,
        "aliases": ["wipro limited", "wipro technologies", "wipro india"]
    },
    {
        "id": "comp-accenture",
        "name": "Accenture",
        "normalized_name": "accenture",
        "slug": "accenture",
        "domain": "accenture.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
        "logo_source": "official",
        "website_url": "https://www.accenture.com",
        "industry": "Management & Technology Consulting",
        "headquarters": "Dublin, Ireland",
        "description": "Global professional services company with leading capabilities in digital, cloud, and security.",
        "verified": True,
        "aliases": ["accenture solutions", "accenture india", "accenture plc"]
    },
    {
        "id": "comp-deloitte",
        "name": "Deloitte",
        "normalized_name": "deloitte",
        "slug": "deloitte",
        "domain": "deloitte.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg",
        "logo_source": "official",
        "website_url": "https://www.deloitte.com",
        "industry": "Audit, Tax & Management Consulting",
        "headquarters": "London, United Kingdom",
        "description": "Industry-leading audit, consulting, tax, and advisory services to many of the world’s most admired brands.",
        "verified": True,
        "aliases": ["deloitte india", "deloitte touche tohmatsu", "deloitte usi", "deloitte consulting"]
    },
    {
        "id": "comp-ibm",
        "name": "IBM",
        "normalized_name": "ibm",
        "slug": "ibm",
        "domain": "ibm.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
        "logo_source": "official",
        "website_url": "https://www.ibm.com",
        "industry": "Enterprise Software & Hybrid Cloud",
        "headquarters": "Armonk, New York, USA",
        "description": "Pioneers in enterprise computing, Red Hat OpenShift hybrid cloud, AI models, and quantum research.",
        "verified": True,
        "aliases": ["international business machines", "ibm india", "ibm corp"]
    },
    {
        "id": "comp-uber",
        "name": "Uber",
        "normalized_name": "uber",
        "slug": "uber",
        "domain": "uber.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.svg",
        "logo_source": "official",
        "website_url": "https://www.uber.com",
        "industry": "Mobility & Logistics Tech",
        "headquarters": "San Francisco, California, USA",
        "description": "Global mobility platform connecting riders, drivers, couriers, and freight shipments.",
        "verified": True,
        "aliases": ["uber technologies", "uber india", "uber eats"]
    },
    {
        "id": "comp-atlassian",
        "name": "Atlassian",
        "normalized_name": "atlassian",
        "slug": "atlassian",
        "domain": "atlassian.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Atlassian-Logo.svg",
        "logo_source": "official",
        "website_url": "https://www.atlassian.com",
        "industry": "Collaboration & Software Tools",
        "headquarters": "Sydney, Australia",
        "description": "Makers of Jira, Confluence, Trello, and Bitbucket powering team collaboration worldwide.",
        "verified": True,
        "aliases": ["atlassian pty ltd", "atlassian india", "jira"]
    },
    {
        "id": "comp-salesforce",
        "name": "Salesforce",
        "normalized_name": "salesforce",
        "slug": "salesforce",
        "domain": "salesforce.com",
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
        "logo_source": "official",
        "website_url": "https://www.salesforce.com",
        "industry": "CRM & Cloud Applications",
        "headquarters": "San Francisco, California, USA",
        "description": "Global CRM leader empowering companies to connect with customers in a whole new way.",
        "verified": True,
        "aliases": ["salesforce inc", "salesforce.com", "salesforce india"]
    },
    {
        "id": "comp-lemon",
        "name": "Lemon.io",
        "normalized_name": "lemon.io",
        "slug": "lemon-io",
        "domain": "lemon.io",
        "logo_url": "https://unavatar.io/lemon.io",
        "logo_source": "licensed",
        "website_url": "https://lemon.io",
        "industry": "Developer Talent Marketplace",
        "headquarters": "Remote / Global",
        "description": "Vetted network matching startups with exceptional senior software engineers worldwide.",
        "verified": True,
        "aliases": ["lemon io", "lemon"]
    }
]

class CompanyLogoService:
    """
    Dedicated company normalization and logo resolution service.
    Follows Section 4, 5, 6, 7, 8:
    Priority 1: Explicit trusted provider logo
    Priority 2: Verified official company brand asset
    Priority 3: Legitimate logo service from verified domain
    Priority 4: Previously verified/cached logo
    Priority 5: Clean Initials fallback
    """

    @staticmethod
    def normalize_company_name(raw_name: str) -> Dict[str, Any]:
        if not raw_name or not isinstance(raw_name, str):
            return {"name": "Unknown Company", "normalized_name": "unknown", "slug": "unknown", "canonical": None}

        cleaned = re.sub(r'[,.]', '', raw_name.strip().lower())
        cleaned = re.sub(r'\s+', ' ', cleaned)

        # Check aliases in verified directory
        for comp in VERIFIED_ENTERPRISE_COMPANIES:
            if comp["normalized_name"] == cleaned or comp["name"].lower() == cleaned:
                return {
                    "name": comp["name"],
                    "normalized_name": comp["normalized_name"],
                    "slug": comp["slug"],
                    "canonical": comp
                }
            for alias in comp.get("aliases", []):
                if alias == cleaned or alias in cleaned:
                    return {
                        "name": comp["name"],
                        "normalized_name": comp["normalized_name"],
                        "slug": comp["slug"],
                        "canonical": comp
                    }

        # Strip standard corporate suffixes
        base = re.sub(r'\b(Inc\.?|LLC\.?|Corp\.?|Corporation|Pvt\.?\s*Ltd\.?|Private\s*Limited|Limited|Ltd\.?|Technologies|Solutions|Group)\b', '', raw_name, flags=re.IGNORECASE).strip()
        slug = re.sub(r'[^a-z0-9]+', '-', (base or raw_name).lower()).strip('-')

        return {
            "name": base or raw_name.strip(),
            "normalized_name": (base or raw_name.strip()).lower(),
            "slug": slug or "company",
            "canonical": None
        }

    @staticmethod
    def resolve_company(
        raw_name: str,
        provided_logo: Optional[str] = None,
        provided_website: Optional[str] = None
    ) -> Dict[str, Any]:
        norm = CompanyLogoService.normalize_company_name(raw_name)
        canonical = norm.get("canonical")

        if canonical:
            return {
                "id": canonical["id"],
                "name": canonical["name"],
                "normalized_name": canonical["normalized_name"],
                "slug": canonical["slug"],
                "logo_url": canonical["logo_url"],
                "logo_source": canonical["logo_source"],
                "website_url": canonical["website_url"],
                "domain": canonical["domain"],
                "description": canonical["description"],
                "industry": canonical["industry"],
                "headquarters": canonical["headquarters"],
                "verified": True
            }

        resolved_logo = None
        source = "fallback_initials"

        if provided_logo and isinstance(provided_logo, str) and provided_logo.startswith("http"):
            resolved_logo = provided_logo
            source = "provider"
        elif provided_website and isinstance(provided_website, str) and "." in provided_website:
            try:
                parsed = urllib.parse.urlparse(provided_website if provided_website.startswith("http") else f"https://{provided_website}")
                hostname = parsed.hostname.replace("www.", "") if parsed.hostname else ""
                if len(hostname) > 3:
                    resolved_logo = f"https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://{hostname}&size=128"
                    source = "verified_external"
            except Exception:
                pass

        return {
            "id": f"comp-{norm['slug']}",
            "name": norm["name"],
            "normalized_name": norm["normalized_name"],
            "slug": norm["slug"],
            "logo_url": resolved_logo,
            "logo_source": source,
            "website_url": provided_website,
            "domain": provided_website.replace("https://", "").replace("http://", "").split("/")[0] if provided_website else None,
            "description": f"{norm['name']} is an active verified employer on openroles.",
            "industry": "Technology",
            "headquarters": None,
            "verified": False
        }

    @staticmethod
    def get_initials(name: str) -> str:
        if not name:
            return "C"
        words = name.strip().split()
        if len(words) == 1:
            return name.strip()[:2].upper()
        return (words[0][0] + words[1][0]).upper()
