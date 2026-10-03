import React from 'react';
import { Filter, X, RotateCcw, GraduationCap, MapPin, Building2 } from 'lucide-react';
import { RemoteType, ExperienceLevel, EmploymentType } from '../types/job';
import { ALL_SKILLS_LIST } from '../data/verifiedJobs';

export interface FilterState {
  searchQuery: string;
  location: string;
  remoteTypes: RemoteType[];
  experienceLevels: ExperienceLevel[];
  employmentTypes: EmploymentType[];
  selectedSkills: string[];
  datePosted: 'all' | '24h' | '7d' | '30d';
  sources: string[];
  companyFilter: string;
  internshipOnly: boolean;
  internshipTerm?: string;
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults
}) => {
  const toggleRemote = (type: RemoteType) => {
    const next = filters.remoteTypes.includes(type)
      ? filters.remoteTypes.filter((t) => t !== type)
      : [...filters.remoteTypes, type];
    onChange({ ...filters, remoteTypes: next });
  };

  const toggleEmployment = (type: EmploymentType) => {
    const next = filters.employmentTypes.includes(type)
      ? filters.employmentTypes.filter((t) => t !== type)
      : [...filters.employmentTypes, type];
    onChange({
      ...filters,
      employmentTypes: next,
      internshipOnly: next.includes('internship')
    });
  };

  const toggleSkill = (skill: string) => {
    const next = filters.selectedSkills.includes(skill)
      ? filters.selectedSkills.filter((s) => s !== skill)
      : [...filters.selectedSkills, skill];
    onChange({ ...filters, selectedSkills: next });
  };

  const toggleSource = (source: string) => {
    const next = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source];
    onChange({ ...filters, sources: next });
  };

  const isFiltered =
    filters.searchQuery ||
    filters.location ||
    filters.remoteTypes.length > 0 ||
    filters.experienceLevels.length > 0 ||
    filters.employmentTypes.length > 0 ||
    filters.selectedSkills.length > 0 ||
    filters.sources.length > 0 ||
    filters.companyFilter ||
    filters.internshipOnly ||
    filters.datePosted !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 divide-y divide-slate-100 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Verified Filters
          </h2>
        </div>
        {isFiltered && (
          <button
            onClick={onReset}
            className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      {/* SECTION 9 & 10: INTERNSHIPS (FIRST CLASS CITIZEN) */}
      <div className="pt-4">
        <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-950">
            <input
              type="checkbox"
              checked={filters.internshipOnly || filters.employmentTypes.includes('internship')}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange({
                  ...filters,
                  internshipOnly: checked,
                  employmentTypes: checked
                    ? Array.from(new Set([...filters.employmentTypes, 'internship']))
                    : filters.employmentTypes.filter((t) => t !== 'internship')
                });
              }}
              className="w-4 h-4 text-blue-600 rounded border-blue-300 accent-blue-600"
            />
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Show Internships Only
            </span>
          </label>

          {(filters.internshipOnly || filters.employmentTypes.includes('internship')) && (
            <div className="pt-2 border-t border-blue-200/60 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                Internship Season & Track
              </span>
              <div className="space-y-1 text-slate-700">
                {[
                  { id: '', label: 'All Verified Internships' },
                  { id: 'summer', label: 'Summer 2027 Internship' },
                  { id: 'winter', label: 'Winter / 6-Month Internship' },
                  { id: 'swe', label: 'Software Engineering Track' },
                  { id: 'backend', label: 'Backend Development Track' },
                  { id: 'ai_ml', label: 'AI / Machine Learning Track' }
                ].map((term) => (
                  <label key={term.id} className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="radio"
                      name="internshipTerm"
                      checked={(filters.internshipTerm || '') === term.id}
                      onChange={() => onChange({ ...filters, internshipTerm: term.id })}
                      className="w-3.5 h-3.5 text-blue-600 accent-blue-600"
                    />
                    <span>{term.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employment Types */}
      <div className="pt-4">
        <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2.5">
          Employment Type
        </label>
        <div className="space-y-2">
          {[
            { id: 'internship', label: 'Internships' },
            { id: 'full-time', label: 'Full-time' },
            { id: 'contract', label: 'Contract' },
            { id: 'apprenticeship', label: 'Apprenticeships' },
            { id: 'part-time', label: 'Part-time' }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
            >
              <input
                type="checkbox"
                checked={filters.employmentTypes.includes(item.id as EmploymentType)}
                onChange={() => toggleEmployment(item.id as EmploymentType)}
                className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-slate-300 mr-2.5 accent-green-600"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* India-Wide Locations Quick Filter (Section 8) */}
      <div className="pt-4">
        <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2.5">
          India Locations
        </label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
          {[
            'All India',
            'Bengaluru',
            'Hyderabad',
            'Pune',
            'Delhi NCR',
            'Noida',
            'Gurugram',
            'Mumbai',
            'Chennai',
            'Kolkata',
            'Remote — India'
          ].map((loc) => {
            const isSelected = filters.location.toLowerCase() === (loc === 'All India' ? '' : loc.toLowerCase());
            return (
              <button
                key={loc}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    location: loc === 'All India' ? '' : loc
                  })
                }
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-green-100 text-green-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{loc}</span>
                {isSelected && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Major Companies Filter (Section 7) */}
      <div className="pt-4">
        <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2.5">
          Major Companies
        </label>
        <div className="space-y-1 text-xs">
          {[
            { id: '', label: 'All Verified Employers' },
            { id: 'Google', label: 'Google' },
            { id: 'Microsoft', label: 'Microsoft' },
            { id: 'Amazon', label: 'Amazon' },
            { id: 'NVIDIA', label: 'NVIDIA' },
            { id: 'Adobe', label: 'Adobe' },
            { id: 'Swiggy', label: 'Swiggy' },
            { id: 'Razorpay', label: 'Razorpay' },
            { id: 'TCS', label: 'TCS' },
            { id: 'Infosys', label: 'Infosys' }
          ].map((c) => (
            <label key={c.id} className="flex items-center text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900">
              <input
                type="radio"
                name="companyFilter"
                checked={(filters.companyFilter || '') === c.id}
                onChange={() => onChange({ ...filters, companyFilter: c.id })}
                className="w-3.5 h-3.5 text-green-600 mr-2 accent-green-600"
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Mode / Remote */}
      <div className="pt-4">
        <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2.5">
          Work Mode
        </label>
        <div className="space-y-2">
          {(['remote', 'hybrid', 'onsite'] as RemoteType[]).map((type) => (
            <label
              key={type}
              className="flex items-center text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
            >
              <input
                type="checkbox"
                checked={filters.remoteTypes.includes(type)}
                onChange={() => toggleRemote(type)}
                className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-slate-300 mr-2.5 accent-green-600"
              />
              <span className="capitalize">{type === 'onsite' ? 'On-site' : type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Required Skills */}
      <div className="pt-4">
        <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2.5">
          Required Skills
        </label>
        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
          {ALL_SKILLS_LIST.slice(0, 14).map((skill) => (
            <label
              key={skill}
              className="flex items-center text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
            >
              <input
                type="checkbox"
                checked={filters.selectedSkills.includes(skill)}
                onChange={() => toggleSkill(skill)}
                className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-slate-300 mr-2.5 accent-green-600"
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Verified Sources / Providers */}
      <div className="pt-4">
        <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2.5">
          Verified Feeds & Sources
        </label>
        <div className="space-y-2 text-xs">
          {[
            'Google Careers Official',
            'Microsoft Careers Verified Direct',
            'Amazon Jobs Official Gateway',
            'Remotive Authorized Feed'
          ].map((source) => (
            <label
              key={source}
              className="flex items-center text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
            >
              <input
                type="checkbox"
                checked={filters.sources.includes(source)}
                onChange={() => toggleSource(source)}
                className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-slate-300 mr-2.5 accent-green-600"
              />
              <span className="truncate">{source}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
