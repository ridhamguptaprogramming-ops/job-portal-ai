import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Send, X } from 'lucide-react';
import { Job } from '../types/job';

interface ApplyModalProps {
  job: Job | null;
  onClose: () => void;
  onSubmitApplication: (job: Job, notes: string) => Promise<void>;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  onClose,
  onSubmitApplication,
}) => {
  const [notes, setNotes] = useState('');
  const [hasOpenedEmployerSite, setHasOpenedEmployerSite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasRecorded, setWasRecorded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applicationUrl = useMemo(() => {
    const value = job?.originalJobUrl || job?.sourceUrl;
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  }, [job?.originalJobUrl, job?.sourceUrl]);

  if (!job) return null;

  const handleRecordStart = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmitApplication(job, notes);
      setWasRecorded(true);
    } catch (error) {
      console.error('[openroles] Could not record application activity:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Could not record application activity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-5 my-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Continue on employer site</h3>
            <p className="text-xs text-slate-500">{job.title} at {job.company}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {wasRecorded ? (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">Application activity recorded</h4>
              <p className="text-sm text-slate-600">
                This records that you started the application process. OpenRoles cannot confirm submission or employer receipt.
              </p>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRecordStart} className="space-y-4 text-sm">
            <p className="text-slate-600">
              Apply directly through the employer’s listing. We do not submit applications to employers or send application emails.
            </p>

            {applicationUrl ? (
              <a
                href={applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasOpenedEmployerSite(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded text-slate-800 hover:bg-slate-50 font-semibold text-xs"
              >
                <ExternalLink className="w-4 h-4" />
                Open employer application
              </a>
            ) : (
              <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                The employer application link is unavailable for this listing.
              </div>
            )}

            <div>
              <label htmlFor="application-notes" className="font-semibold text-slate-700 block mb-1">
                Private notes (optional)
              </label>
              <textarea
                id="application-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={10000}
                placeholder="Add notes for your own tracker..."
                rows={3}
                className="w-full p-2 border border-slate-300 rounded text-slate-900 focus:ring-1 focus:ring-green-600 focus:outline-none"
              />
            </div>

            {errorMessage && (
              <div role="alert" className="flex gap-2 p-3 bg-red-50 border border-red-200 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-500">
                After you open the listing and start applying, record that activity here.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !applicationUrl || !hasOpenedEmployerSite}
                className="shrink-0 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded font-bold text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Recording…' : 'Record application start'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
