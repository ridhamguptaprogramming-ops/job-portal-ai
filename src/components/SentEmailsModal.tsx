import React from 'react';
import {
  X,
  Mail,
  CheckCircle2,
  Calendar,
  Building2,
  ExternalLink,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { SentEmail } from '../types/job';

interface SentEmailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: SentEmail[];
}

export const SentEmailsModal: React.FC<SentEmailsModalProps> = ({
  isOpen,
  onClose,
  emails
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dispatched Confirmation Emails & Screenshot Receipts
              </h2>
              <p className="text-xs text-slate-500">
                Logged email records sent to candidate personal inbox & employer recruitment desks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {emails.length > 0 ? (
            emails.map((email) => (
              <div
                key={email.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{email.subject}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>Recipient: <strong className="text-slate-800">{email.to}</strong></span>
                      <span>•</span>
                      <span>Employer CC: <strong className="text-slate-700">{email.customerEmail}</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center gap-1 w-fit sm:ml-auto">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      Delivered
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(email.sentAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Meta block */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Company</span>
                    <span className="font-bold text-slate-800">{email.company}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Job Role</span>
                    <span className="font-bold text-slate-800">{email.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Portal</span>
                    <span className="font-bold text-green-700">{email.portalName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Transaction Ref</span>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">{email.transactionId}</span>
                  </div>
                </div>

                {/* Screenshot Verification */}
                {email.screenshotBase64 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      Attached Application Receipt Screenshot:
                    </span>
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto bg-slate-50">
                      <img
                        src={email.screenshotBase64}
                        alt="Application Receipt Screenshot"
                        className="w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Mail className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-700">No application confirmation emails dispatched yet.</p>
              <p>Whenever you apply for any job, a verification email and receipt screenshot will be logged here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
