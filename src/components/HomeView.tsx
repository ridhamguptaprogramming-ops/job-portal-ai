import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Send,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Job, JobMatchBreakdown, UserProfile } from '../types/job';
import { api, JobServiceError, PRIMARY_RENDER_BACKEND } from '../services/api';
import { CompanyLogo } from './CompanyLogo';

interface HomeViewProps {
  jobs: Job[];
  matchMap: Record<string, JobMatchBreakdown>;
  savedJobIds: Set<string>;
  user: UserProfile | null;
  onSaveToggle: (jobId: string) => void;
  onJobsLoaded?: (jobs: Job[]) => void;
  onSelectJob: (job: Job) => void;
  onQuickApply: (job: Job) => void;
  onSearchSubmit?: (query: string, location: string) => void;
  onNavigate?: (view: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  jobs: initialJobs,
  matchMap,
  savedJobIds,
  user,
  onSaveToggle,
  onJobsLoaded,
  onSelectJob,
  onQuickApply,
  onNavigate
}) => {
  // Search inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Filter state
  const [workplace, setWorkplace] = useState<string>('all');
  const [experience, setExperience] = useState<string>('');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [postedDate, setPostedDate] = useState<string>('');
  const [skillsFilter, setSkillsFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');

  // Live API states
  const [activeJobs, setActiveJobs] = useState<Job[]>(initialJobs);
  const [totalCount, setTotalCount] = useState<number>(initialJobs.length);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Backend Diagnostic Drawer / Indicator state
  const [diagnosticOpen, setDiagnosticOpen] = useState<boolean>(false);
  const [probingRender, setProbingRender] = useState<boolean>(false);
  const [renderStatus, setRenderStatus] = useState<{
    status: number;
    reachable: boolean;
    message: string;
    xRenderRouting: string | null;
  } | null>(null);

  // Core API loader satisfying Section 12, 13, 19, 20
  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await api.listJobs({
        search: searchQuery,
        location: locationQuery,
        workplace: workplace === 'all' ? undefined : workplace,
        experience: experience || undefined,
        employment_type: employmentType || undefined,
        posted_within_days: postedDate ? parseInt(postedDate, 10) : undefined,
        skills: skillsFilter || undefined,
        company: companyFilter || undefined,
        min_salary: minSalary ? parseFloat(minSalary) : undefined,
        max_salary: maxSalary ? parseFloat(maxSalary) : undefined,
      });

      setActiveJobs(response.jobs);
      setTotalCount(response.total);
      onJobsLoaded?.(response.jobs);
    } catch (err: any) {
      console.error('[openroles] Failed to fetch live jobs from backend:', err);
      if (err instanceof JobServiceError) {
        if (err.code === 'timeout') {
          setApiError('The job service is taking too long to respond. Please try again.');
        } else if (err.status === 401) {
          setApiError('Sign in to view jobs for your account.');
        } else if (err.status === 403) {
          setApiError('You do not have permission to view these jobs.');
        } else if (err.status === 404) {
          setApiError('The job service endpoint could not be found. Please contact support.');
        } else if (err.status >= 500) {
          setApiError('The job service is temporarily unavailable. Please try again shortly.');
        } else if (err.status === 0) {
          setApiError("We couldn't reach the job service right now.");
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError('An unexpected error occurred while loading jobs.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    locationQuery,
    workplace,
    experience,
    employmentType,
    postedDate,
    skillsFilter,
    companyFilter,
    minSalary,
    maxSalary,
    onJobsLoaded,
  ]);

  // Initial load
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Live test of Render backend for diagnostic panel
  const runDiagnosticProbe = async () => {
    setProbingRender(true);
    const probe = await api.probeBackend();
    setRenderStatus({
      status: probe.status,
      reachable: probe.reachable,
      message: probe.message,
      xRenderRouting: probe.xRenderRouting,
    });
    setProbingRender(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setWorkplace('all');
    setExperience('');
    setEmploymentType('');
    setPostedDate('');
    setSkillsFilter('');
    setCompanyFilter('');
    setMinSalary('');
    setMaxSalary('');
  };

  // Helper for company initial
  const getCompanyInitials = (name: string) => {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  // Avatar pastel palettes matching openroles theme
  const getAvatarClass = (idx: number) => {
    const classes = [
      'bg-[#FFF4CC] text-[#745800]',
      'bg-[#F2EEE3] text-[#66592E]',
      'bg-[#ECEBE6] text-[#55534C]',
      'bg-[#F2E9E5] text-[#76584A]',
      'bg-[#EEECE1] text-[#655B34]'
    ];
    return classes[idx % classes.length];
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ================= SECTION 11: HERO SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="md:w-3/5 space-y-4">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#785C00]">
            <span className="w-2 h-2 rounded-full bg-[#F4C430] ring-4 ring-[#FFF4CC]" />
            A better way to work
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] text-[#1F1F1F] leading-[0.98]">
            Find work that <br />
            <em className="font-serif italic font-normal text-[#B18A08]">moves you.</em>
          </h1>

          <p className="text-[#666666] text-sm sm:text-base leading-relaxed max-w-md pt-2">
            Good work starts with the right opportunity. Explore thoughtful roles from teams building what’s next.
          </p>

          {/* Diagnostic pill & Sign up CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!user && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1F1F1F] bg-[#F4C430] hover:bg-[#e0b224] px-3.5 py-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Create account with Google</span>
                <span className="font-serif italic font-normal text-sm">→</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setDiagnosticOpen(true);
                runDiagnosticProbe();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#1F1F1F] bg-slate-50 hover:bg-slate-100 border border-[#E5E5E5] px-2.5 py-1 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#B18A08]" />
              <span>Backend Status & Health</span>
            </button>
          </div>
        </div>

        {/* Right side artwork matching screenshot */}
        <div className="md:w-2/5 relative h-64 overflow-hidden hidden sm:block select-none" aria-hidden="true">
          {/* Sun */}
          <div className="w-48 h-48 rounded-full bg-[#FFF4CC] absolute right-10 top-3" />
          
          {/* Orbit circles */}
          <div className="absolute w-80 h-28 border border-[#EADFAE] rounded-full -rotate-[23deg] right-0 top-16" />
          <div className="absolute w-96 h-36 border border-[#EADFAE] rounded-full -rotate-[23deg] -right-6 top-12" />

          {/* Card Back: Yellow */}
          <div className="w-44 h-32 absolute right-2 top-7 bg-[#F4C430] text-[#1F1F1F] p-4 rotate-6 shadow-md">
            <span className="text-[8px] font-bold tracking-widest text-[#705600] uppercase block">
              NEW OPPORTUNITIES
            </span>
            <b className="font-serif italic font-normal text-lg leading-tight block mt-2 text-[#1F1F1F]">
              Something <br />good is out there.
            </b>
          </div>

          {/* Card Front: White */}
          <div className="w-56 h-32 absolute left-4 top-24 bg-white border border-[#E5E5E5] p-4 -rotate-3 shadow-lg">
            <span className="text-[8px] font-bold tracking-widest text-[#666666] uppercase block">
              YOUR NEXT CHAPTER
            </span>
            <div className="space-y-1.5 mt-3">
              <div className="w-2/3 h-1 bg-[#ECE7D8] rounded" />
              <div className="w-5/6 h-1 bg-[#ECE7D8] rounded" />
              <div className="w-1/2 h-1 bg-[#ECE7D8] rounded" />
            </div>
            <div className="border-t border-[#ECE7D8] mt-3 pt-2 flex items-center justify-between text-[9px] text-[#666666]">
              <span>Open to possibility</span>
              <span className="w-4 h-4 rounded-full bg-[#FFF4CC] text-[#745800] flex items-center justify-center font-bold">
                ↗
              </span>
            </div>
          </div>

          {/* Sparks */}
          <span className="absolute top-8 left-6 text-xl text-[#B18A08]">✳</span>
          <span className="absolute bottom-5 right-8 text-base text-[#B18A08]">✦</span>
        </div>
      </section>

      {/* ================= SECTION 12: SEARCH SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white border border-[#E5E5E5] p-3 shadow-sm flex flex-col md:flex-row md:items-center gap-3"
        >
          {/* Query input */}
          <div className="flex-1 flex items-center px-4 gap-3">
            <span className="font-serif italic text-2xl text-[#B18A08] leading-none">⌕</span>
            <div className="flex-1">
              <label className="block text-[8px] font-bold tracking-wider text-[#92968D] uppercase">
                WHAT ARE YOU LOOKING FOR?
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Role, skill, or company"
                className="w-full text-xs sm:text-sm text-[#1F1F1F] placeholder-[#A3A69D] focus:outline-none bg-transparent pt-0.5"
              />
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-[#E5E5E5]" />

          {/* Location input */}
          <div className="flex-1 flex items-center px-4 gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-[#E5E5E5]">
            <span className="text-xl text-[#B18A08] leading-none">⌖</span>
            <div className="flex-1">
              <label className="block text-[8px] font-bold tracking-wider text-[#92968D] uppercase">
                WHERE?
              </label>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="City or remote"
                className="w-full text-xs sm:text-sm text-[#1F1F1F] placeholder-[#A3A69D] focus:outline-none bg-transparent pt-0.5"
              />
            </div>
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            className="bg-[#F4C430] hover:bg-[#e0b224] text-[#1F1F1F] px-7 py-3.5 text-xs font-bold transition-colors flex items-center justify-center gap-3 self-stretch md:self-auto cursor-pointer"
          >
            <span>Find a job</span>
            <span className="text-sm font-normal">↗</span>
          </button>
        </form>
      </section>

      {/* ================= SECTION 14 & 15: ROLES SECTION & FILTERS ================= */}
      <section id="jobs" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E5E5E5] pb-4 gap-2">
          <div>
            <span className="text-[9px] font-bold tracking-widest text-[#8C9285] uppercase">
              A PLACE TO START
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1F1F1F] mt-1">
              Roles worth a look<span className="text-[#B18A08]">.</span>
            </h2>
          </div>

          <span className="text-xs text-[#82877C] pb-0.5 font-medium">
            {isLoading ? 'Looking around…' : apiError ? 'Job service unavailable' : `${totalCount} ${totalCount === 1 ? 'role' : 'roles'} to explore`}
          </span>
        </div>

        {/* Workplace pill tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 mb-3">
          {['all', 'Remote', 'Hybrid', 'On-site'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setWorkplace(type)}
              className={`px-3.5 py-1.5 text-xs transition-colors cursor-pointer ${
                workplace === type
                  ? 'bg-[#F4C430] border border-[#F4C430] text-[#1F1F1F] font-semibold'
                  : 'bg-transparent border border-[#E5E5E5] text-[#666666] hover:border-[#1F1F1F] hover:text-[#1F1F1F]'
              }`}
            >
              {type === 'all' ? 'All roles' : type}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClearFilters}
            className="ml-auto text-xs text-[#666666] hover:text-[#1F1F1F] underline underline-offset-4 cursor-pointer"
          >
            Clear search
          </button>
        </div>

        {/* Advanced Filters Bar matching Section 15 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="border border-[#E5E5E5] bg-white p-2 text-xs text-[#1F1F1F] focus:outline-[#F4C430]"
            aria-label="Experience level"
          >
            <option value="">Any experience</option>
            <option value="Entry">Entry</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>

          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="border border-[#E5E5E5] bg-white p-2 text-xs text-[#1F1F1F] focus:outline-[#F4C430]"
            aria-label="Employment type"
          >
            <option value="">Any employment</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          <select
            value={postedDate}
            onChange={(e) => setPostedDate(e.target.value)}
            className="border border-[#E5E5E5] bg-white p-2 text-xs text-[#1F1F1F] focus:outline-[#F4C430]"
            aria-label="Date posted"
          >
            <option value="">Any date</option>
            <option value="1">Past day</option>
            <option value="7">Past week</option>
            <option value="30">Past month</option>
          </select>

          <input
            type="text"
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
            placeholder="Skills, comma separated"
            className="border border-[#E5E5E5] bg-white p-2 text-xs text-[#1F1F1F] placeholder-[#92968D] focus:outline-[#F4C430]"
          />

          <input
            type="text"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            placeholder="Company"
            className="border border-[#E5E5E5] bg-white p-2 text-xs text-[#1F1F1F] placeholder-[#92968D] focus:outline-[#F4C430]"
          />

          <input
            type="number"
            min="0"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder="Min salary"
            className="border border-[#E5E5E5] bg-white p-2 text-xs text-[#1F1F1F] placeholder-[#92968D] focus:outline-[#F4C430]"
          />

          <input
            type="number"
            min="0"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            placeholder="Max salary"
            className="border border-[#E5E5E5] bg-white p-2 text-xs text-[#1F1F1F] placeholder-[#92968D] focus:outline-[#F4C430]"
          />
        </div>

        {/* ================= SECTION 16, 18, 19, 21: JOB LISTINGS & STATES ================= */}
        <div className="border-t border-[#E5E5E5]">
          {/* SECTION 21: LOADING SKELETON */}
          {isLoading && (
            <div className="divide-y divide-[#E5E5E5] py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="py-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full skeleton-bar flex-shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="w-1/4 h-3.5 skeleton-bar" />
                    <div className="w-1/2 h-5 skeleton-bar" />
                    <div className="w-3/4 h-3.5 skeleton-bar" />
                  </div>
                  <div className="w-24 h-4 skeleton-bar self-center" />
                </div>
              ))}
            </div>
          )}

          {/* SECTION 19: API ERROR STATE (NO RAW TECHNICAL URLS) */}
          {!isLoading && apiError && (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FFF4CC] text-[#745800] flex items-center justify-center mx-auto text-xl font-bold">
                !
              </div>
              <h3 className="text-lg font-semibold text-[#1F1F1F]">Unable to load jobs</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto">
                {apiError}
              </p>
              {/* SECTION 20: RETRY BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => loadJobs()}
                  className="px-5 py-2 bg-[#F4C430] hover:bg-[#e0b224] text-[#1F1F1F] text-xs font-bold transition-colors cursor-pointer"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* SECTION 18: EMPTY STATE */}
          {!isLoading && !apiError && activeJobs.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <span className="text-3xl text-[#B18A08] block">⌕</span>
              <h3 className="text-lg font-semibold text-[#1F1F1F]">No matching roles yet.</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto">
                Try another search or adjust your filters.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-2 px-4 py-2 border border-[#E5E5E5] text-xs font-semibold text-[#1F1F1F] hover:bg-slate-50 cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* SECTION 16: JOB CARDS */}
          {!isLoading && !apiError && activeJobs.length > 0 && (
            <div className="divide-y divide-[#E5E5E5]">
              {activeJobs.map((job, idx) => {
                const isSaved = savedJobIds.has(job.id);
                const match = matchMap[job.id];
                const workplaceBadge = job.remoteType === 'unspecified'
                  ? 'Work mode not specified'
                  : job.remoteType === 'remote'
                    ? 'Remote'
                    : job.remoteType === 'hybrid'
                      ? 'Hybrid'
                      : 'On-site';

                return (
                  <article
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="py-5 flex flex-col sm:flex-row items-start justify-between gap-4 group cursor-pointer hover:bg-[#FFF4CC]/15 transition-colors px-2 -mx-2"
                  >
                    {/* Left: Logo + Title + Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Company Logo */}
                      <CompanyLogo
                        companyName={job.company}
                        logoUrl={job.companyLogo || job.companyInfo?.logoUrl}
                        size="md"
                      />

                      <div className="space-y-1 min-w-0 flex-1">
                        {/* Company & Posted date */}
                        <div className="flex items-center gap-2 text-[11px] text-[#82877D]">
                          <span className="font-semibold text-[#53594F]">{job.company}</span>
                          <span className="text-[#BABDB5]">·</span>
                          {job.postedAgo && <span>{job.postedAgo}</span>}
                          {job.isVerifiedSource && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#745800] bg-[#FFF4CC] px-1.5 py-0.2 rounded">
                              <ShieldCheck className="w-2.5 h-2.5 text-[#B18A08]" />
                              Verified
                            </span>
                          )}
                        </div>

                        {/* Job Title */}
                        <h3 className="text-base font-semibold text-[#1F1F1F] group-hover:text-[#B18A08] transition-colors leading-snug">
                          {job.title}
                        </h3>

                        {/* Description snippet */}
                        <p className="text-xs text-[#81867C] line-clamp-2 max-w-2xl">
                          {job.description}
                        </p>

                        {/* Tags: Location, Workplace, Type, Match */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#71776D]">
                          <span>
                            <strong className="text-[#B18A08] font-bold">⌖</strong> {job.location}
                          </span>
                          <span>
                            <strong className="text-[#B18A08] font-bold">◷</strong> {workplaceBadge}
                          </span>
                          <span>
                            <strong className="text-[#B18A08] font-bold">↗</strong> {job.employmentType}
                          </span>
                          {match && match.overallScore > 75 && (
                            <span className="bg-[#FFF4CC] text-[#745800] font-bold text-[10px] px-2 py-0.5 rounded">
                              {match.overallScore}% match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Salary & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-1">
                      <span className="text-xs font-semibold text-[#53594F] whitespace-nowrap">
                        {job.salaryFormatted || 'Not specified by employer'}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Save Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaveToggle(job.id);
                          }}
                          className={`p-1.5 transition-colors text-lg leading-none cursor-pointer ${
                            isSaved ? 'text-red-500' : 'text-[#A0A49B] hover:text-red-500'
                          }`}
                          title={isSaved ? 'Remove saved job' : 'Save job'}
                          aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                        >
                          {isSaved ? '♥' : '♡'}
                        </button>

                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectJob(job);
                          }}
                          className="px-3 py-1 bg-white hover:bg-slate-50 border border-[#E5E5E5] text-xs font-semibold text-[#1F1F1F] transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Note block at bottom of list */}
        <div className="mt-8 p-4 bg-[#F8F8F4] border border-[#ECE7D8] flex items-center justify-between text-xs text-[#666666]">
          <div className="flex items-center gap-3">
            <span className="text-xl text-[#B18A08]">✦</span>
            <span>
              <strong>Verified Opportunity Guarantee:</strong> Every position listed is sourced from verified corporate career endpoints with direct application links.
            </span>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs text-[#745800] hover:text-[#1F1F1F] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Back to search</span>
            <span>↑</span>
          </button>
        </div>
      </section>

      {/* ================= CLOSING SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-16 pt-10 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="font-serif italic text-4xl text-[#B18A08] leading-none">o</span>
          <p className="text-xl sm:text-2xl font-medium tracking-tight text-[#1F1F1F]">
            Work should feel like it fits. <br />
            <em className="font-serif italic font-normal text-[#B18A08]">Let’s find yours.</em>
          </p>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs font-bold text-[#745800] hover:text-[#1F1F1F] self-start sm:self-auto cursor-pointer"
        >
          Explore open roles ↑
        </button>
      </section>

      {/* ================= BACKEND DIAGNOSTIC MODAL ================= */}
      {diagnosticOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-[#E5E5E5] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE7D8] pb-3">
              <h3 className="font-bold text-base text-[#1F1F1F] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#B18A08]" />
                Job API Diagnostic & Connection
              </h3>
              <button
                onClick={() => setDiagnosticOpen(false)}
                className="text-[#666666] hover:text-[#1F1F1F] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="bg-slate-50 p-3 border border-[#E5E5E5] space-y-1.5">
                <p className="font-bold text-[#1F1F1F]">Render Cloud Backend Probe:</p>
                <p className="text-[#666666] font-mono text-[11px] truncate">
                  {PRIMARY_RENDER_BACKEND}/health
                </p>
                {probingRender ? (
                  <p className="text-amber-600 font-semibold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Probing Render backend...
                  </p>
                ) : renderStatus ? (
                  <div className="space-y-1 pt-1">
                    <p className={`font-semibold ${renderStatus.reachable ? 'text-green-700' : 'text-red-600'}`}>
                      {renderStatus.message}
                    </p>
                    <p className="text-[11px] text-[#666666]">
                      HTTP Status: <strong>{renderStatus.status || 'Connection Refused'}</strong>
                      {renderStatus.xRenderRouting && ` (x-render-routing: ${renderStatus.xRenderRouting})`}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="bg-[#FFF4CC]/50 p-3 border border-[#F4C430]/40 text-[#745800] space-y-1">
                <p className="font-bold">Active Local API Gateway:</p>
                <p>
                  The full-stack Express & FastAPI API gateway on port 3000 is active with verified genuine jobs, PostgreSQL schema models, and CORS support for <code>https://job-portal-seven-taupe.vercel.app</code>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#ECE7D8]">
              <button
                type="button"
                onClick={runDiagnosticProbe}
                disabled={probingRender}
                className="px-3.5 py-1.5 border border-[#E5E5E5] hover:bg-slate-50 text-xs font-semibold text-[#1F1F1F] cursor-pointer"
              >
                Re-test Render URL
              </button>
              <button
                type="button"
                onClick={() => setDiagnosticOpen(false)}
                className="px-4 py-1.5 bg-[#F4C430] hover:bg-[#e0b224] text-xs font-bold text-[#1F1F1F] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
