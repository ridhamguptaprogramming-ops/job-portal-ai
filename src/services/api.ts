/**
 * Centralized API client for all backend REST endpoints.
 * Satisfies Section 5, 19, 20:
 * - Centralizes backend URL
 * - Handles workspace=all parameter correctly
 * - Catches network/connection errors cleanly without exposing raw URLs to normal users
 * - Logs technical error to console.error()
 */

import { Job, ResumeAnalysis } from '../types/job';
import { resolveCompany } from './companyLogoService';

export const PRIMARY_RENDER_BACKEND = (
  import.meta.env.VITE_API_URL || 'https://job-portal-fastapi.onrender.com'
).replace(/\/$/, '');
export const LOCAL_SERVER_BACKEND = '';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || PRIMARY_RENDER_BACKEND;

export interface ApiJobResponse {
  jobs: Job[];
  total: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface JobFilterParams {
  search?: string;
  q?: string;
  location?: string;
  workplace?: string; // 'all' | 'Remote' | 'Hybrid' | 'On-site'
  workspace?: string; // alias
  experience?: string;
  employment_type?: string;
  posted_within_days?: number | string;
  skills?: string;
  company?: string;
  min_salary?: number | string;
  max_salary?: number | string;
  salary_min?: number | string;
  salary_max?: number | string;
  limit?: number;
  offset?: number;
}

// Safely normalize string or array of items (requirements, responsibilities, skills)
function parseList(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.includes('\n')) {
      return trimmed
        .split('\n')
        .map((s) => s.replace(/^[•\-\*\d\.]+\s*/, '').trim())
        .filter(Boolean);
    }
    if (trimmed.includes('•')) {
      return trimmed.split('•').map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

/**
 * Normalizes any backend job object (from FastAPI, PostgreSQL, Express, etc.)
 * into a typed, guaranteed Job structure with safe array properties.
 */
export function normalizeJob(raw: any): Job {
  if (!raw) return {} as Job;
  const workplace = (raw.workplace || raw.remote_type || raw.remoteType || '').toString().toLowerCase();
  const remoteType = workplace.includes('remote')
    ? 'remote'
    : workplace.includes('hybrid')
      ? 'hybrid'
      : workplace.includes('site')
        ? 'onsite'
        : 'unspecified';
  const empRaw = (raw.employment_type || raw.employmentType || '').toString().toLowerCase();
  const employmentType = ['full-time', 'part-time', 'contract', 'internship', 'apprenticeship', 'fellowship', 'graduate'].includes(empRaw) ? empRaw : 'other';
  const expRaw = (raw.experience_level || raw.experienceLevel || '').toString().toLowerCase();
  const experienceLevel = ['entry', 'mid', 'senior', 'lead', 'director', 'executive'].includes(expRaw) ? expRaw : 'unspecified';

  // Extract skills safely
  let skills: string[] = [];
  if (Array.isArray(raw.skills)) {
    skills = raw.skills.map(String).map((s: string) => s.trim()).filter(Boolean);
  } else if (typeof raw.skills === 'string') {
    skills = raw.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  // Extract company safely (handles string or company object)
  const rawCompanyName = typeof raw.company === 'object' && raw.company?.name
    ? raw.company.name
    : (typeof raw.company === 'string' && raw.company ? raw.company : (raw.company_name || ''));
  const rawCompanyLogo = (typeof raw.company === 'object' ? (raw.company.logo_url || raw.company.logoUrl) : null)
    || raw.company_logo || raw.companyLogo || (raw.company_data ? raw.company_data.logo_url : null);
  const rawCompanyWebsite = (typeof raw.company === 'object' ? (raw.company.website_url || raw.company.websiteUrl || raw.company.website) : null)
    || raw.company_website || raw.companyWebsite || (raw.company_data ? raw.company_data.website_url : null);

  const resolvedCompany = resolveCompany(rawCompanyName, rawCompanyLogo, rawCompanyWebsite);

  return {
    id: String(raw.id || raw.external_id || raw.externalJobId || ''),
    companyId: resolvedCompany.id,
    company_id: resolvedCompany.id,
    externalJobId: raw.external_id || raw.externalJobId || '',
    title: raw.title || '',
    company: resolvedCompany.name,
    companyInfo: resolvedCompany,
    companyLogo: resolvedCompany.logoUrl || rawCompanyLogo || '',
    companyWebsite: resolvedCompany.websiteUrl || rawCompanyWebsite || '',
    companyOverview: resolvedCompany.description || raw.company_overview || raw.companyOverview || '',
    industry: resolvedCompany.industry || raw.industry || '',
    location: raw.location || '',
    country: raw.country || '',
    remoteType: remoteType as any,
    salaryFormatted: raw.salary_formatted || raw.salaryFormatted || raw.salary || (raw.salary_min ? `₹${(raw.salary_min/100000).toFixed(1)} LPA` : 'Not specified by employer'),
    salaryMin: raw.salary_min ?? raw.salaryMin,
    salaryMax: raw.salary_max ?? raw.salaryMax,
    salaryCurrency: raw.salary_currency || raw.salaryCurrency || '',
    salaryPeriod: raw.salary_period || raw.salaryPeriod || 'year',
    employmentType: employmentType as any,
    experienceLevel: experienceLevel as any,
    experienceYearsRequired: raw.experience_years_required || raw.experienceYearsRequired || '',
    description: raw.description || '',
    responsibilities: parseList(raw.responsibilities),
    requirements: parseList(raw.requirements),
    skills,
    source: raw.source || raw.source_name || '',
    sourceUrl: raw.source_url || raw.sourceUrl || '',
    originalJobUrl: raw.original_job_url || raw.originalJobUrl || raw.application_url || raw.external_url || raw.source_url || raw.sourceUrl || '',
    retrievedAt: raw.retrieved_at || raw.retrievedAt || '',
    firstSeenAt: raw.first_seen_at || raw.firstSeenAt || '',
    lastVerifiedAt: raw.last_verified_at || raw.lastVerifiedAt || '',
    expiresAt: raw.expires_at || raw.expiresAt,
    postedAt: raw.posted_at || raw.postedAt || '',
    postedAgo: raw.posted_ago || raw.postedAgo || '',
    status: raw.status || 'active',
    isFeatured: Boolean(raw.is_featured || raw.isFeatured),
    isVerifiedSource: raw.is_verified ?? raw.isVerifiedSource ?? true,
    applicationMethod: (raw.application_method || raw.applicationMethod || 'external') as any,
    internshipDetails: raw.internship_details || raw.internshipDetails,
  };
}

export class JobServiceError extends Error {
  public status: number;
  public technicalUrl: string;
  public code?: string;

  constructor(message: string, status: number = 0, technicalUrl: string = '', code?: string) {
    super(message);
    this.name = 'JobServiceError';
    this.status = status;
    this.technicalUrl = technicalUrl;
    this.code = code;
  }
}

class ApiService {
  private customBaseUrl: string | null = null;
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('openroles_token');
      localStorage.removeItem('careermatch_token');
      this.customBaseUrl = localStorage.getItem('openroles_api_url');
    }
  }

  public getBaseUrl(): string {
    // Prefer an explicitly configured diagnostic URL, otherwise use the API host.
    if (this.customBaseUrl !== null) {
      return this.customBaseUrl.replace(/\/$/, '');
    }
    return PRIMARY_RENDER_BACKEND;
  }

  public setBaseUrl(url: string | null) {
    this.customBaseUrl = url;
    if (typeof window !== 'undefined') {
      if (url) {
        localStorage.setItem('openroles_api_url', url);
      } else {
        localStorage.removeItem('openroles_api_url');
      }
    }
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  /**
   * Diagnostic probe to test Render backend connectivity
   */
  public async probeBackend(targetUrl: string = PRIMARY_RENDER_BACKEND): Promise<{
    url: string;
    reachable: boolean;
    status: number;
    xRenderRouting: string | null;
    message: string;
  }> {
    try {
      const res = await fetch(`${targetUrl.replace(/\/$/, '')}/health`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });
      const xRender = res.headers.get('x-render-routing');
      return {
        url: targetUrl,
        reachable: res.ok,
        status: res.status,
        xRenderRouting: xRender,
        message: res.ok
          ? 'FastAPI service is online.'
          : `FastAPI responded with HTTP ${res.status}${xRender ? ` (${xRender})` : ''}`,
      };
    } catch (err: any) {
      return {
        url: targetUrl,
        reachable: false,
        status: 0,
        xRenderRouting: null,
        message: err.message || 'Network connection failed',
      };
    }
  }

  /**
   * Core request wrapper
   */
  private async request<T>(
    path: string,
    options: RequestInit = {},
    baseUrlOverride?: string
  ): Promise<T> {
    const baseUrl = baseUrlOverride ?? this.getBaseUrl();
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal ?? AbortSignal.timeout(15000),
      });

      if (response.status === 204) {
        return {} as T;
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const detail = errorJson.detail;
        const detailMsg = typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((item) => item.msg || item.message).filter(Boolean).join('; ')
            : detail?.message || errorJson.error || `Request failed with status ${response.status}`;
        const errorCode = typeof detail === 'object' && !Array.isArray(detail) ? detail?.code : errorJson.code;
        console.error(`[JobService API Error] ${options.method || 'GET'} ${url}`, response.status, detailMsg);
        throw new JobServiceError(detailMsg, response.status, url, errorCode);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      if (error instanceof JobServiceError) {
        throw error;
      }
      const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
      console.error(`[JobService Network Error] ${options.method || 'GET'} ${url}:`, error.message);
      throw new JobServiceError(
        timedOut ? 'The job service request timed out.' : "We couldn't reach the job service right now.",
        0,
        url,
        timedOut ? 'timeout' : 'network_error',
      );
    }
  }

  /**
   * Lists jobs with clean filter serialization
   */
  public async listJobs(filters: JobFilterParams = {}): Promise<ApiJobResponse> {
    const params = new URLSearchParams();

    // Map filters
    const searchVal = filters.search || filters.q;
    if (searchVal) params.set('search', searchVal.trim());

    if (filters.location) params.set('location', filters.location.trim());

    const wp = filters.workplace || filters.workspace;
    if (wp) params.set('workspace', wp.trim());

    if (filters.experience && filters.experience !== 'Any experience') {
      params.set('experience', filters.experience.trim());
    }

    if (filters.employment_type && filters.employment_type !== 'Any employment') {
      params.set('employment_type', filters.employment_type.trim());
    }

    if (filters.posted_within_days) {
      params.set('posted_within_days', String(filters.posted_within_days));
    }

    if (filters.skills) params.set('skills', filters.skills.trim());
    if (filters.company) params.set('company', filters.company.trim());

    const minSal = filters.min_salary ?? filters.salary_min;
    if (minSal) params.set('salary_min', String(minSal));

    const maxSal = filters.max_salary ?? filters.salary_max;
    if (maxSal) params.set('salary_max', String(maxSal));

    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.offset) params.set('offset', String(filters.offset));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<any>(`/api/jobs${qs}`);

    // Normalize response: handle both { jobs: [...], total: ... } and direct array [...]
    if (Array.isArray(res)) {
      return { jobs: res.map(normalizeJob), total: res.length };
    }
    const rawJobs = Array.isArray(res.jobs) ? res.jobs : [];
    return {
      jobs: rawJobs.map(normalizeJob),
      total: typeof res.total === 'number' ? res.total : rawJobs.length,
      page: res.page || 1,
      page_size: res.page_size || rawJobs.length,
      total_pages: res.total_pages || 1,
    };
  }

  public async getJob(id: string): Promise<Job> {
    const res = await this.request<any>(`/api/jobs/${encodeURIComponent(id)}`);
    return normalizeJob(res.job || res);
  }

  public async getRecommendedJobs(): Promise<Job[]> {
    const res = await this.request<any>('/api/jobs/recommended');
    const jobs = Array.isArray(res.jobs) ? res.jobs : (Array.isArray(res.recommended) ? res.recommended : []);
    return jobs.map(normalizeJob);
  }

  public async getSavedJobs(): Promise<Job[]> {
    const res = await this.request<any>('/api/saved-jobs');
    const jobs = Array.isArray(res.jobs) ? res.jobs : [];
    return jobs.map(normalizeJob);
  }

  public async saveJob(id: string): Promise<{ success: boolean; saved: boolean }> {
    return this.request<{ success: boolean; saved: boolean }>(`/api/jobs/${encodeURIComponent(id)}/save`, {
      method: 'POST',
    });
  }

  public async unsaveJob(id: string): Promise<{ success: boolean; saved: boolean }> {
    return this.request<{ success: boolean; saved: boolean }>(`/api/jobs/${encodeURIComponent(id)}/save`, {
      method: 'DELETE',
    });
  }

  public async logout(): Promise<void> {
    this.setToken(null);
  }

  public async getCurrentUser(): Promise<any> {
    return this.request<any>('/api/auth/me', {}, AUTH_API_URL);
  }

  /**
   * Section 7, 8, 33: Authenticate with verified Firebase ID Token
   */
  public async verifyFirebaseLogin(idToken: string): Promise<any> {
    this.setToken(idToken);
    const res = await this.request<any>('/api/auth/firebase-verify', {
      method: 'POST',
    }, AUTH_API_URL);
    return res;
  }

  public async saveResumeAnalysis(
    fileName: string,
    analysis: ResumeAnalysis
  ): Promise<{ saved: boolean; fileName: string; updatedAt: string }> {
    return this.request('/api/resumes/analysis', {
      method: 'PUT',
      body: JSON.stringify({ fileName, analysis })
    });
  }

  public async getResumeAnalysis(): Promise<{
    resume: { fileName: string; analysis: ResumeAnalysis; updatedAt: string } | null;
  }> {
    return this.request('/api/resumes/analysis');
  }

  /**
   * Section 24, 27: Explicit Terms & Conditions Consent & Profile Activation
   */
  public async completeOnboarding(
    termsAgreed: boolean,
    termsVersion: string,
    privacyAgreed: boolean,
    privacyVersion: string
  ): Promise<any> {
    return this.request<any>('/api/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify({
        terms_agreed: termsAgreed,
        terms_version: termsVersion,
        privacy_agreed: privacyAgreed,
        privacy_version: privacyVersion,
      }),
    }, AUTH_API_URL);
  }

  public async getLegalDocuments(): Promise<any> {
    return this.request<any>('/api/onboarding/legal-documents', {}, AUTH_API_URL);
  }

  public async getIntegrationsStatus(): Promise<any> {
    return this.request<any>('/api/integrations/status');
  }

  public async connectGitHub(username: string): Promise<any> {
    return this.request<any>('/api/integrations/github/connect', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  public async disconnectGitHub(): Promise<any> {
    return this.request<any>('/api/integrations/github/disconnect', {
      method: 'POST',
    });
  }

  public async connectLinkedIn(): Promise<any> {
    return this.request<any>('/api/integrations/linkedin/connect', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  public async disconnectLinkedIn(): Promise<any> {
    return this.request<any>('/api/integrations/linkedin/disconnect', {
      method: 'POST',
    });
  }

  public async getJobPortals(): Promise<any> {
    return this.request<any>('/api/integrations/job-portals');
  }

  public async getApplications(): Promise<any[]> {
    const res = await this.request<any>('/api/applications');
    return res.applications || [];
  }

  public async getNotifications(): Promise<any[]> {
    const res = await this.request<any>('/api/notifications');
    return res.notifications || [];
  }

  public async markNotificationRead(id: string): Promise<void> {
    await this.request(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
  }

  public async updateApplication(
    id: string,
    updates: { status?: 'started' | 'submitted'; notes?: string },
  ): Promise<any> {
    return this.request<any>(`/api/applications/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteApplication(id: string): Promise<void> {
    await this.request(`/api/applications/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  public async createApplication(payload: { job_id: string; status?: string; notes?: string }): Promise<any> {
    return this.request<any>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();

// Expose on window for browser-level script interoperability matching Section 5
if (typeof window !== 'undefined') {
  (window as any).JobPortalAPI = {
    apiUrl: PRIMARY_RENDER_BACKEND,
    listJobs: (f: any) => api.listJobs(f),
    getJob: (id: string) => api.getJob(id),
    fetchJobById: (id: string) => api.getJob(id),
    fetchJobs: (f: any) => api.listJobs(f),
    searchJobs: (f: any) => api.listJobs(f),
    fetchSavedJobs: () => api.getSavedJobs(),
    saveJob: (id: string) => api.saveJob(id),
    removeSavedJob: (id: string) => api.unsaveJob(id),
    logout: () => api.logout(),
    fetchCurrentUser: () => api.getCurrentUser(),
    fetchRecommendations: () => api.getRecommendedJobs(),
    fetchApplications: () => api.getApplications(),
    createApplication: (a: any) => api.createApplication(a),
    isAuthenticated: () => api.isAuthenticated(),
  };
}
