import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Send
} from 'lucide-react';
import { JobAlert, ExperienceLevel } from '../types/job';

interface JobAlertsViewProps {
  alerts: JobAlert[];
  onCreateAlert: (alert: Omit<JobAlert, 'id' | 'createdAt'>) => void;
  onDeleteAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
  onTriggerCheck: (alert: JobAlert) => void;
}

export const JobAlertsView: React.FC<JobAlertsViewProps> = ({
  alerts,
  onCreateAlert,
  onDeleteAlert,
  onToggleAlert,
  onTriggerCheck
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateAlert({
      title,
      keywords: keywords || title,
      location: location || 'Any Location',
      remoteOnly,
      experienceLevel,
      frequency,
      isActive: true,
      matchCount: Math.floor(Math.random() * 4) + 2
    });

    setTitle('');
    setKeywords('');
    setLocation('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Alerts</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Receive automated in-app notifications whenever fresh opportunities matching your criteria are syndicated.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Alert</span>
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    alert.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {alert.isActive ? 'Active' : 'Paused'}
                </span>
                <span className="text-[10px] text-slate-500 capitalize bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                  {alert.frequency} Digest
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>
                  <strong className="text-slate-700">Keywords:</strong> {alert.keywords}
                </span>
                <span>
                  <strong className="text-slate-700">Location:</strong> {alert.location}
                </span>
                {alert.remoteOnly && (
                  <span className="text-green-700 font-semibold">• Remote Only</span>
                )}
                {alert.experienceLevel && (
                  <span className="capitalize">• {alert.experienceLevel} Level</span>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Created on {new Date(alert.createdAt).toLocaleDateString()} • {alert.matchCount || 3} matching roles currently available
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => onTriggerCheck(alert)}
                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded text-xs font-semibold flex items-center gap-1"
                title="Simulate instant matching job check"
              >
                <Sparkles className="w-3.5 h-3.5 text-green-600" />
                <span>Run Match Check</span>
              </button>

              <button
                onClick={() => onToggleAlert(alert.id)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                title={alert.isActive ? 'Pause Alert' : 'Resume Alert'}
              >
                {alert.isActive ? (
                  <ToggleRight className="w-6 h-6 text-green-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => onDeleteAlert(alert.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                title="Delete Alert"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <Bell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Job Alerts configured</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Set up alerts to get notified instantly whenever new roles matching your desired skills and locations are posted.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold"
            >
              Create Your First Alert
            </button>
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Job Alert</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                We'll notify you in-app as soon as matching opportunities are aggregated.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alert Name / Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Backend Developer (Python / FastAPI)"
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Keywords & Skills
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. Python, FastAPI, PostgreSQL, Docker"
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India or Remote"
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 capitalize"
                  >
                    <option value="entry">Entry (0-2 yrs)</option>
                    <option value="mid">Mid (2-5 yrs)</option>
                    <option value="senior">Senior (5+ yrs)</option>
                    <option value="lead">Lead / Principal</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Notification Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900"
                  >
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded border-slate-300 accent-green-600"
                  />
                  <span className="text-slate-700">Only match remote or hybrid roles</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold shadow-xs"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
