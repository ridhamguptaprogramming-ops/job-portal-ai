import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Calendar,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  GraduationCap
} from 'lucide-react';
import { Job, JobMatchBreakdown } from '../types/job';
import { CompanyLogo } from './CompanyLogo';

interface JobCardProps {
  job: Job;
  match?: JobMatchBreakdown;
  isSaved: boolean;
  onSaveToggle: (jobId: string) => void;
  onSelect: (job: Job) => void;
  onQuickApply: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  match,
  isSaved,
  onSaveToggle,
  onSelect,
  onQuickApply
}) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const matchScore = match?.overallScore;

  const isInternship = job.employmentType === 'internship';

  const skillsList = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === 'string'
    ? (job.skills as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <article
      onClick={() => onSelect(job)}
      className="group relative bg-white border border-slate-200 rounded-lg p-5 hover:border-green-600/60 hover:shadow-xs transition-all cursor-pointer space-y-3.5"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Company Logo */}
        <div className="flex items-start gap-3.5 min-w-0">
          <CompanyLogo
            companyName={job.company}
            logoUrl={job.companyLogo || job.companyInfo?.logoUrl}
            size="md"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-green-700 transition-colors truncate">
                {job.title}
              </h3>
              {isInternship && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-blue-600" />
                  Internship
                </span>
              )}
              {job.isVerifiedSource && (
                <span className="text-[10px] font-medium bg-green-50 text-green-800 border border-green-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-green-600" />
                  Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-semibold text-slate-800">{job.company}</span>
              {job.companyWebsite && (
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-green-700"
                  title={`Visit ${job.company} website`}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {job.industry && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">{job.industry}</span>
                </>
              )}
            </div>

            {/* Meta attributes: Location, Work mode, Salary, Experience */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location}
              </span>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border capitalize ${
                  job.remoteType === 'remote'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : job.remoteType === 'hybrid'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {job.remoteType === 'unspecified'
                  ? 'Work mode not specified'
                  : job.remoteType === 'onsite'
                    ? 'On-site'
                    : job.remoteType}
              </span>

              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {job.salaryFormatted || 'Not specified by employer'}
              </span>

              <span className="capitalize text-slate-600">
                {isInternship
                  ? job.internshipDetails?.duration || 'Internship Term'
                  : job.experienceLevel === 'unspecified'
                    ? 'Experience not specified'
                    : `${job.experienceLevel} Level`}
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Match score badge & Save button */}
        <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {matchScore !== undefined && matchScore > 0 && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border ${
                  matchScore >= 85
                    ? 'bg-green-50 text-green-800 border-green-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-green-600" />
                <span>{matchScore}% Match</span>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveToggle(job.id);
              }}
              className={`p-2 rounded-md border transition-colors ${
                isSaved
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Job'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-green-600 text-green-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>

          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Posted: {job.postedAgo}
          </span>
        </div>
      </div>

      {/* Description Excerpt */}
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Skills tags */}
      <div className="flex flex-wrap items-center gap-1.5">
        {skillsList.slice(0, 5).map((skill) => {
          const isMatchedSkill = match?.matchedSkills?.includes(skill);
          return (
            <span
              key={skill}
              className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                isMatchedSkill
                  ? 'bg-green-100 text-green-800 font-semibold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isMatchedSkill && '✓ '}
              {skill}
            </span>
          );
        })}
        {skillsList.length > 5 && (
          <span className="text-[11px] text-slate-500 font-medium">
            +{skillsList.length - 5} more
          </span>
        )}
      </div>

      {/* Source & Actions row */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500">Source:</span>
          <a
            href={job.originalJobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-green-700 hover:text-green-800 flex items-center gap-0.5 hover:underline"
          >
            <span>{job.source}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[10px] text-slate-400">{job.externalJobId}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(job);
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors"
          >
            View Job
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickApply(job);
            }}
            className="text-xs font-bold px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Send className="w-3 h-3" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </article>
  );
};
