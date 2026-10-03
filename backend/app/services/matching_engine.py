from typing import Dict, List, Any

class RecommendationEngine:
    def __init__(
        self,
        skills_weight: float = 0.45,
        experience_weight: float = 0.25,
        role_weight: float = 0.20,
        location_weight: float = 0.10
    ):
        self.skills_weight = skills_weight
        self.experience_weight = experience_weight
        self.role_weight = role_weight
        self.location_weight = location_weight

    def calculate_match(
        self,
        candidate_skills: List[str],
        candidate_years_exp: int,
        candidate_current_role: str,
        candidate_location: str,
        job_skills: List[str],
        job_exp_level: str,
        job_title: str,
        job_location: str,
        job_remote_type: str
    ) -> Dict[str, Any]:
        """Calculates multi-dimensional compatibility percentage."""
        cand_skills_lower = {s.lower().strip() for s in candidate_skills}

        matched_skills = []
        missing_skills = []

        for skill in job_skills:
            if skill.lower().strip() in cand_skills_lower:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)

        # 1. Skills score
        skills_score = int((len(matched_skills) / max(len(job_skills), 1)) * 100)

        # 2. Experience score
        experience_score = 70
        if job_exp_level == "entry":
            experience_score = 95
        elif job_exp_level == "mid":
            experience_score = 95 if candidate_years_exp >= 3 else 80
        elif job_exp_level == "senior":
            experience_score = 95 if candidate_years_exp >= 5 else 75
        elif job_exp_level in ("lead", "executive"):
            experience_score = 92 if candidate_years_exp >= 6 else 65

        # 3. Role fit score
        role_score = 65
        job_title_lower = job_title.lower()
        cand_role_lower = candidate_current_role.lower()
        common_tokens = ["backend", "frontend", "full stack", "python", "devops", "cloud", "engineer"]
        if any(token in job_title_lower and token in cand_role_lower for token in common_tokens):
            role_score = 95

        # 4. Location score
        location_score = 100 if job_remote_type == "remote" else 85

        # Overall weighted calculation
        overall = int(
            skills_score * self.skills_weight
            + experience_score * self.experience_weight
            + role_score * self.role_weight
            + location_score * self.location_weight
        )
        overall = max(25, min(98, overall))

        why_matches = (
            f"This role aligns closely with your profile. Your background in "
            f"{', '.join(matched_skills[:3]) or 'software development'} directly addresses core requirements."
        )

        return {
            "overall_score": overall,
            "skills_score": skills_score,
            "experience_score": experience_score,
            "role_score": role_score,
            "location_score": location_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "why_matches": why_matches
        }
