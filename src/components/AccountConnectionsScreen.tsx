import React, { useState } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { ConnectedAccount, AccountProvider } from '../types/auth';

interface AccountConnectionsScreenProps {
  userEmail: string;
  userName: string;
  connectedAccounts: ConnectedAccount[];
  onDisconnectAccount: (provider: AccountProvider) => Promise<void>;
  onContinue: () => void;
}

export const AccountConnectionsScreen: React.FC<AccountConnectionsScreenProps> = ({
  userEmail,
  userName,
  connectedAccounts,
  onDisconnectAccount,
  onContinue
}) => {
  const [disconnectConfirm, setDisconnectConfirm] = useState<AccountProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to find connection
  const getAccount = (provider: AccountProvider) =>
    connectedAccounts.find((a) => a.provider === provider && a.status === 'connected');

  const githubAccount = getAccount('github');
  const linkedinAccount = getAccount('linkedin');

  // Disconnect action
  const handleDisconnect = async (provider: AccountProvider) => {
    try {
      await onDisconnectAccount(provider);
      setDisconnectConfirm(null);
      setSuccessMsg(`${provider} account disconnected.`);
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to disconnect ${provider}.`);
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
              Step 2 of 3: Connect Accounts
            </span>
          </div>
          <span className="text-xs text-[#82877D]">Candidate: {userName || userEmail}</span>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#1F1F1F]">
            Connect your accounts
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Official profile integrations are not configured yet. Existing saved connections are shown below; new connections are disabled until verified OAuth flows are available.
          </p>
        </div>

        {/* Error / Success Banners */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-[#FFF4CC]/50 border border-[#F4C430] text-xs text-[#745800] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#B18A08] flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* Accounts List (Section 48) */}
        <div className="space-y-4">
          {/* 1. LinkedIn Card */}
          <div className="border border-[#E5E5E5] p-5 bg-white hover:border-[#B18A08]/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#0A66C2] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  in
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1F1F1F]">LinkedIn</h3>
                    {linkedinAccount ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
                        Saved record
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#82877D] bg-slate-100 px-2 py-0.5">
                        Not configured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666666]">
                    Official LinkedIn OAuth is not configured yet. No LinkedIn profile data is being imported.
                  </p>
                  {linkedinAccount && (
                    <div className="text-[11px] text-amber-800 pt-1">
                      This saved record does not confirm LinkedIn account ownership.
                    </div>
                  )}
                </div>
              </div>

              {linkedinAccount && (
                <button
                  type="button"
                  onClick={() => setDisconnectConfirm('linkedin')}
                  className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Disconnect LinkedIn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 2. GitHub Card */}
          <div className="border border-[#E5E5E5] p-5 bg-white hover:border-[#B18A08]/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#1F1F1F] text-white flex items-center justify-center flex-shrink-0">
                  <FolderGit2 className="w-5 h-5 text-[#F4C430]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1F1F1F]">GitHub</h3>
                    {githubAccount ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
                        Saved record
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#82877D] bg-slate-100 px-2 py-0.5">
                        Not configured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666666]">
                    Official GitHub OAuth is not configured yet. Entering a username alone does not verify account ownership.
                  </p>
                  {githubAccount && (
                    <div className="text-[11px] text-amber-800 pt-1">
                      This saved record does not confirm GitHub account ownership or verify imported data.
                    </div>
                  )}
                </div>
              </div>

              {githubAccount && (
                <button
                  type="button"
                  onClick={() => setDisconnectConfirm('github')}
                  className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Disconnect GitHub"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="border border-[#E5E5E5] p-5 bg-[#FAF9F5] text-xs text-[#666666]">
            Applications are completed on each employer’s website. Direct ATS integrations and application dispatch are not configured.
          </div>
        </div>

        {/* Security & Privacy Disclaimer (Section 20, 45) */}
        <div className="p-4 bg-white border border-[#E5E5E5] text-xs text-[#666666] space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[#1F1F1F]">
            <ShieldCheck className="w-4 h-4 text-[#B18A08]" />
            <span>Strict Token & Privacy Security</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Third-party credentials are not requested. Account linking and OAuth token handling will remain unavailable until official OAuth flows are configured. You can remove existing connection records at any time.
          </p>
        </div>

        {/* Section 22: Continue Button taking user to Terms & Conditions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
          <span className="text-xs text-[#82877D]">
            Existing connection records: {connectedAccounts.filter((a) => a.status === 'connected').length}
          </span>
          <button
            type="button"
            onClick={onContinue}
            className="px-6 py-2.5 bg-[#F4C430] hover:bg-[#e0b224] text-[#1F1F1F] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Continue to Terms & Conditions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Disconnect Confirmation Modal (Section 41) */}
      {disconnectConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] w-full max-w-sm p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Disconnect {disconnectConfirm}?
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Are you sure you want to remove the saved {disconnectConfirm} connection from your account?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDisconnectConfirm(null)}
                className="px-3 py-1.5 border border-[#E5E5E5] text-xs text-[#666666] hover:bg-slate-50"
              >
                Keep connected
              </button>
              <button
                type="button"
                onClick={() => handleDisconnect(disconnectConfirm)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Confirm Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
