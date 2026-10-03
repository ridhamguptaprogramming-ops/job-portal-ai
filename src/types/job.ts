export type RemoteType = 'remote' | 'hybrid' | 'onsite';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type EmploymentType =
  | 'full-time'
  | 'part-time'
  | 'internship'
  | 'contract'
  | 'apprenticeship'
  | 'fellowship'
  | 'graduate';
export type ApplicationStatus =
  | 'draft'
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'external_redirect';

export interface JobSource {
  id: string;
  name: string;
  type: 'official_career_api' | 'authorized_feed' | 'licensed_aggregator';
  verified: boolean;
  website: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  normalizedName?: string;
  slug?: string;
  logoUrl?: string | null;
  logo_url?: string | null;
  logoSource?: 'official' | 'provider' | 'licensed' | 'verified_external' | 'cached' | 'fallback_initials';
  websiteUrl?: string | null;
  website_url?: string | null;
  domain?: string | null;
  description?: string;
  industry?: string;
  headquarters?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  companyId?: string;
  company_id?: string;
  externalJobId: string;
  title: string;
  company: string;
  companyInfo?: CompanyInfo;
  companyLogo?: string;
  companyWebsite: string;
  location: string;
  country?: string;
  remoteType: RemoteType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod: 'year' | 'month' | 'hour';
  salaryFormatted: string; // If source doesn't provide, "Not specified by employer"
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  experienceYearsRequired?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  source: string;
  sourceUrl: string;
  originalJobUrl: string;
  retrievedAt: string;
  firstSeenAt: string;
  lastVerifiedAt: string;
  expiresAt?: string;
  postedAt: string;
  postedAgo: string;
  status: 'active' | 'expired' | 'removed' | 'verification_failed';
  isFeatured?: boolean;
  isVerifiedSource: boolean;
  duplicateOfId?: string;
  sourceCount?: number;
  companyOverview?: string;
  industry?: string;
  applicationMethod: 'external' | 'authorized_api' | 'platform_gateway';
  internshipDetails?: {
    term?: 'summer' | 'winter' | 'spring' | 'fall' | 'year-round';
    duration?: string;
    specialization?: string; // e.g. 'Software Engineering', 'AI/ML', 'Backend', 'Data Science'
    isPaid?: boolean;
    eligibility?: string;
  };
}

export interface Interview {
  id: string;
  applicationId: string;
  company: string;
  role: string;
  companyLogo?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  timezone: string; // 'Asia/Kolkata'
  meetingUrl: string;
  location: string;
  interviewer: string;
  status: 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  calendarEventCreated: boolean;
  notes?: string;
}

export interface AIApplySettings {
  enabled: boolean;
  minMatchScore: number;
  maxDailyApplications: number;
  approvedJobTypes: EmploymentType[];
  approvedLocations: string[];
  allowedCompanies: string[];
  excludedCompanies: string[];
  coverLetterNotes: string;
}

export interface ProviderHealth {
  id: string;
  name: string;
  type: string;
  lastSuccessfulSync: string;
  jobsFetched: number;
  jobsAccepted: number;
  jobsRejected: number;
  jobsExpired: number;
  status: 'healthy' | 'degraded' | 'syncing' | 'error';
  lastError?: string;
}

export interface ExtractedExperience {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface ExtractedEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  graduationYear?: string;
}

export interface ExtractedProject {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CategorizedSkills {
  programmingLanguages: string[];
  backend: string[];
  frontend: string[];
  databases: string[];
  cloudAndDevOps: string[];
  toolsAndFrameworks: string[];
  softSkills: string[];
}

export interface ResumeAnalysis {
  id: string;
  candidateName: string;
  currentRole: string;
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  location: string;
  summary: string;
  skills: CategorizedSkills;
  allSkills: string[];
  experience: ExtractedExperience[];
  education: ExtractedEducation[];
  projects: ExtractedProject[];
  recommendedRoles: string[];
  insights: {
    completenessScore: number;
    strongSkills: string[];
    missingSkills: string[];
    careerTrajectory: string;
    suggestions: string[];
  };
  analyzedAt: string;
}

export interface JobMatchBreakdown {
  jobId: string;
  overallScore: number; // 0 - 100
  skillsScore: number;
  experienceScore: number;
  roleScore: number;
  locationScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  whyMatches: string;
}

export interface ConnectedPortals {
  githubUsername?: string;
  linkedInUrl?: string;
  naukriId?: string;
  indeedId?: string;
  instahyreId?: string;
  workdayEmail?: string;
  fetchedGithubData?: {
    name: string;
    bio: string;
    avatarUrl: string;
    publicRepos: number;
    company?: string;
    location?: string;
    topRepos: Array<{
      name: string;
      description: string;
      language: string;
      html_url: string;
      stargazers_count: number;
    }>;
  };
}

export interface SentEmail {
  id: string;
  to: string;
  customerEmail: string;
  subject: string;
  htmlBody: string;
  jobTitle: string;
  company: string;
  portalName: string;
  transactionId: string;
  screenshotBase64?: string;
  sentAt: string;
  status: 'delivered' | 'sent';
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
  interviewDate?: string;
  salaryOffer?: string;
  updatedAt: string;
  destinationPortal?: string;
  submissionTransactionId?: string;
  screenshotUrl?: string;
  emailDispatchedTo?: string;
  confirmationEmailSent?: boolean;
}

export interface JobAlert {
  id: string;
  title: string;
  keywords: string;
  location: string;
  remoteOnly: boolean;
  experienceLevel?: ExperienceLevel;
  frequency: 'daily' | 'weekly';
  isActive: boolean;
  createdAt: string;
  matchCount?: number;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'job_alert' | 'application_update' | 'recommendation' | 'system';
  jobId?: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  headline: string;
  location: string;
  avatarUrl?: string;
  photoUrl?: string;
  about: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  connectedPortals?: ConnectedPortals;
  careerPreferences: {
    targetTitles: string[];
    preferredLocations: string[];
    remotePreference: RemoteType | 'any';
    minSalary?: number;
    currency: string;
  };
  resumeAnalysis?: ResumeAnalysis;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  isOnboarded?: boolean;
}
