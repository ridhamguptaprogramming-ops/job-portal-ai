import React, { useState } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Calendar,
  Trash2,
  Edit3
} from 'lucide-react';
import { Application, ApplicationStatus, Job } from '../types/job';
import { CompanyLogo } from './CompanyLogo';

interface ApplicationTrackerViewProps {
  applications: Application[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => Promise<void>;
  onDeleteApplication: (id: string) => void;
  onSelectJob: (job: Job) => void;
}

const COLUMNS: { id: ApplicationStatus; label: string; color: string; badge: string }[] = [
  { id: 'draft', label: 'Started', color: 'border-slate-300', badge: 'bg-slate-100 text-slate-700' },
  { id: 'applied', label: 'Submitted by you', color: 'border-blue-400', badge: 'bg-blue-50 text-blue-700' },
];

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applications,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteApplication,
  onSelectJob
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const handleStartEdit = (app: Application) => {
    setEditingAppId(app.id);
    setTempNotes(app.notes || '');
  };

  const handleSaveEdit = async (appId: string) => {
    setIsSavingNotes(true);
    setNotesError(null);
    try {
      await onUpdateNotes(appId, tempNotes);
      setEditingAppId(null);
    } catch (error) {
      setNotesError(error instanceof Error ? error.message : 'Could not save notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const totalCount = applications.length;
  const startedCount = applications.filter((application) => application.status === 'draft').length;
  const submittedCount = applications.filter((application) => application.status === 'applied').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & View Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Application Tracker
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Track the application actions you have recorded. Employer decisions are shown only when verified by an authorized source.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 font-medium">Tracked Activity</span>
          <span className="text-2xl font-bold text-slate-900 block mt-1">{totalCount}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 font-medium">Application Started</span>
          <span className="text-2xl font-bold text-slate-700 block mt-1">{startedCount}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 font-medium">Submitted by You</span>
          <span className="text-2xl font-bold text-blue-700 block mt-1">{submittedCount}</span>
        </div>
      </div>

      {/* View Mode: Kanban */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col min-w-[210px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.2 bg-white border border-slate-200 rounded text-slate-700">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          onClick={() => onSelectJob(app.job)}
                          className="cursor-pointer group flex items-start gap-2.5 min-w-0"
                        >
                          <CompanyLogo
                            companyName={app.job.company}
                            logoUrl={app.job.companyLogo || app.job.companyInfo?.logoUrl}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-green-700 leading-snug line-clamp-1">
                              {app.job.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 font-medium truncate">
                              {app.job.company}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="text-slate-400 hover:text-red-600 p-1 flex-shrink-0"
                          title="Delete from tracker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Recorded: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Date unavailable'}</span>
                      </div>

                      {/* Notes / Edit */}
                      {editingAppId === app.id ? (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            maxLength={10000}
                            placeholder="Add private notes..."
                            className="w-full text-xs p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-green-600"
                            rows={2}
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingAppId(null)}
                              className="text-[10px] px-2 py-0.5 text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => void handleSaveEdit(app.id)}
                              disabled={isSavingNotes}
                              className="text-[10px] px-2 py-0.5 bg-green-600 text-white rounded font-semibold"
                            >
                              {isSavingNotes ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                          {notesError && (
                            <p role="alert" className="text-[10px] text-red-700">{notesError}</p>
                          )}
                        </div>
                      ) : (
                        app.notes && (
                          <p
                            onClick={() => handleStartEdit(app)}
                            className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-1.5 rounded cursor-pointer hover:bg-slate-100 italic"
                            title="Click to edit notes"
                          >
                            "{app.notes}"
                          </p>
                        )
                      )}

                      {/* Status select dropdown */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <button
                          onClick={() => handleStartEdit(app)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Notes</span>
                        </button>

                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="text-[10px] bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 font-semibold text-slate-800"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              Move to: {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                      <span className="text-[11px] text-slate-400">No applications</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode: Table */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Role & Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Recorded Date</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3.5">
                    <div
                      onClick={() => onSelectJob(app.job)}
                      className="cursor-pointer group flex items-center gap-3"
                    >
                      <CompanyLogo
                        companyName={app.job.company}
                        logoUrl={app.job.companyLogo || app.job.companyInfo?.logoUrl}
                        size="sm"
                      />
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-green-700 block">
                          {app.job.title}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {app.job.company} • {app.job.location}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3.5 text-slate-600">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—'}
                  </td>

                  <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                    {app.notes || '—'}
                  </td>

                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => onSelectJob(app.job)}
                      className="text-green-700 hover:text-green-800 font-semibold"
                    >
                      View Job
                    </button>
                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
