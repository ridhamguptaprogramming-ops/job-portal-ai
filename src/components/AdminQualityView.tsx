import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Job } from '../types/job';

interface AdminQualityViewProps {
  jobs: Job[];
}

export const AdminQualityView: React.FC<AdminQualityViewProps> = ({ jobs }) => {
  const activeJobs = jobs.filter((job) => job.status === 'active');
  const verifiedJobs = jobs.filter((job) => job.isVerifiedSource);
  const sourceCount = new Set(jobs.map((job) => job.source).filter(Boolean)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Data Overview</h1>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Counts below reflect records returned by the job API. Independent URL checks and feed-ingestion telemetry are not configured.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Metric label="Active records" value={activeJobs.length} />
        <Metric label="Verified-source records" value={verifiedJobs.length} />
        <Metric label="Sources represented" value={sourceCount} />
        <Metric label="URL reachability" value="Not measured" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Listings returned by API</h2>
          <p className="text-xs text-slate-500 mt-1">
            Source and verification fields are shown as provided by the API; no live re-verification is performed here.
          </p>
        </div>

        {jobs.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Role and company</th>
                  <th className="px-3.5 py-2.5">Source</th>
                  <th className="px-3.5 py-2.5">Source flag</th>
                  <th className="px-3.5 py-2.5">Last verification timestamp</th>
                  <th className="px-3.5 py-2.5 text-right">Listing URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-3.5 py-2.5">
                      <span className="font-bold text-slate-900 block">{job.title}</span>
                      <span className="text-slate-500">{job.company}</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">{job.source || 'Not provided'}</td>
                    <td className="px-3.5 py-2.5 text-slate-600">
                      {job.isVerifiedSource ? 'Verified by API' : 'Not verified'}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-500">
                      {job.lastVerifiedAt ? new Date(job.lastVerifiedAt).toLocaleString() : 'Not provided'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      {job.originalJobUrl ? (
                        <a href={job.originalJobUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline inline-flex items-center gap-1">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : 'Not provided'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            No job records were returned. No feed ingestion or URL verification status can be reported.
          </p>
        )}
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-3.5">
    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{label}</span>
    <span className="text-xl font-extrabold text-slate-800 block mt-1">{value}</span>
  </div>
);
