import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Globe,
  CheckSquare,
  Square
} from 'lucide-react';
import { LegalDocument } from '../types/auth';

interface TermsAndConditionsScreenProps {
  userName: string;
  userEmail: string;
  onAgreeAndComplete: (termsVersion: string, privacyVersion: string) => Promise<void>;
  onBackToAccounts?: () => void;
}

export const TermsAndConditionsScreen: React.FC<TermsAndConditionsScreenProps> = ({
  userName,
  userEmail,
  onAgreeAndComplete,
  onBackToAccounts
}) => {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const TERMS_VERSION = '2026-10-01';
  const PRIVACY_VERSION = '2026-10-01';

  const canContinue = agreedTerms && agreedPrivacy && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onAgreeAndComplete(TERMS_VERSION, PRIVACY_VERSION);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not complete onboarding. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#FFF4CC]">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Onboarding Step Tracker */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif italic font-bold text-2xl text-[#B18A08]">o</span>
            <span className="font-bold text-lg text-[#1F1F1F]">openroles</span>
            <span className="text-[#BABDB5]">·</span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#785C00] bg-[#FFF4CC] px-2 py-0.5 rounded">
              Step 3 of 3: Terms & Conditions
            </span>
          </div>
          <span className="text-xs text-[#82877D]">{userEmail}</span>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#1F1F1F]">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Please review the openroles platform terms and privacy policy before continuing to your candidate dashboard. Explicit agreement is legally recorded and versioned.
          </p>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Scrollable Terms Content (Section 23, 26) */}
        <div className="border border-[#E5E5E5] bg-[#FAF9F5] p-5 h-80 overflow-y-auto space-y-5 text-xs text-[#53594F] leading-relaxed font-sans shadow-inner">
          <div>
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 mb-3">
              <span className="font-bold text-xs text-[#1F1F1F] uppercase tracking-wider">
                1. openroles Candidate Terms of Service
              </span>
              <span className="text-[10px] text-[#82877D] font-mono">Version {TERMS_VERSION}</span>
            </div>
            <p className="mb-2">
              Welcome to openroles. By accessing or using our career discovery platform, you agree to be bound by these Terms of Service. openroles connects candidates directly with verified employers and authorized recruitment gateways.
            </p>
            <p className="mb-2 font-medium text-[#1F1F1F]">
              1.1 Strict No-Fake-Data Policy:
            </p>
            <p className="mb-2">
              All jobs listed on openroles are audited and verified against legitimate employer portals and authorized ATS feeds. Candidates agree to provide truthful resume data and not misrepresent employment history or educational credentials.
            </p>
            <p className="mb-2 font-medium text-[#1F1F1F]">
              1.2 Application Gateway & Dispatch:
            </p>
            <p className="mb-2">
              When applying for roles, openroles transmits candidate submissions directly to official employer career gateways. Application timestamps and transaction confirmations are logged for traceability.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 mb-3">
              <span className="font-bold text-xs text-[#1F1F1F] uppercase tracking-wider">
                2. Privacy & Data Handling Policy
              </span>
              <span className="text-[10px] text-[#82877D] font-mono">Version {PRIVACY_VERSION}</span>
            </div>
            <p className="mb-2">
              We respect your privacy. openroles does not sell, rent, or lease candidate data to unauthorized third parties.
            </p>
            <p className="mb-2 font-medium text-[#1F1F1F]">
              2.1 Connected Accounts:
            </p>
            <p className="mb-2">
              When you connect LinkedIn or GitHub, we request only minimum required profile and repository metadata. Access tokens are encrypted at rest using server-side keys and never exposed to browser client storage.
            </p>
            <p className="mb-2 font-medium text-[#1F1F1F]">
              2.2 Audit & Consent Preservation:
            </p>
            <p className="mb-2">
              Your consent, timestamp, and document versions are preserved in PostgreSQL audit tables to guarantee legal immutability.
            </p>
          </div>
        </div>

        {/* Section 24: Explicit Consent Checkboxes */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#B18A08] border-[#E5E5E5] rounded-none focus:ring-0 cursor-pointer accent-[#B18A08]"
              />
              <span className="text-xs text-[#1F1F1F] leading-snug">
                I agree to the <span className="font-bold">openroles Terms of Service</span> (Version {TERMS_VERSION}).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#B18A08] border-[#E5E5E5] rounded-none focus:ring-0 cursor-pointer accent-[#B18A08]"
              />
              <span className="text-xs text-[#1F1F1F] leading-snug">
                I acknowledge and accept the <span className="font-bold">Privacy Policy</span> (Version {PRIVACY_VERSION}).
              </span>
            </label>
          </div>

          {/* Section 24, 27: Agree & Continue Button (Disabled until both checkboxes are checked) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E5E5]">
            {onBackToAccounts && (
              <button
                type="button"
                onClick={onBackToAccounts}
                className="text-xs text-[#666666] hover:text-[#1F1F1F] font-semibold cursor-pointer"
              >
                ← Back to connected accounts
              </button>
            )}

            <button
              type="submit"
              disabled={!canContinue}
              className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                canContinue
                  ? 'bg-[#F4C430] hover:bg-[#e0b224] text-[#1F1F1F] cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-400 border border-[#E5E5E5] cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>Registering consent & activating profile...</span>
              ) : (
                <>
                  <span>Agree & Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security badge */}
        <div className="p-3 bg-white border border-[#E5E5E5] text-[11px] text-[#82877D] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B18A08]" />
          <span>Legally binding consent timestamped and verified via PostgreSQL storage</span>
        </div>
      </div>
    </div>
  );
};
