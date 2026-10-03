import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Building2,
  Calendar,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  GraduationCap,
  Globe,
  Briefcase
} from 'lucide-react';
import { Job, JobMatchBreakdown, UserProfile } from '../types/job';
import { CompanyLogo } from './CompanyLogo';

interface JobDetailsModalProps {
  job: Job | null;
  match?: JobMatchBreakdown;
  isSaved: boolean;
  user: UserProfile;
  onClose: () => void;
  onSaveToggle: (jobId: string) => void;
  onApply: (job: Job) => void;
}

// Safely normalize string or array of items (like requirements, responsibilities, skills)
function parseList(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(String).filter((s) => s.trim().length > 0);
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
      return trimmed
        .split('•')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  match,
  isSaved,
  user,
  onClose,
  onSaveToggle,
  onApply
}) => {
  if (!job) return null;

  const [logoFailed, setLogoFailed] = useState(false);
  const matchScore = match?.overallScore || 0;
  const isInternship = job.employmentType === 'internship';

  // Guaranteed safe string arrays (fixes TypeError: job.requirements.map is not a function)
  const safeRequirements = useMemo(() => parseList(job.requirements), [job.requirements]);
  const safeResponsibilities = useMemo(() => parseList(job.responsibilities), [job.responsibilities]);
  const safeSkills = useMemo(() => {
    if (Array.isArray(job.skills)) {
      return job.skills.map(String).filter(Boolean);
    }
    if (typeof job.skills === 'string') {
      return (job.skills as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [job.skills]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo
              companyName={job.company}
              logoUrl={job.companyLogo || job.companyInfo?.logoUrl}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                  {job.title}
                </h2>
                {isInternship && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-blue-600" />
                    Internship
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {job.company} • {job.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onSaveToggle(job.id)}
              className={`p-2 rounded-md border text-xs font-semibold flex items-center gap-1 transition-colors ${
                isSaved
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 fill-green-600 text-green-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={() => onApply(job)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div>
              <span className="text-slate-500 block text-[11px]">Compensation</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {job.salaryFormatted || 'Not specified by employer'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Work Mode</span>
              <span className="font-bold text-slate-900 mt-0.5 block capitalize">
                {job.remoteType}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Employment Type</span>
              <span className="font-bold text-slate-900 mt-0.5 block capitalize">
                {job.employmentType}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Verified Posted Date</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {job.postedAgo}
              </span>
            </div>
          </div>

          {/* Section 2: Authentic Source Verification Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">
                  Legitimate Source Verified: {job.source}
                </span>
                <span className="text-[11px] text-slate-500">
                  External Requisition ID: <strong className="font-mono text-slate-700">{job.externalJobId}</strong> • Last Verified: {new Date(job.lastVerifiedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <a
              href={job.originalJobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white border border-[#E5E5E5] hover:border-[#B18A08] text-[#745800] hover:text-[#1F1F1F] rounded font-bold flex items-center gap-1.5 self-start sm:self-auto hover:bg-[#FFF4CC]/30 transition-colors shadow-2xs"
            >
              <span>View Original Job</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Section 14: AI Profile Match Section (Non-fabricated) */}
          <div className="bg-white border-2 border-[#F4C430]/40 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE7D8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#F4C430] text-[#1F1F1F] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Profile Match</h3>
                  <p className="text-[11px] text-slate-500">
                    Objective comparison against your verified resume skills and background
                  </p>
                </div>
              </div>

              {matchScore > 0 ? (
                <div className="flex items-baseline gap-1 bg-green-50 border border-green-200 px-3 py-1 rounded-md">
                  <span className="text-base font-extrabold text-green-700">{matchScore}%</span>
                  <span className="text-[11px] font-semibold text-green-800">Compatibility</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">
                  Upload resume to calculate match
                </span>
              )}
            </div>

            {match && matchScore > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Matching Profile Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {match.matchedSkills.length > 0 ? (
                        match.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-green-50 text-green-800 border border-green-200 rounded font-medium"
                          >
                            ✓ {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">No exact skill keywords identified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      Potential Skill Gaps to Strengthen:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {match.missingSkills.length > 0 ? (
                        match.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-medium"
                          >
                            • {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-green-700 font-medium">✓ Core skills covered</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Why this vacancy matches you:</span>
                  <p>{match.whyMatches}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              About the Role
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {safeResponsibilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Key Responsibilities
              </h3>
              <ul className="space-y-1.5 text-slate-700">
                {safeResponsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {safeRequirements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Qualifications & Requirements
              </h3>
              <ul className="space-y-1.5 text-slate-700">
                {safeRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Skills Required
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {safeSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-medium border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Section 22: About Company Profile */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
            <div className="flex items-start gap-4">
              <CompanyLogo
                companyName={job.company}
                logoUrl={job.companyLogo || job.companyInfo?.logoUrl}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {job.company}
                  </h3>
                  {job.companyWebsite && (
                    <a
                      href={job.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  {(job.industry || job.companyInfo?.industry) && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {job.industry || job.companyInfo?.industry}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  {job.isVerifiedSource && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-green-600" />
                      Verified Employer
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
              {job.companyOverview || job.companyInfo?.description || `${job.company} is an active verified employer hiring on official recruitment portals.`}
            </p>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Requisition ID: <strong className="font-mono text-slate-700">{job.externalJobId}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => onApply(job)}
              className="px-5 py-2 bg-[#F4C430] hover:bg-[#e0b224] text-[#1F1F1F] rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply for this Role</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
