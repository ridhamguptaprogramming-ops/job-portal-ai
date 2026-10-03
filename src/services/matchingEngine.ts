import { Job, ResumeAnalysis, JobMatchBreakdown } from '../types/job';

export interface MatchingWeights {
  skillsWeight: number; // e.g. 0.45
  experienceWeight: number; // e.g. 0.25
  roleWeight: number; // e.g. 0.20
  locationWeight: number; // e.g. 0.10
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  skillsWeight: 0.45,
  experienceWeight: 0.25,
  roleWeight: 0.20,
  locationWeight: 0.10,
};

/**
 * Calculates a multi-dimensional match score between a candidate resume analysis and a job.
 */
export function calculateJobMatch(
  job: Job,
  resume: ResumeAnalysis | null | undefined,
  weights: MatchingWeights = DEFAULT_WEIGHTS
): JobMatchBreakdown {
  const jobSkills: string[] = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === 'string'
    ? (job.skills as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  if (!resume) {
    return {
      jobId: job.id,
      overallScore: 0,
      skillsScore: 0,
      experienceScore: 0,
      roleScore: 0,
      locationScore: 0,
      matchedSkills: [],
      missingSkills: jobSkills.slice(0, 3),
      whyMatches: 'Upload and analyze your resume to view personalized match compatibility for this role.'
    };
  }

  const userSkillsNormalized = new Set(
    resume.allSkills.map(s => s.toLowerCase().trim())
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const jobSkill of jobSkills) {
    const jobSkillLower = jobSkill.toLowerCase().trim();
    let isMatched = false;

    // Check direct or partial match (e.g. "REST API" and "REST APIs")
    for (const uSkill of userSkillsNormalized) {
      if (
        uSkill === jobSkillLower ||
        uSkill.includes(jobSkillLower) ||
        jobSkillLower.includes(uSkill)
      ) {
        isMatched = true;
        break;
      }
    }

    if (isMatched) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  }

  // Skills Score: percentage of job's required skills that the candidate has
  const skillsScore = jobSkills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 75;

  // Experience Score
  let experienceScore = 70;
  const userExpYears = resume.yearsOfExperience || 3;
  if (job.experienceLevel === 'entry') {
    experienceScore = 95;
  } else if (job.experienceLevel === 'mid') {
    experienceScore = userExpYears >= 3 ? 95 : userExpYears >= 2 ? 80 : 65;
  } else if (job.experienceLevel === 'senior') {
    experienceScore = userExpYears >= 5 ? 95 : userExpYears >= 3 ? 80 : 55;
  } else if (job.experienceLevel === 'lead' || job.experienceLevel === 'executive') {
    experienceScore = userExpYears >= 6 ? 92 : userExpYears >= 4 ? 75 : 50;
  }

  // Role Score
  const jobTitleLower = job.title.toLowerCase();
  const currentRoleLower = resume.currentRole.toLowerCase();
  let roleScore = 60;

  const roleKeywords = ['backend', 'frontend', 'full stack', 'fullstack', 'devops', 'cloud', 'data', 'engineer', 'developer', 'python', 'react'];
  let matchedKeywordCount = 0;
  for (const kw of roleKeywords) {
    if (jobTitleLower.includes(kw) && (currentRoleLower.includes(kw) || resume.recommendedRoles.some(r => r.toLowerCase().includes(kw)))) {
      matchedKeywordCount++;
    }
  }

  if (matchedKeywordCount >= 2) {
    roleScore = 95;
  } else if (matchedKeywordCount === 1) {
    roleScore = 85;
  } else {
    roleScore = 65;
  }

  // Location / Remote Score
  let locationScore = 80;
  if (job.remoteType === 'remote') {
    locationScore = 100;
  } else {
    const jobLoc = job.location.toLowerCase();
    const userLoc = resume.location.toLowerCase();
    if (jobLoc.includes(userLoc) || userLoc.includes(jobLoc)) {
      locationScore = 95;
    } else {
      locationScore = 70;
    }
  }

  // Weighted Overall Score
  const rawScore =
    skillsScore * weights.skillsWeight +
    experienceScore * weights.experienceWeight +
    roleScore * weights.roleWeight +
    locationScore * weights.locationWeight;

  const overallScore = Math.min(98, Math.max(25, Math.round(rawScore)));

  // Generate grounded explanation
  let whyMatches = '';
  if (overallScore >= 80) {
    whyMatches = `This role aligns closely with the skills and experience identified in your profile. Your proficiency in ${matchedSkills.slice(0, 3).join(', ')} strongly satisfies the core requirements for this position.`;
  } else if (overallScore >= 60) {
    whyMatches = `Your background in ${matchedSkills.slice(0, 2).join(', ')} provides a solid foundation for this position, though building familiarity with ${missingSkills.slice(0, 2).join(' and ')} would strengthen your candidacy.`;
  } else {
    whyMatches = `This role partially matches your experience. Bridging gaps in key technologies like ${missingSkills.slice(0, 2).join(' and ')} is recommended prior to applying.`;
  }

  return {
    jobId: job.id,
    overallScore,
    skillsScore,
    experienceScore,
    roleScore,
    locationScore,
    matchedSkills,
    missingSkills,
    whyMatches
  };
}
