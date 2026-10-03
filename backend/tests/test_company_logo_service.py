import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.company_logo_service import CompanyLogoService, VERIFIED_ENTERPRISE_COMPANIES

def test_company_name_normalization():
    # Test normalization of common corporate variants
    test_cases = [
        ("Google LLC", "Google"),
        ("Google India Pvt Ltd", "Google"),
        ("Google", "Google"),
        ("Microsoft Corporation", "Microsoft"),
        ("Microsoft India", "Microsoft"),
        ("Amazon Web Services", "Amazon"),
        ("Tata Consultancy Services Limited", "Tata Consultancy Services"),
        ("TCS", "Tata Consultancy Services"),
        ("Swiggy Instamart", "Swiggy"),
        ("Bundl Technologies", "Swiggy"),
        ("Razorpay Software Pvt Ltd", "Razorpay"),
        ("Infosys Limited", "Infosys"),
        ("Wipro Technologies", "Wipro"),
        ("Accenture Solutions", "Accenture"),
        ("Deloitte India", "Deloitte"),
    ]

    for raw, expected in test_cases:
        res = CompanyLogoService.normalize_company_name(raw)
        assert res["name"] == expected, f"Failed for {raw}: got {res['name']}, expected {expected}"

def test_company_logo_resolution_real_assets():
    # Verify that major companies resolve to genuine verified assets
    companies_to_test = [
        ("Google", "google.com", "official"),
        ("Microsoft", "microsoft.com", "official"),
        ("Amazon", "amazon.com", "official"),
        ("Adobe", "adobe.com", "official"),
        ("Apple", "apple.com", "official"),
        ("Meta", "meta.com", "official"),
        ("NVIDIA", "nvidia.com", "official"),
        ("Swiggy", "swiggy.com", "official"),
        ("Razorpay", "razorpay.com", "official"),
        ("Infosys", "infosys.com", "official"),
        ("Tata Consultancy Services", "tcs.com", "official"),
        ("Flipkart", "flipkart.com", "official"),
    ]

    for name, domain, source in companies_to_test:
        res = CompanyLogoService.resolve_company(name)
        assert res["name"] == name
        assert res["domain"] == domain
        assert res["logo_url"] is not None
        assert res["logo_url"].startswith("http")
        assert res["logo_source"] == source
        assert res["verified"] is True

def test_unresolved_company_fallback_no_fabrication():
    # Section 2, 12, 48: When a company cannot be verified, NEVER fabricate a logo.
    unknown_company = "Zyzzx Quantum Innovations Ltd"
    res = CompanyLogoService.resolve_company(unknown_company)

    assert res["name"] == "Zyzzx Quantum Innovations"
    assert res["logo_url"] is None
    assert res["logo_source"] == "fallback_initials"
    assert res["verified"] is False
    # Check initials
    initials = CompanyLogoService.get_initials(res["name"])
    assert initials == "ZQ"

def test_company_initials_generation():
    assert CompanyLogoService.get_initials("Google") == "GO"
    assert CompanyLogoService.get_initials("Microsoft") == "MI"
    assert CompanyLogoService.get_initials("Tata Consultancy Services") == "TC"
    assert CompanyLogoService.get_initials("Razorpay") == "RA"
    assert CompanyLogoService.get_initials("Swiggy") == "SW"

if __name__ == "__main__":
    test_company_name_normalization()
    test_company_logo_resolution_real_assets()
    test_unresolved_company_fallback_no_fabrication()
    test_company_initials_generation()
    print("All Company Logo Service unit tests passed successfully!")
