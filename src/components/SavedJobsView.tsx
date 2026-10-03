import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  MapPin,
  Trash2,
  Send,
  Edit3,
  Calendar,
  ExternalLink,
  Sparkles,
  Inbox
} from 'lucide-react';
import { Job, JobMatchBreakdown } from '../types/job';
import { CompanyLogo } from './CompanyLogo';

interface SavedJobsViewProps {
  jobs: Job[];
  savedJobIds: Set<string>;
  matchMap: Record<string, JobMatchBreakdown>;
  onRemoveSaved: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  onQuickApply: (job: Job) => void;
}

export const SavedJobsView: React.FC<SavedJobsViewProps> = ({
  jobs,
  savedJobIds,
  matchMap,
  onRemoveSaved,
  onSelectJob,
  onQuickApply
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'applied' | 'archived'>('saved');
  const [notesMap, setNotesMap] = useState<Record<string, string>>({
    'job-101': 'Priority target. Reach out to hiring manager on LinkedIn regarding Payouts team.'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const savedJobs = jobs.filter((j) => savedJobIds.has(j.id));

  const handleSaveNote = (jobId: string) => {
    setNotesMap({ ...notesMap, [jobId]: tempNote });
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Jobs & Bookmarks</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Review saved opportunities, maintain private candidate notes, and complete applications.
        </p>

        {/* Tabs */}
        <div className="flex items-center space-x-6 mt-6">
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved for Later ({savedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'applied'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Already Applied
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'archived'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'saved' && (
        <>
          {savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((job) => {
                const match = matchMap[job.id];
                const note = notesMap[job.id];
                return (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <CompanyLogo
                          companyName={job.company}
                          logoUrl={job.companyLogo || job.companyInfo?.logoUrl}
                          size="md"
                        />

                        <div>
                          <div
                            onClick={() => onSelectJob(job)}
                            className="cursor-pointer group"
                          >
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-xs font-semibold text-slate-700 mt-0.5">
                              {job.company} • {job.location} • <span className="capitalize">{job.remoteType}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                            {job.salaryFormatted && (
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                {job.salaryFormatted}
                              </span>
                            )}
                            <span>{job.experienceLevel} Level</span>
                            <span>• Posted {job.postedAgo}</span>
                            <span>• Source: {job.source}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center sm:flex-col sm:items-end gap-2">
                        {match?.overallScore && match.overallScore > 0 ? (
                          <span className="text-xs font-bold text-green-800 bg-green-50 border border-green-200 px-2.5 py-1 rounded">
                            {match.overallScore}% Profile Match
                          </span>
                        ) : null}

                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => onRemoveSaved(job.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectJob(job)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold"
                          >
                            Open
                          </button>

                          <button
                            onClick={() => onQuickApply(job)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Apply</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Private Notes Section */}
                    <div className="pt-2 border-t border-slate-100 text-xs">
                      {editingId === job.id ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            placeholder="Add private application notes, referral contacts, or deadlines..."
                            className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-green-600"
                            rows={2}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNote(job.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded font-semibold"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="text-slate-600 italic">
                            {note ? (
                              <span>Note: "{note}"</span>
                            ) : (
                              <span className="text-slate-400">No private notes added.</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingId(job.id);
                              setTempNote(note || '');
                            }}
                            className="text-slate-500 hover:text-green-700 flex items-center gap-1 font-medium ml-2 flex-shrink-0"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{note ? 'Edit Note' : 'Add Note'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">You haven't saved any jobs yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click the bookmark icon on any job card across the portal to save opportunities for future reference.
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'applied' && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-600">
          <p>
            To manage and track active applications, please visit the{' '}
            <strong className="text-green-700">Application Tracker</strong> tab.
          </p>
        </div>
      )}

      {activeTab === 'archived' && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
          No archived jobs.
        </div>
      )}
    </div>
  );
};
