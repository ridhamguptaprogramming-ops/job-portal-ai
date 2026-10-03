import React, { useState } from 'react';
import {
  Sparkles,
  Bookmark,
  Kanban,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Upload,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { UserProfile, Job, Application, Interview } from '../types/job';
import { CompanyLogo } from './CompanyLogo';
import { calculateJobMatch } from '../services/matchingEngine';

interface DashboardViewProps {
  user: UserProfile;
  jobs: Job[];
  savedJobIds: Set<string>;
  applications: Application[];
  interviews: Interview[];
  onNavigate: (view: string) => void;
  onSelectJob: (job: Job) => void;
  onSaveToggle: (jobId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  jobs,
  savedJobIds,
  applications,
  interviews,
  onNavigate,
  onSelectJob,
  onSaveToggle
}) => {
  const savedJobs = jobs.filter((j) => savedJobIds.has(j.id));
  const recommendedJobs = jobs.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Heading matching openroles */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E5E5E5] pb-6 gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#8C9285] uppercase">
            YOUR JOB SEARCH
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F1F1F] tracking-tight mt-1">
            Make your next move<span className="text-[#F4C430]">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Welcome back, <strong>{user.name}</strong> · Actively searching for opportunities
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="bg-[#F4C430] hover:bg-[#e0b224] text-[#1F1F1F] px-4 py-2 text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
        >
          Explore roles ↗
        </button>
      </div>

      {/* Metrics Row matching Section 23 */}
      <section className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E5] border-y border-[#E5E5E5] py-4 bg-white">
        <div className="px-4 py-2">
          <strong className="block text-2xl font-bold text-[#1F1F1F]">12</strong>
          <span className="text-xs text-[#666666]">Recommended</span>
        </div>
        <div className="px-4 py-2">
          <strong className="block text-2xl font-bold text-[#1F1F1F]">{savedJobIds.size}</strong>
          <span className="text-xs text-[#666666]">Saved jobs</span>
        </div>
        <div className="px-4 py-2">
          <strong className="block text-2xl font-bold text-[#1F1F1F]">{applications.length}</strong>
          <span className="text-xs text-[#666666]">Applications</span>
        </div>
        <div className="px-4 py-2">
          <strong className="block text-2xl font-bold text-[#1F1F1F]">{interviews.length}</strong>
          <span className="text-xs text-[#666666]">Interviews</span>
        </div>
        <div className="px-4 py-2">
          <strong className="block text-2xl font-bold text-[#1F1F1F]">
            {user.resumeAnalysis ? '94%' : '65%'}
          </strong>
          <span className="text-xs text-[#666666]">Profile complete</span>
        </div>
      </section>

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: AI Recommendations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE7D8] pb-2">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#8C9285] uppercase">
                RECOMMENDATIONS
              </span>
              <h2 className="text-lg font-semibold text-[#1F1F1F]">Roles tailored to your profile</h2>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-[#745800] hover:text-[#1F1F1F] font-bold"
            >
              View all ↗
            </button>
          </div>

          <div className="divide-y divide-[#E5E5E5]">
            {recommendedJobs.map((job) => {
              const match = calculateJobMatch(job, user.resumeAnalysis);
              const score = match ? match.overallScore : 85;

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="py-3.5 flex items-start justify-between gap-3 group cursor-pointer hover:bg-[#FFF4CC]/20 px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <CompanyLogo
                      companyName={job.company}
                      logoUrl={job.companyLogo || job.companyInfo?.logoUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#1F1F1F] group-hover:text-[#B18A08] truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-[#666666] mt-0.5">
                        {job.company} · {job.location} · {job.salaryFormatted || 'Market competitive'}
                      </p>
                      <p className="text-[11px] text-[#745800] mt-1 font-medium">
                        Matches: {job.skills.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                    <span className="bg-[#FFF4CC] text-[#745800] text-[10px] font-bold px-2 py-0.5 rounded">
                      {score}% match
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveToggle(job.id);
                      }}
                      className={`text-base p-1 ${
                        savedJobIds.has(job.id) ? 'text-red-500' : 'text-[#A0A49B] hover:text-red-500'
                      }`}
                    >
                      {savedJobIds.has(job.id) ? '♥' : '♡'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Applications Tracker & Next Steps */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE7D8] pb-2">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#8C9285] uppercase">
                ACTIVE PIPELINE
              </span>
              <h2 className="text-lg font-semibold text-[#1F1F1F]">Application Tracker</h2>
            </div>
            <button
              onClick={() => onNavigate('tracker')}
              className="text-xs text-[#745800] hover:text-[#1F1F1F] font-bold"
            >
              Open Tracker ↗
            </button>
          </div>

          {applications.length > 0 ? (
            <div className="divide-y divide-[#E5E5E5]">
              {applications.map((app) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#1F1F1F] truncate">
                      {app.job?.title || 'Engineering Candidate'}
                    </h3>
                    <p className="text-xs text-[#666666]">
                      {app.job?.company} · Submitted {app.appliedDate}
                    </p>
                  </div>
                  <span className="bg-[#ECE7D8] text-[#1F1F1F] text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wide">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 border border-[#E5E5E5] p-4 text-xs text-[#666666]">
              No applications submitted yet. Browse open roles to apply directly.
            </div>
          )}

          {/* Resume Analysis Quick Banner */}
          <div className="p-4 bg-[#FFF4CC]/50 border border-[#F4C430]/40 flex items-start gap-3 mt-4">
            <Sparkles className="w-5 h-5 text-[#745800] flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#745800] block">Resume AI Skill Extraction</span>
              <p className="text-[#666666]">
                {user.resumeAnalysis
                  ? `Identified ${user.resumeAnalysis.allSkills.length} verified technical skills. Profile compatibility is active across all job listings.`
                  : 'Upload your resume to automatically compute match percentages and extract skills for 1-click applications.'}
              </p>
              <button
                onClick={() => onNavigate('resume')}
                className="text-xs text-[#745800] font-bold hover:underline pt-1 inline-block"
              >
                {user.resumeAnalysis ? 'View Analyzed Skills →' : 'Upload Resume →'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
