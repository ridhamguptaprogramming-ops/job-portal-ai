import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Save,
  Lock
} from 'lucide-react';
import { AIApplySettings, EmploymentType } from '../types/job';

interface AIApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AIApplySettings;
  onSaveSettings: (settings: AIApplySettings) => void;
  userEmail: string;
}

export const AIApplyModal: React.FC<AIApplyModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  userEmail
}) => {
  if (!isOpen) return null;

  const [enabled, setEnabled] = useState(settings.enabled);
  const [minMatchScore, setMinMatchScore] = useState(settings.minMatchScore || 85);
  const [maxDailyApplications, setMaxDailyApplications] = useState(settings.maxDailyApplications || 5);
  const [approvedTypes, setApprovedTypes] = useState<EmploymentType[]>(
    settings.approvedJobTypes || ['internship', 'full-time']
  );
  const [approvedLocations, setApprovedLocations] = useState(
    settings.approvedLocations?.join(', ') || 'Bengaluru, Hyderabad, Remote — India'
  );
  const [allowedCompanies, setAllowedCompanies] = useState(
    settings.allowedCompanies?.join(', ') || 'Google, Microsoft, Amazon, Swiggy, Razorpay, Adobe, NVIDIA'
  );
  const [excludedCompanies, setExcludedCompanies] = useState(
    settings.excludedCompanies?.join(', ') || ''
  );
  const [coverLetterNotes, setCoverLetterNotes] = useState(
    settings.coverLetterNotes || 'Strong computer science background with proficiency in algorithms and scalable backend services.'
  );

  const toggleType = (t: EmploymentType) => {
    setApprovedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      enabled,
      minMatchScore,
      maxDailyApplications,
      approvedJobTypes: approvedTypes,
      approvedLocations: approvedLocations.split(',').map((s) => s.trim()).filter(Boolean),
      allowedCompanies: allowedCompanies.split(',').map((s) => s.trim()).filter(Boolean),
      excludedCompanies: excludedCompanies.split(',').map((s) => s.trim()).filter(Boolean),
      coverLetterNotes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-xl rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Auto-Application Settings & Authorization
              </h2>
              <p className="text-xs text-slate-500">
                Configure explicit rules for automated candidate matching and portal submissions
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Transparency & Safety Guarantee Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Strict Transparency & Authorization Rule</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              The system <strong>never silently submits an application</strong>. Every automated submission creates a verified transaction ticket, logs in your Application Tracker, and immediately dispatches a confirmation email with screenshot receipt to <strong>{userEmail}</strong>.
            </p>
          </div>

          {/* Master Enable Toggle */}
          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                Authorize AI Auto-Application Gateway
              </span>
              <span className="text-[11px] text-slate-500">
                Only submit when all filters, score thresholds, and company criteria are strictly satisfied.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Minimum Match Score (0 – 100%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="70"
                  max="98"
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(Number(e.target.value))}
                  className="flex-1 accent-green-600"
                />
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                  {minMatchScore}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Roles below {minMatchScore}% compatibility will be skipped.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Maximum Applications Per Day
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxDailyApplications}
                onChange={(e) => setMaxDailyApplications(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Prevents quota exhaustion and ensures quality applications.
              </span>
            </div>
          </div>

          {/* Approved Job Types (Internships included!) */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Approved Employment Types
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'internship', label: 'Internships' },
                { id: 'full-time', label: 'Full-time' },
                { id: 'contract', label: 'Contract' },
                { id: 'apprenticeship', label: 'Apprenticeships' }
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleType(type.id as EmploymentType)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                    approvedTypes.includes(type.id as EmploymentType)
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {approvedTypes.includes(type.id as EmploymentType) && '✓ '}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Approved Locations */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Approved Locations (comma-separated)
            </label>
            <input
              type="text"
              value={approvedLocations}
              onChange={(e) => setApprovedLocations(e.target.value)}
              placeholder="e.g. Bengaluru, Hyderabad, Remote — India"
              className="w-full p-2 border border-slate-300 rounded text-slate-900"
            />
          </div>

          {/* Allowed Companies */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Allowed Companies (leave blank for all verified companies)
            </label>
            <input
              type="text"
              value={allowedCompanies}
              onChange={(e) => setAllowedCompanies(e.target.value)}
              placeholder="e.g. Google, Microsoft, Amazon, Swiggy, Razorpay"
              className="w-full p-2 border border-slate-300 rounded text-slate-900"
            />
          </div>

          {/* Cover Letter Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Default Candidate Pitch / Cover Summary
            </label>
            <textarea
              value={coverLetterNotes}
              onChange={(e) => setCoverLetterNotes(e.target.value)}
              rows={2}
              className="w-full p-2 border border-slate-300 rounded text-slate-900"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save AI Application Policy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
