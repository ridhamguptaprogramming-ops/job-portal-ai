import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  X,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Job, JobMatchBreakdown } from '../types/job';
import { JobCard } from './JobCard';
import { JobFilters, FilterState } from './JobFilters';

interface JobSearchViewProps {
  jobs: Job[];
  matchMap: Record<string, JobMatchBreakdown>;
  savedJobIds: Set<string>;
  onSaveToggle: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  onQuickApply: (job: Job) => void;
  initialQuery?: string;
  initialLocation?: string;
  initialEmploymentType?: string;
}

export const JobSearchView: React.FC<JobSearchViewProps> = ({
  jobs,
  matchMap,
  savedJobIds,
  onSaveToggle,
  onSelectJob,
  onQuickApply,
  initialQuery = '',
  initialLocation = '',
  initialEmploymentType = ''
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'newest'>('match');

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: initialQuery,
    location: initialLocation,
    remoteTypes: [],
    experienceLevels: [],
    employmentTypes: initialEmploymentType ? [initialEmploymentType as any] : [],
    selectedSkills: [],
    datePosted: 'all',
    sources: [],
    companyFilter: '',
    internshipOnly: initialEmploymentType === 'internship'
  });

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      location: '',
      remoteTypes: [],
      experienceLevels: [],
      employmentTypes: [],
      selectedSkills: [],
      datePosted: 'all',
      sources: [],
      companyFilter: '',
      internshipOnly: false
    });
  };

  // Filter & Sort Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Must be active verified job
      if (job.status !== 'active') return false;

      // Internship only toggle
      if (filters.internshipOnly && job.employmentType !== 'internship') {
        return false;
      }

      // Company filter
      if (filters.companyFilter && job.company.toLowerCase() !== filters.companyFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const inTitle = job.title.toLowerCase().includes(q);
        const inCompany = job.company.toLowerCase().includes(q);
        const inDesc = job.description.toLowerCase().includes(q);
        const inSkills = job.skills.some((s) => s.toLowerCase().includes(q));
        const inType = job.employmentType.toLowerCase().includes(q);
        if (!inTitle && !inCompany && !inDesc && !inSkills && !inType) return false;
      }

      // Location
      if (filters.location.trim()) {
        const loc = filters.location.toLowerCase().trim();
        const inLoc = job.location.toLowerCase().includes(loc);
        const isRemoteMatch = loc.includes('remote') && job.remoteType === 'remote';
        if (!inLoc && !isRemoteMatch) return false;
      }

      // Work mode
      if (filters.remoteTypes.length > 0 && !filters.remoteTypes.includes(job.remoteType)) {
        return false;
      }

      // Experience level
      if (
        filters.experienceLevels.length > 0 &&
        !filters.experienceLevels.includes(job.experienceLevel)
      ) {
        return false;
      }

      // Employment types
      if (
        filters.employmentTypes.length > 0 &&
        !filters.employmentTypes.includes(job.employmentType)
      ) {
        return false;
      }

      // Skills
      if (filters.selectedSkills.length > 0) {
        const hasSkill = filters.selectedSkills.some((skill) =>
          job.skills.some((js) => js.toLowerCase() === skill.toLowerCase())
        );
        if (!hasSkill) return false;
      }

      // Source
      if (filters.sources.length > 0 && !filters.sources.includes(job.source)) {
        return false;
      }

      // Internship specialization term
      if (filters.internshipTerm && job.employmentType === 'internship') {
        const term = filters.internshipTerm.toLowerCase();
        const descMatch = job.description.toLowerCase().includes(term);
        const titleMatch = job.title.toLowerCase().includes(term);
        const specMatch = job.internshipDetails?.specialization?.toLowerCase().includes(term);
        if (!descMatch && !titleMatch && !specMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') {
        const scoreA = matchMap[a.id]?.overallScore || 0;
        const scoreB = matchMap[b.id]?.overallScore || 0;
        return scoreB - scoreA;
      }
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }, [jobs, filters, sortBy, matchMap]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Search Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search verified jobs, internships, or companies..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            {filters.searchQuery && (
              <button onClick={() => setFilters({ ...filters, searchQuery: '' })} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-5 flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
            <MapPin className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Location (e.g. Bengaluru, Hyderabad, Remote — India)"
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            {filters.location && (
              <button onClick={() => setFilters({ ...filters, location: '' })} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>Filters</span>
            </button>

            <button
              onClick={handleResetFilters}
              className="hidden md:flex flex-1 items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Filters + Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20">
          <JobFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            totalResults={filteredJobs.length}
          />
        </aside>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden">
            <div className="bg-white w-full max-w-sm h-full ml-auto p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="font-bold text-slate-900">Filter Verified Jobs</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-500 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <JobFilters
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
                totalResults={filteredJobs.length}
              />
              <div className="mt-4 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-green-600 text-white rounded-md font-semibold text-xs text-center"
                >
                  Apply Filters ({filteredJobs.length} results)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Job Results Feed */}
        <main className="lg:col-span-9 space-y-4">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-slate-900">
                Showing {filteredJobs.length} Verified Jobs
              </span>
              {filters.internshipOnly && (
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                  Internships Filter Active
                </span>
              )}
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800"
              >
                <option value="match">Highest Match %</option>
                <option value="newest">Most Recent</option>
              </select>
            </div>
          </div>

          {/* Job Card List */}
          {filteredJobs.length > 0 ? (
            <div className="space-y-3.5">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  match={matchMap[job.id]}
                  isSaved={savedJobIds.has(job.id)}
                  onSaveToggle={onSaveToggle}
                  onSelect={onSelectJob}
                  onQuickApply={onQuickApply}
                />
              ))}
            </div>
          ) : (
            /* SECTION 39: HONEST EMPTY STATE (NO DUMMY JOBS) */
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                No verified jobs are currently available for these filters.
              </h3>
              <div className="text-xs text-slate-600 max-w-sm mx-auto space-y-1 text-left bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="font-bold block text-slate-800 mb-1">Try broadening your search:</span>
                <p>• Switch location to <strong>All India</strong> or <strong>Remote — India</strong></p>
                <p>• Clear specific company filters to view all legitimate openings</p>
                <p>• Select <strong>Internships Only</strong> to browse student & summer programs</p>
                <p>• Search by broader titles like <em>"Software Engineer"</em> or <em>"Developer"</em></p>
              </div>
              <button
                onClick={handleResetFilters}
                className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
