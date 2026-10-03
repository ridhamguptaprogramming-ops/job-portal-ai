import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  FileText,
  Building2,
  MapPin,
  ShieldCheck,
  Mail,
  Camera,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Job, UserProfile } from '../types/job';

interface ApplyModalProps {
  job: Job | null;
  user: UserProfile;
  onClose: () => void;
  onSubmitApplication: (
    job: Job,
    notes: string,
    screenshotBase64?: string,
    portalName?: string,
    transactionId?: string
  ) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  user,
  onClose,
  onSubmitApplication
}) => {
  if (!job) return null;

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Determine target portal based on job source
  const targetPortal =
    job.source.includes('Enterprise')
      ? 'Naukri.com Enterprise ATS'
      : job.source.includes('Global')
      ? 'Indeed Global Verified Feed'
      : job.source.includes('TechCareers')
      ? 'LinkedIn Jobs Direct'
      : 'DevJobs Unified Network';

  const portalId =
    targetPortal.includes('Naukri')
      ? user.connectedPortals?.naukriId || user.email
      : targetPortal.includes('LinkedIn')
      ? user.connectedPortals?.linkedInUrl || user.email
      : user.connectedPortals?.indeedId || user.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let screenshotBase64 = '';

    // Capture visual screenshot receipt using html2canvas
    if (ticketRef.current) {
      try {
        const canvas = await html2canvas(ticketRef.current, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#FFFFFF'
        });
        screenshotBase64 = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn('Screenshot capture fallback:', err);
      }
    }

    try {
      const res = await fetch('/api/applications/submit-genuine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          destinationPortal: targetPortal,
          portalCandidateId: portalId,
          personalEmail: user.email,
          applicantName: user.name,
          notes,
          screenshotBase64,
          jobLocation: job.location,
          jobSalary: job.salaryFormatted
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult({
          transactionId: data.transactionId,
          screenshotBase64,
          emailReceipt: data.emailReceipt
        });
        onSubmitApplication(
          job,
          notes,
          screenshotBase64,
          targetPortal,
          data.transactionId
        );
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-5 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Genuine Job Portal Application
              </h3>
              <p className="text-xs text-slate-500">
                {job.title} at {job.company}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submissionResult ? (
          /* Success Screen with Screenshot & Email Confirmation Details */
          <div className="space-y-4 py-2">
            <div className="text-center space-y-1.5">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">
                Application Successfully Submitted to {job.company}!
              </h4>
              <p className="text-xs text-slate-600">
                Transmitted via <strong className="text-slate-800">{targetPortal}</strong>
              </p>
              <div className="inline-block bg-slate-100 text-slate-800 font-mono text-xs px-2.5 py-1 rounded border border-slate-200 mt-1">
                Ref ID: {submissionResult.transactionId}
              </div>
            </div>

            {/* Email Dispatch Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 text-xs text-green-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Mail className="w-4 h-4 text-green-700" />
                <span>Confirmation Email Sent with Screenshot Receipt</span>
              </div>
              <p className="text-[11px] text-green-800 leading-relaxed">
                A formal submission confirmation with job specifications and attached receipt screenshot has been sent to your personal email address: <strong>{user.email}</strong>. A verification copy was also transmitted to the employer hiring desk.
              </p>
            </div>

            {/* Captured Screenshot Preview */}
            {submissionResult.screenshotBase64 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  Captured Verification Receipt Screenshot:
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  <img
                    src={submissionResult.screenshotBase64}
                    alt="Application Receipt"
                    className="w-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs shadow-xs"
              >
                Close & View in Tracker
              </button>
            </div>
          </div>
        ) : (
          /* Application Submission Form & Printable Ticket */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Captured Ticket Box */}
            <div
              ref={ticketRef}
              className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                    Official Job Application Ticket
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {job.company} • {job.location} ({job.remoteType})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    Target Portal
                  </span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    {targetPortal}
                  </span>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 block">Applicant Name</span>
                  <span className="font-semibold text-slate-900">{user.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Personal Email</span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {user.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Portal Candidate ID</span>
                  <span className="font-semibold text-slate-900">{portalId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Attached Resume</span>
                  <span className="font-semibold text-green-800">
                    {user.resumeFileName || 'Candidate_Resume.pdf'}
                  </span>
                </div>
              </div>

              {/* Verified GitHub Connection badge */}
              {user.connectedPortals?.githubUsername && (
                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    Verified GitHub: <strong>@{user.connectedPortals.githubUsername}</strong>
                  </span>
                  {user.connectedPortals?.fetchedGithubData?.publicRepos !== undefined && (
                    <span className="text-slate-500">
                      {user.connectedPortals.fetchedGithubData.publicRepos} public projects attached
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Candidate Cover Note */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Candidate Note to {job.company} Hiring Team (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly state your interest and relevant skills..."
                rows={2}
                className="w-full p-2 border border-slate-300 rounded text-slate-900 focus:ring-1 focus:ring-green-600 focus:outline-none"
              />
            </div>

            {/* Email Confirmation notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 flex items-start gap-2">
              <Mail className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                Upon submission, a receipt screenshot is automatically taken and emailed to <strong>{user.email}</strong> and the customer hiring department.
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? 'Submitting & Capturing Receipt...'
                    : `Submit to ${targetPortal}`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
