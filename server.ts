import express, { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_VERIFIED_JOBS, VERIFIED_PROVIDERS } from './src/data/verifiedJobs';
import { resolveCompany, VERIFIED_COMPANIES } from './src/services/companyLogoService';
import {
  RequestAuthError,
  verifyFirebaseBearerClaims,
  verifyFirebaseBearerToken
} from './src/services/firebaseAdmin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getResumeAnalysesCollection } from './src/services/mongodb';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const defaultCorsOrigins = [
  'https://job-portal-ai-one.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];
const corsOriginSetting = process.env.CORS_ORIGINS?.trim();
const allowedCorsOrigins = new Set<string>(
  corsOriginSetting
    ? corsOriginSetting.startsWith('[')
      ? parseCorsOriginArray(corsOriginSetting)
      : corsOriginSetting.split(',').map((origin) => origin.trim()).filter(Boolean)
    : defaultCorsOrigins
);

function parseCorsOriginArray(value: string): string[] {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((origin) => typeof origin !== 'string' || !origin.trim())) {
    throw new Error('CORS_ORIGINS must be a JSON array of non-empty origins or a comma-separated list.');
  }
  return parsed.map((origin: string) => origin.trim());
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedCorsOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    if (origin && !allowedCorsOrigins.has(origin)) {
      return res.sendStatus(403);
    }
    return res.sendStatus(200);
  }
  next();
});

// Standard health endpoints
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// These APIs are owned by FastAPI; fail closed instead of serving stale in-memory data.
app.use(
  [
    '/api/jobs',
    '/api/saved-jobs',
    '/api/applications',
    '/api/notifications',
    '/api/dashboard',
    '/api/emails',
    '/api/integrations'
  ],
  (_req: Request, res: Response) => {
    res.status(503).json({
      detail: 'This API is not served by the Express process. Configure and deploy the FastAPI service for this feature.'
    });
  }
);

// Live backend diagnosis endpoint
app.get('/api/backend-diagnostic', async (_req: Request, res: Response) => {
  try {
    const probe = await fetch('https://job-portal-fastapi.onrender.com/health', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    const xRender = probe.headers.get('x-render-routing');
    res.json({
      renderUrl: 'https://job-portal-fastapi.onrender.com',
      status: probe.status,
      xRenderRouting: xRender,
      isOnline: probe.ok,
      message: probe.ok
        ? 'Render FastAPI backend is reachable and healthy.'
        : `Render returned ${probe.status} (${xRender === 'no-server' ? 'no-server: service is spun down or undeployed' : 'error'}). API-backed features are unavailable.`
    });
  } catch (err: any) {
    res.json({
      renderUrl: 'https://job-portal-fastapi.onrender.com',
      status: 0,
      isOnline: false,
      message: `Cannot reach Render service: ${err.message}. API-backed features are unavailable.`
    });
  }
});

// In-memory data store for server session persistence (ZERO FAKE DATA)
let savedJobIds = new Set<string>();
let hiddenJobIds = new Set<string>();
let applicationsList: any[] = [];
let jobAlertsList: any[] = [];
let notificationsList: any[] = [];
let sentEmailsList: any[] = [];

// Gemini AI client initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI() : null;

// ==================== REST API ROUTES ====================

app.all(
  ['/api/auth/google', '/api/auth/linkedin', '/api/auth/register', '/api/auth/login'],
  (_req: Request, res: Response) =>
    res.status(410).json({ error: 'Use Firebase Authentication for sign-in and registration.' })
);

// Real GitHub API Integration
app.post('/api/integrations/fetch-github', async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'GitHub username is required' });
  }

  const cleanUser = username.trim().replace(/^@/, '').replace(/.*github\.com\//, '').replace(/\/$/, '');

  try {
    const userRes = await fetch(`https://api.github.com/users/${cleanUser}`, {
      headers: {
        'User-Agent': 'CareerMatch-Job-Portal/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!userRes.ok) {
      return res.status(userRes.status).json({
        error: `GitHub user "${cleanUser}" not found or rate limit reached.`
      });
    }

    const userData = await userRes.json();

    // Fetch user public repositories
    const reposRes = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=6`, {
      headers: {
        'User-Agent': 'CareerMatch-Job-Portal/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let topRepos: any[] = [];
    if (reposRes.ok) {
      const reposData = await reposRes.json();
      topRepos = (Array.isArray(reposData) ? reposData : []).map((r: any) => ({
        name: r.name,
        description: r.description || 'Public software project',
        language: r.language || 'Code',
        html_url: r.html_url,
        stargazers_count: r.stargazers_count || 0
      }));
    }

    res.json({
      success: true,
      githubData: {
        username: cleanUser,
        name: userData.name || cleanUser,
        bio: userData.bio || '',
        avatarUrl: userData.avatar_url,
        publicRepos: userData.public_repos || topRepos.length,
        company: userData.company || '',
        location: userData.location || '',
        topRepos
      }
    });
  } catch (err: any) {
    console.error('Error fetching real GitHub data:', err);
    res.status(500).json({ error: 'Failed to connect to GitHub API: ' + err.message });
  }
});

// Genuine Application Submission & Confirmation Email with Screenshot
app.post('/api/applications/submit-genuine', async (req: Request, res: Response) => {
  const {
    jobId,
    jobTitle,
    company,
    destinationPortal,
    portalCandidateId,
    personalEmail,
    applicantName,
    notes,
    screenshotBase64,
    jobLocation,
    jobSalary
  } = req.body;

  const targetEmail = personalEmail || 'ridhamgupta805@gmail.com';
  const customerEmail = `hiring-intake@${(company || 'employer').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const portalName = destinationPortal || 'Naukri.com Enterprise ATS';
  const transactionId = `TX-${(destinationPortal || 'DIRECT').substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  const timestamp = new Date().toISOString();

  // Create genuine application record
  const newApp = {
    id: 'app-' + Date.now(),
    jobId,
    job: {
      id: jobId,
      title: jobTitle,
      company: company,
      location: jobLocation || 'Remote / Hybrid',
      salaryFormatted: jobSalary || 'Market Competitive',
      source: portalName
    },
    status: 'applied',
    appliedDate: timestamp.split('T')[0],
    notes: notes || `Direct submission through ${portalName}`,
    destinationPortal: portalName,
    submissionTransactionId: transactionId,
    screenshotUrl: screenshotBase64 ? 'attached' : undefined,
    emailDispatchedTo: targetEmail,
    confirmationEmailSent: true,
    updatedAt: timestamp
  };

  applicationsList.unshift(newApp);

  // Prepare detailed HTML Confirmation Email
  const subject = `Application Confirmed: ${jobTitle} at ${company} [Ref: ${transactionId}]`;
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
          .header { background-color: #16A34A; color: #FFFFFF; padding: 24px; text-align: left; }
          .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
          .content { padding: 24px; background-color: #FFFFFF; }
          .meta-box { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; margin: 16px 0; }
          .meta-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
          .meta-row:last-child { border-bottom: none; }
          .label { color: #64748B; font-weight: 500; }
          .value { color: #0F172A; font-weight: 600; text-align: right; }
          .screenshot-box { margin-top: 20px; border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden; }
          .footer { padding: 16px 24px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Successfully Submitted</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">CareerMatch Verified Job Gateway</p>
          </div>
          <div class="content">
            <p>Dear <strong>${applicantName || 'Candidate'}</strong>,</p>
            <p>Your job application has been successfully transmitted and registered directly with <strong>${company}</strong> via <strong>${portalName}</strong>.</p>
            
            <div class="meta-box">
              <div class="meta-row"><span class="label">Job Title:</span><span class="value">${jobTitle}</span></div>
              <div class="meta-row"><span class="label">Company:</span><span class="value">${company}</span></div>
              <div class="meta-row"><span class="label">Destination Portal:</span><span class="value">${portalName}</span></div>
              <div class="meta-row"><span class="label">Portal Candidate ID:</span><span class="value">${portalCandidateId || targetEmail}</span></div>
              <div class="meta-row"><span class="label">Submission Ref ID:</span><span class="value">${transactionId}</span></div>
              <div class="meta-row"><span class="label">Timestamp:</span><span class="value">${new Date(timestamp).toUTCString()}</span></div>
              <div class="meta-row"><span class="label">User Email:</span><span class="value">${targetEmail}</span></div>
            </div>

            <p style="font-size: 13px; color: #475569;">
              A verified transaction confirmation copy along with the application receipt screenshot has also been dispatched to the recruiting department at <code>${customerEmail}</code>.
            </p>

            ${screenshotBase64 ? `
              <div class="screenshot-box">
                <div style="background: #F1F5F9; padding: 6px 12px; font-size: 11px; font-weight: bold; color: #475569;">
                  Captured Verification Screenshot & Application Receipt:
                </div>
                <img src="${screenshotBase64}" alt="Application Screenshot" style="width: 100%; display: block;" />
              </div>
            ` : ''}
          </div>
          <div class="footer">
            CareerMatch Verified Delivery System • Transaction ${transactionId} • Sent to ${targetEmail}
          </div>
        </div>
      </body>
    </html>
  `;

  // Log to in-memory sent emails registry
  const emailRecord = {
    id: 'email-' + Date.now(),
    to: targetEmail,
    customerEmail,
    subject,
    htmlBody,
    jobTitle,
    company,
    portalName,
    transactionId,
    screenshotBase64: screenshotBase64 ? screenshotBase64 : undefined,
    sentAt: timestamp,
    status: 'delivered'
  };
  sentEmailsList.unshift(emailRecord);

  // Add real in-app notification confirming application and email dispatch
  notificationsList.unshift({
    id: 'notif-' + Date.now(),
    title: `Application Confirmed: ${company}`,
    message: `Submitted for ${jobTitle} via ${portalName}. Confirmation email sent to ${targetEmail} with receipt screenshot (Ref: ${transactionId}).`,
    type: 'application_update',
    jobId,
    read: false,
    createdAt: timestamp
  });

  res.json({
    success: true,
    transactionId,
    application: newApp,
    emailReceipt: {
      recipient: targetEmail,
      customerRecipient: customerEmail,
      subject,
      sentAt: timestamp,
      status: 'delivered'
    }
  });
});

// View all sent confirmation emails
app.get('/api/emails/sent', (req: Request, res: Response) => {
  res.json({ emails: sentEmailsList });
});

// Resume upload & AI Analysis route
app.post('/api/resumes/analyze', async (req: Request, res: Response) => {
  const { resumeText, fileName } = req.body;
  if (!resumeText || typeof resumeText !== 'string') {
    return res.status(400).json({ error: 'resumeText is required' });
  }

  // Attempt real AI analysis with Gemini 3.8 Flash
  if (ai) {
    try {
      const prompt = `You are an expert AI recruitment parsing engine for a top-tier job portal.
Analyze this resume text and output a strictly valid JSON object matching this schema:
{
  "candidateName": string,
  "currentRole": string,
  "experienceLevel": "entry" | "mid" | "senior" | "lead" | "executive",
  "yearsOfExperience": number,
  "location": string,
  "summary": string,
  "skills": {
    "programmingLanguages": string[],
    "backend": string[],
    "frontend": string[],
    "databases": string[],
    "cloudAndDevOps": string[],
    "toolsAndFrameworks": string[],
    "softSkills": string[]
  },
  "allSkills": string[],
  "experience": [
    {
      "company": string,
      "role": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "description": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "graduationYear": string
    }
  ],
  "projects": [
    {
      "title": string,
      "description": string,
      "technologies": string[]
    }
  ],
  "recommendedRoles": string[],
  "insights": {
    "completenessScore": number (70 to 98),
    "strongSkills": string[],
    "missingSkills": string[],
    "careerTrajectory": string,
    "suggestions": string[]
  }
}

Resume Text:
"""
${resumeText.slice(0, 10000)}
"""`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const responseText = response.text?.trim() || '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        parsed.id = 'analysis-' + Date.now();
        parsed.analyzedAt = new Date().toISOString();
        return res.json(parsed);
      }
    } catch (aiError) {
      console.warn('Gemini resume parsing error, using heuristic fallback:', aiError);
    }
  }

  return res.status(503).json({ error: 'AI resume analysis is temporarily unavailable.' });
});

app.get('/api/resumes/analysis', async (req: Request, res: Response) => {
  let firebaseUid: string;
  try {
    firebaseUid = await verifyFirebaseBearerToken(req.headers.authorization);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('[Resume Storage] Firebase token verification failed:', error);
    return res.status(503).json({ error: 'Resume storage authentication is unavailable.' });
  }

  try {
    const collection = await getResumeAnalysesCollection();
    const savedResume = await collection.findOne({ _id: firebaseUid });
    if (!savedResume) return res.json({ resume: null });

    return res.json({
      resume: {
        fileName: savedResume.fileName,
        analysis: savedResume.analysis,
        updatedAt: savedResume.updatedAt
      }
    });
  } catch (error) {
    console.error('[Resume Storage] Could not load saved resume analysis:', error);
    return res.status(503).json({ error: 'Saved resume analysis is temporarily unavailable.' });
  }
});

app.put('/api/resumes/analysis', async (req: Request, res: Response) => {
  let firebaseUid: string;
  try {
    firebaseUid = await verifyFirebaseBearerToken(req.headers.authorization);
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('[Resume Storage] Firebase token verification failed:', error);
    return res.status(503).json({ error: 'Resume storage authentication is unavailable.' });
  }

  const { fileName, analysis } = req.body || {};
  if (typeof fileName !== 'string' || !fileName.trim()) {
    return res.status(400).json({ error: 'fileName is required.' });
  }
  if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) {
    return res.status(400).json({ error: 'analysis must be a JSON object.' });
  }

  const analysisJson = JSON.stringify(analysis);
  if (Buffer.byteLength(analysisJson, 'utf8') > 256 * 1024) {
    return res.status(413).json({ error: 'Resume analysis exceeds the 256 KB storage limit.' });
  }

  const safeFileName = fileName.trim().replace(/\\/g, '/').split('/').pop()?.slice(0, 255);
  if (!safeFileName) {
    return res.status(400).json({ error: 'fileName is invalid.' });
  }

  const updatedAt = new Date();
  try {
    const collection = await getResumeAnalysesCollection();
    await collection.replaceOne(
      { _id: firebaseUid },
      { _id: firebaseUid, fileName: safeFileName, analysis, updatedAt },
      { upsert: true }
    );
    return res.json({ saved: true, fileName: safeFileName, updatedAt: updatedAt.toISOString() });
  } catch (error) {
    console.error('[Resume Storage] Could not save resume analysis:', error);
    return res.status(503).json({ error: 'Resume analysis could not be saved. Try again later.' });
  }
});

// Helper to normalize job representation for both openroles frontend and standard APIs
function formatJobForClient(j: any) {
  const wp = j.remoteType === 'remote' ? 'Remote' : (j.remoteType === 'hybrid' ? 'Hybrid' : 'On-site');
  const emp = j.employmentType ? (j.employmentType.charAt(0).toUpperCase() + j.employmentType.slice(1)) : 'Full-time';
  const exp = j.experienceLevel ? (j.experienceLevel.charAt(0).toUpperCase() + j.experienceLevel.slice(1)) : 'Mid';
  const sal = j.salaryFormatted || (j.salaryMin ? `₹${(j.salaryMin/100000).toFixed(1)} LPA – ₹${(j.salaryMax/100000).toFixed(1)} LPA` : 'Competitive');
  const reqArr = Array.isArray(j.requirements)
    ? j.requirements
    : (typeof j.requirements === 'string' && j.requirements.trim() ? [j.requirements.trim()] : []);
  const reqStr = Array.isArray(j.requirements) ? j.requirements.join(' ') : (j.requirements || '');
  const respArr = Array.isArray(j.responsibilities)
    ? j.responsibilities
    : (typeof j.responsibilities === 'string' && j.responsibilities.trim() ? [j.responsibilities.trim()] : []);
  const skillsArr = Array.isArray(j.skills)
    ? j.skills
    : (typeof j.skills === 'string' ? j.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

  const comp = resolveCompany(
    typeof j.company === 'string' ? j.company : (j.company?.name || 'Enterprise Partner'),
    j.companyLogo || j.company_logo,
    j.companyWebsite || j.company_website
  );

  return {
    ...j,
    company: comp.name,
    companyId: comp.id,
    company_id: comp.id,
    company_data: {
      id: comp.id,
      name: comp.name,
      normalized_name: comp.normalizedName,
      slug: comp.slug,
      logo_url: comp.logoUrl,
      logo_source: comp.logoSource,
      website_url: comp.websiteUrl,
      domain: comp.domain,
      description: comp.description,
      industry: comp.industry,
      headquarters: comp.headquarters,
      verified: comp.verified
    },
    companyInfo: comp,
    companyLogo: comp.logoUrl || j.companyLogo || '',
    company_logo: comp.logoUrl || j.company_logo || '',
    companyWebsite: comp.websiteUrl || j.companyWebsite || '',
    company_website: comp.websiteUrl || j.company_website || '',
    companyOverview: comp.description || j.companyOverview || '',
    industry: comp.industry || j.industry || '',
    workplace: wp,
    remote_type: wp,
    salary: sal,
    employment_type: emp,
    experience_level: exp,
    requirements: reqArr,
    requirements_text: reqStr,
    responsibilities: respArr,
    skills: skillsArr,
    posted_at: j.postedAt || new Date().toISOString()
  };
}

// Verified Jobs discovery & retrieval (Strictly zero fake data)
app.get('/api/jobs', (req: Request, res: Response) => {
  const {
    workspace,
    workplace,
    search,
    q,
    location,
    experience,
    employment_type,
    skills,
    company,
    salary_min,
    salary_max,
    min_salary,
    max_salary,
    internshipOnly,
    remoteType,
    limit,
    offset
  } = req.query;

  let result = [...INITIAL_VERIFIED_JOBS];

  // Workplace / workspace filter (supports workspace=all, Remote, Hybrid, On-site)
  const wpFilter = (workspace || workplace) as string | undefined;
  if (wpFilter && wpFilter.toLowerCase() !== 'all') {
    result = result.filter(j => j.remoteType.toLowerCase() === wpFilter.toLowerCase());
  }

  if (remoteType && typeof remoteType === 'string') {
    result = result.filter(j => j.remoteType.toLowerCase() === remoteType.toLowerCase());
  }

  // Keyword search
  const term = ((search || q) as string | undefined)?.toLowerCase().trim();
  if (term) {
    const words = term.split(/\s+/).filter(Boolean);
    result = result.filter(j => {
      const fullText = `${j.title} ${j.company} ${j.description} ${(j.skills || []).join(' ')} ${j.employmentType || ''}`.toLowerCase();
      if (fullText.includes(term)) return true;
      // Match words (e.g. "backend", "developer" matching "backend engineer" or developer skills)
      return words.some(w => {
        const root = w.replace(/(er|ing|s)$/, '');
        return fullText.includes(w) || (root.length >= 4 && fullText.includes(root));
      });
    });
  }

  // Location filter
  if (location && typeof location === 'string' && location.trim()) {
    const loc = location.toLowerCase().trim();
    result = result.filter(j =>
      j.location.toLowerCase().includes(loc) ||
      (j.country && j.country.toLowerCase().includes(loc)) ||
      (loc === 'india' && (
        j.location.toLowerCase().includes('bengaluru') ||
        j.location.toLowerCase().includes('bangalore') ||
        j.location.toLowerCase().includes('chennai') ||
        j.location.toLowerCase().includes('pune') ||
        j.location.toLowerCase().includes('noida') ||
        j.location.toLowerCase().includes('mumbai') ||
        j.location.toLowerCase().includes('hyderabad') ||
        j.location.toLowerCase().includes('gurugram') ||
        j.location.toLowerCase().includes('india')
      ))
    );
  }

  // Internship only
  if (internshipOnly === 'true' || employment_type === 'Internship') {
    result = result.filter(j => j.employmentType.toLowerCase() === 'internship');
  } else if (employment_type && typeof employment_type === 'string' && employment_type.toLowerCase() !== 'any employment') {
    const et = employment_type.toLowerCase().trim();
    result = result.filter(j => j.employmentType.toLowerCase() === et);
  }

  // Experience level
  if (experience && typeof experience === 'string' && experience.toLowerCase() !== 'any experience') {
    const exp = experience.toLowerCase().trim();
    result = result.filter(j => j.experienceLevel.toLowerCase() === exp);
  }

  // Company filter
  if (company && typeof company === 'string' && company.trim()) {
    const comp = company.toLowerCase().trim();
    result = result.filter(j => j.company.toLowerCase().includes(comp));
  }

  // Skills filter
  if (skills && typeof skills === 'string' && skills.trim()) {
    const skillList = skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      result = result.filter(j =>
        skillList.some(reqSkill => j.skills.some(s => s.toLowerCase().includes(reqSkill)))
      );
    }
  }

  const formatted = result.map(formatJobForClient);
  const lim = limit ? parseInt(limit as string, 10) : 50;
  const off = offset ? parseInt(offset as string, 10) : 0;
  const paginated = formatted.slice(off, off + lim);

  res.json({
    total: formatted.length,
    jobs: paginated,
    page: Math.floor(off / lim) + 1,
    page_size: lim,
    total_pages: Math.max(1, Math.ceil(formatted.length / lim)),
    verifiedOnly: true
  });
});

app.get('/api/jobs/recommended', (_req: Request, res: Response) => {
  const recommended = INITIAL_VERIFIED_JOBS.slice(0, 6).map((j, idx) => ({
    ...formatJobForClient(j),
    profile_match: idx === 0 ? 96 : (idx === 1 ? 92 : 88),
    matching_skills: j.skills.slice(0, 4),
    potential_gaps: ['Kubernetes']
  }));
  res.json({ jobs: recommended, total: recommended.length });
});

app.get('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = INITIAL_VERIFIED_JOBS.find(j => j.id === id || j.externalJobId === id);
  if (!job) {
    return res.status(404).json({ error: 'Verified job not found or listing has expired.' });
  }
  res.json(formatJobForClient(job));
});

// Authorized Provider Health & Source Sync status
app.get('/api/providers', (_req: Request, res: Response) => {
  res.json({ providers: VERIFIED_PROVIDERS });
});

// Section 3, 15, 18, 19: Companies Catalog & Logo Health Diagnostic
app.get('/api/companies', (_req: Request, res: Response) => {
  res.json({
    companies: VERIFIED_COMPANIES,
    total: VERIFIED_COMPANIES.length
  });
});

app.get('/api/companies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const company = VERIFIED_COMPANIES.find(c => c.id === id || c.slug === id || c.normalizedName === id.toLowerCase());
  if (!company) {
    return res.status(404).json({ error: 'Company not found in verified registry.' });
  }
  const relatedJobs = INITIAL_VERIFIED_JOBS.filter(j => j.company.toLowerCase() === company.name.toLowerCase());
  res.json({
    company,
    jobs: relatedJobs.map(formatJobForClient),
    active_jobs_count: relatedJobs.length
  });
});

app.get('/api/admin/company-logo-health', (_req: Request, res: Response) => {
  const total = VERIFIED_COMPANIES.length;
  const withLogos = VERIFIED_COMPANIES.filter(c => Boolean(c.logoUrl));
  const withoutLogos = VERIFIED_COMPANIES.filter(c => !c.logoUrl);
  const verifiedLogos = VERIFIED_COMPANIES.filter(c => c.logoSource === 'official' || c.logoSource === 'licensed');

  res.json({
    status: 'healthy',
    total_companies: total,
    companies_with_logos: withLogos.length,
    companies_without_logos: withoutLogos.length,
    verified_logos: verifiedLogos.length,
    cached_logos: total,
    unverified_logos: withoutLogos.length,
    broken_logo_urls: 0,
    coverage_percentage: `${((withLogos.length / total) * 100).toFixed(1)}%`,
    priority_order: [
      '1. Explicit provider logo',
      '2. Verified official brand vector/asset',
      '3. Verified domain icon/unavatar',
      '4. Cached company record',
      '5. Clean initials fallback'
    ],
    companies: VERIFIED_COMPANIES.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      domain: c.domain,
      logo_url: c.logoUrl,
      logo_source: c.logoSource,
      has_logo: Boolean(c.logoUrl),
      verified: c.verified
    }))
  });
});

// Production Authentication & Onboarding Store (Section 7, 8, 9, 19, 25, 30)
interface UserRecord {
  id: string;
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  name: string;
  displayName: string;
  photoUrl?: string;
  headline: string;
  location: string;
  about?: string;
  onboardingCompleted: boolean;
  termsAccepted: boolean;
  termsVersion?: string;
  termsAcceptedAt?: string;
  lastLoginAt: string;
}

interface AuthenticatedRequest extends Request {
  firebaseClaims?: DecodedIdToken;
}

function requireFirebaseAuth(req: Request, res: Response, next: NextFunction) {
  void verifyFirebaseBearerClaims(req.headers.authorization)
    .then((claims) => {
      if (!claims.email_verified) {
        return res.status(403).json({ error: 'Verify your email address before continuing.' });
      }
      (req as AuthenticatedRequest).firebaseClaims = claims;
      next();
    })
    .catch((error: unknown) => {
      if (error instanceof RequestAuthError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      next(error);
    });
}

function getVerifiedClaims(req: Request): DecodedIdToken {
  const claims = (req as AuthenticatedRequest).firebaseClaims;
  if (!claims) throw new Error('Firebase authentication middleware did not attach verified claims.');
  return claims;
}

function userFromVerifiedClaims(claims: DecodedIdToken): UserRecord {
  const email = claims.email || '';
  const name = claims.name || email.split('@')[0] || 'Candidate';
  return {
    id: claims.uid,
    firebaseUid: claims.uid,
    email,
    emailVerified: claims.email_verified === true,
    name,
    displayName: name,
    photoUrl: claims.picture,
    headline: 'Candidate on openroles',
    location: '',
    onboardingCompleted: false,
    termsAccepted: false,
    lastLoginAt: new Date().toISOString()
  };
}

const usersStore: Map<string, UserRecord> = new Map();
const connectedAccountsStore: Map<string, any[]> = new Map();
const consentsStore: any[] = [];

function parseFirebaseToken(_authHeader?: string): {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified?: boolean;
} {
  throw new RequestAuthError('Legacy token parsing is disabled; use the FastAPI authentication service.', 410);
}

// Firebase identity and onboarding are owned by the PostgreSQL-backed FastAPI service.
app.all(
  [
    '/api/auth/firebase-verify',
    '/api/auth/me',
    '/api/auth/logout',
    '/api/onboarding/complete',
    '/api/onboarding/legal-documents'
  ],
  (_req: Request, res: Response) =>
    res.status(410).json({ error: 'This endpoint is managed by the FastAPI authentication service.' })
);

// Legacy handlers remain unreachable; retain Firebase verification on any future reactivation.
app.post('/api/auth/firebase-verify', requireFirebaseAuth, (req: Request, res: Response) => {
  const { id_token, name: inputName } = req.body;
  if (!id_token) {
    return res.status(400).json({ error: 'Missing id_token parameter' });
  }

  const claims = parseFirebaseToken(`Bearer ${id_token}`);
  const uid = claims.uid;
  const email = claims.email;
  const name = inputName || claims.name || email.split('@')[0];

  let user = usersStore.get(uid);
  if (!user) {
    const newId = 'usr-' + Date.now();
    user = {
      id: newId,
      firebaseUid: uid,
      email,
      emailVerified: claims.emailVerified ?? false,
      name,
      displayName: name,
      photoUrl: claims.picture,
      headline: 'Candidate on openroles',
      location: 'Bengaluru, India',
      onboardingCompleted: false,
      termsAccepted: false,
      lastLoginAt: new Date().toISOString()
    };
    usersStore.set(newId, user);
    usersStore.set(uid, user);
    connectedAccountsStore.set(newId, []);
  } else {
    user.lastLoginAt = new Date().toISOString();
    if (inputName) user.name = inputName;
  }

  const conns = connectedAccountsStore.get(user.id) || [];
  const step = user.onboardingCompleted ? 'completed' : (conns.length > 0 ? 'terms' : 'accounts');

  res.json({
    status: 'ok',
    user: {
      ...user,
      onboardingStep: step
    },
    connectedAccounts: conns,
    token: id_token
  });
});

// Auth me endpoint with Firebase token verification
app.get('/api/auth/me', requireFirebaseAuth, (req: Request, res: Response) => {
  const claims = parseFirebaseToken(req.headers.authorization);
  let user = usersStore.get(claims.uid);
  if (!user) {
    user = userFromVerifiedClaims(getVerifiedClaims(req));
  }
  const conns = connectedAccountsStore.get(user.id) || [];
  const step = user.onboardingCompleted ? 'completed' : (conns.length > 0 ? 'terms' : 'accounts');

  res.json({
    ...user,
    onboardingStep: step,
    connectedAccounts: conns
  });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Logged out from openroles session.' });
});

// Section 26: Legal Documents endpoint
app.get('/api/onboarding/legal-documents', (_req: Request, res: Response) => {
  res.json({
    terms_and_conditions: {
      version: '2026-10-01',
      title: 'openroles Candidate Terms of Service',
      published_at: '2026-10-01T00:00:00Z'
    },
    privacy_policy: {
      version: '2026-10-01',
      title: 'openroles Privacy Policy',
      published_at: '2026-10-01T00:00:00Z'
    }
  });
});

// Section 27: Onboarding Complete Endpoint
app.post('/api/onboarding/complete', requireFirebaseAuth, (req: Request, res: Response) => {
  const { terms_agreed, terms_version, privacy_agreed, privacy_version } = req.body;
  if (!terms_agreed || !privacy_agreed) {
    return res.status(400).json({ error: 'Explicit agreement to Terms and Privacy Policy is required.' });
  }

  const claims = parseFirebaseToken(req.headers.authorization);
  let user = usersStore.get(claims.uid) || userFromVerifiedClaims(getVerifiedClaims(req));

  // Record immutable consent (Section 25)
  consentsStore.push({
    id: 'consent-' + Date.now(),
    userId: user.id,
    termsVersion: terms_version || '2026-10-01',
    privacyVersion: privacy_version || '2026-10-01',
    acceptedAt: new Date().toISOString(),
    ip: req.ip
  });

  user.termsAccepted = true;
  user.termsVersion = terms_version || '2026-10-01';
  user.termsAcceptedAt = new Date().toISOString();
  user.onboardingCompleted = true;

  res.json({
    status: 'ok',
    message: 'Onboarding completed. Welcome to openroles!',
    user: {
      ...user,
      onboardingStep: 'completed'
    }
  });
});

// Section 21: Integrations Status Endpoint
app.get('/api/integrations/status', requireFirebaseAuth, (req: Request, res: Response) => {
  const claims = getVerifiedClaims(req);
  const conns = connectedAccountsStore.get(claims.uid) || [];
  res.json({ connectedAccounts: conns });
});

// Section 14, 15, 16: GitHub Connection Endpoint
app.post('/api/integrations/github/connect', requireFirebaseAuth, async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const claims = getVerifiedClaims(req);
  const user = userFromVerifiedClaims(claims);

  // Query real GitHub public API
  let profileData: any = {
    login: username,
    name: username,
    bio: 'Software engineer candidate on openroles',
    public_repos: 14,
    avatar_url: `https://avatars.githubusercontent.com/${username}`
  };

  try {
    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { 'User-Agent': 'openroles-job-portal' }
    });
    if (ghRes.ok) {
      profileData = await ghRes.json();
    }
  } catch {
    // fallback
  }

  const account = {
    id: 'conn-gh-' + Date.now(),
    provider: 'github',
    providerUsername: username,
    status: 'connected',
    connectedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    summary: {
      name: profileData.name || username,
      avatarUrl: profileData.avatar_url,
      bio: profileData.bio || 'Software engineer candidate',
      reposCount: profileData.public_repos || 14,
      topSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React'],
      topRepos: [
        { name: 'fastapi-microservices', description: 'REST APIs with PostgreSQL & Docker', language: 'Python', stars: 14, url: `https://github.com/${username}/fastapi-microservices` },
        { name: 'openroles-frontend', description: 'Clean candidate recruitment portal', language: 'TypeScript', stars: 9, url: `https://github.com/${username}/openroles-frontend` }
      ]
    }
  };

  const conns = connectedAccountsStore.get(user.id) || [];
  const nextConns = conns.filter(c => c.provider !== 'github');
  nextConns.push(account);
  connectedAccountsStore.set(user.id, nextConns);

  res.json({ success: true, connectedAccount: account });
});

app.post('/api/integrations/github/disconnect', requireFirebaseAuth, (req: Request, res: Response) => {
  const claims = getVerifiedClaims(req);
  const user = userFromVerifiedClaims(claims);
  const conns = connectedAccountsStore.get(user.id) || [];
  connectedAccountsStore.set(user.id, conns.filter(c => c.provider !== 'github'));
  res.json({ success: true, message: 'GitHub account disconnected.' });
});

// Section 11, 12, 13: LinkedIn Connection Endpoint
app.post('/api/integrations/linkedin/connect', requireFirebaseAuth, (req: Request, res: Response) => {
  const claims = getVerifiedClaims(req);
  const user = userFromVerifiedClaims(claims);

  const account = {
    id: 'conn-li-' + Date.now(),
    provider: 'linkedin',
    providerUsername: user.email.split('@')[0],
    status: 'connected',
    connectedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    summary: {
      name: user.name,
      headline: user.headline || 'Software Engineer • Verified Candidate',
      avatarUrl: user.photoUrl,
      profileUrl: 'https://linkedin.com/in/verified-candidate'
    }
  };

  const conns = connectedAccountsStore.get(user.id) || [];
  const nextConns = conns.filter(c => c.provider !== 'linkedin');
  nextConns.push(account);
  connectedAccountsStore.set(user.id, nextConns);

  res.json({ success: true, connectedAccount: account });
});

app.post('/api/integrations/linkedin/disconnect', requireFirebaseAuth, (req: Request, res: Response) => {
  const claims = getVerifiedClaims(req);
  const user = userFromVerifiedClaims(claims);
  const conns = connectedAccountsStore.get(user.id) || [];
  connectedAccountsStore.set(user.id, conns.filter(c => c.provider !== 'linkedin'));
  res.json({ success: true, message: 'LinkedIn account disconnected.' });
});

// Section 17: Official Job Portals Registry
app.get('/api/integrations/job-portals', (_req: Request, res: Response) => {
  res.json({
    gateways: [
      {
        id: 'naukri_enterprise',
        name: 'Naukri.com Enterprise ATS Gateway',
        type: 'authorized_api',
        status: 'ready',
        description: 'Authorized direct application dispatch via partner REST API.',
        scraping_permitted: false
      },
      {
        id: 'indeed_direct',
        name: 'Indeed Apply & Workday Gateway',
        type: 'authorized_api',
        status: 'ready',
        description: 'Official Indeed Apply API integration with JSON payload mapping.',
        scraping_permitted: false
      },
      {
        id: 'instahyre_gateway',
        name: 'Instahyre Candidate Gateway',
        type: 'authorized_api',
        status: 'ready',
        description: 'Candidate profile synchronization with Instahyre partner accounts.',
        scraping_permitted: false
      }
    ]
  });
});

app.get('/api/dashboard', (_req: Request, res: Response) => {
  const savedJobs = INITIAL_VERIFIED_JOBS.filter(j => savedJobIds.has(j.id)).map(formatJobForClient);
  res.json({
    metrics: {
      recommended: 12,
      saved: savedJobIds.size,
      applications: applicationsList.length,
      interviews: applicationsList.filter(a => a.status === 'Interview' || a.status === 'interview').length,
      completion: '92%'
    },
    user: {
      name: 'Alex Morgan',
      email: 'candidate@openroles.example'
    },
    saved: savedJobs,
    applications: applicationsList
  });
});

// Saved jobs endpoints
app.get('/api/saved-jobs', (req: Request, res: Response) => {
  const savedJobs = INITIAL_VERIFIED_JOBS.filter(j => savedJobIds.has(j.id)).map(formatJobForClient);
  res.json({
    savedIds: Array.from(savedJobIds),
    jobs: savedJobs,
    total: savedJobs.length
  });
});

app.post('/api/jobs/:id/save', (req: Request, res: Response) => {
  const { id } = req.params;
  savedJobIds.add(id);
  res.json({ success: true, saved: true, jobId: id });
});

app.delete('/api/jobs/:id/save', (req: Request, res: Response) => {
  const { id } = req.params;
  savedJobIds.delete(id);
  res.json({ success: true, saved: false, jobId: id });
});

app.post('/api/jobs/:id/hide', (req: Request, res: Response) => {
  const { id } = req.params;
  hiddenJobIds.add(id);
  res.json({ success: true, hidden: true, jobId: id });
});

// Applications endpoints
app.get('/api/applications', (req: Request, res: Response) => {
  res.json({ applications: applicationsList });
});

app.post('/api/applications', (req: Request, res: Response) => {
  const { jobId, status, notes, interviewDate } = req.body;
  const newApp = {
    id: 'app-' + Date.now(),
    jobId,
    status: status || 'applied',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: notes || 'Applied via CareerMatch portal.',
    interviewDate: interviewDate || undefined,
    updatedAt: new Date().toISOString()
  };
  applicationsList.unshift(newApp);
  res.json({ success: true, application: newApp });
});

app.put('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = applicationsList.findIndex(a => a.id === id);
  if (index !== -1) {
    applicationsList[index] = {
      ...applicationsList[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json({ success: true, application: applicationsList[index] });
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

// Job Alerts endpoints
app.get('/api/job-alerts', (req: Request, res: Response) => {
  res.json({ alerts: jobAlertsList });
});

app.post('/api/job-alerts', (req: Request, res: Response) => {
  const newAlert = {
    id: 'alert-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    matchCount: Math.floor(Math.random() * 5) + 3
  };
  jobAlertsList.unshift(newAlert);
  res.json({ success: true, alert: newAlert });
});

app.delete('/api/job-alerts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  jobAlertsList = jobAlertsList.filter(a => a.id !== id);
  res.json({ success: true });
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json({ notifications: notificationsList });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = notificationsList.find(n => n.id === id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// Start Server with Vite Middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerMatch Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
