import React, { useState } from 'react';
import {
  FolderGit2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  Info,
  Trash2,
  Lock,
  Layers
} from 'lucide-react';
import { ConnectedAccount, AccountProvider } from '../types/auth';

interface AccountConnectionsScreenProps {
  userEmail: string;
  userName: string;
  connectedAccounts: ConnectedAccount[];
  onConnectGitHub: (username: string) => Promise<void>;
  onConnectLinkedIn: () => Promise<void>;
  onSyncAccount: (provider: AccountProvider) => Promise<void>;
  onDisconnectAccount: (provider: AccountProvider) => Promise<void>;
  onContinue: () => void;
}

export const AccountConnectionsScreen: React.FC<AccountConnectionsScreenProps> = ({
  userEmail,
  userName,
  connectedAccounts,
  onConnectGitHub,
  onConnectLinkedIn,
  onSyncAccount,
  onDisconnectAccount,
  onContinue
}) => {
  const [gitHubInput, setGitHubInput] = useState('ridhamgupta805');
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [disconnectConfirm, setDisconnectConfirm] = useState<AccountProvider | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to find connection
  const getAccount = (provider: AccountProvider) =>
    connectedAccounts.find((a) => a.provider === provider && a.status === 'connected');

  const githubAccount = getAccount('github');
  const linkedinAccount = getAccount('linkedin');

  // Trigger GitHub connection
  const handleConfirmGitHub = async () => {
    if (!gitHubInput.trim()) return;
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      await onConnectGitHub(gitHubInput.trim());
      setIsGitHubModalOpen(false);
      setSuccessMsg('GitHub technical profile successfully imported.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect GitHub account.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Trigger LinkedIn connection
  const handleTriggerLinkedIn = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      await onConnectLinkedIn();
      setSuccessMsg('LinkedIn professional profile connected via official OAuth.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authorize LinkedIn.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Sync action
  const handleSync = async (provider: AccountProvider) => {
    setSyncingProvider(provider);
    setErrorMsg(null);
    try {
      await onSyncAccount(provider);
      setSuccessMsg(`Refreshed data from ${provider}.`);
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to sync ${provider}.`);
    } finally {
      setSyncingProvider(null);
    }
  };

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
            Connect your professional and technical profiles to populate verified skills, showcase repositories, and power intelligent job matching. All integrations are optional and you can connect more later.
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
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#82877D] bg-slate-100 px-2 py-0.5">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666666]">
                    Import verified candidate headline, current role, and verified experience summary via official LinkedIn OAuth.
                  </p>
                  {linkedinAccount && (
                    <div className="text-[11px] text-[#82877D] pt-1">
                      <span>Last synced: {new Date(linkedinAccount.lastSyncedAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                {linkedinAccount ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSync('linkedin')}
                      disabled={syncingProvider === 'linkedin'}
                      className="px-3 py-1.5 border border-[#E5E5E5] bg-white hover:bg-slate-50 text-xs font-semibold text-[#1F1F1F] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          syncingProvider === 'linkedin' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Sync</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisconnectConfirm('linkedin')}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Disconnect LinkedIn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleTriggerLinkedIn}
                    disabled={isConnecting}
                    className="px-4 py-2 bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    Connect LinkedIn
                  </button>
                )}
              </div>
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
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#82877D] bg-slate-100 px-2 py-0.5">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666666]">
                    Import public repositories, programming languages, and verified GitHub engineering activity.
                  </p>
                  {githubAccount && githubAccount.summary && (
                    <div className="pt-2 text-[11px] text-[#53594F] space-y-1">
                      <div className="font-semibold">
                        @{githubAccount.providerUsername} · {githubAccount.summary.reposCount || 0} public repositories
                      </div>
                      {githubAccount.summary.topSkills && (
                        <div className="flex flex-wrap gap-1">
                          {githubAccount.summary.topSkills.map((sk) => (
                            <span
                              key={sk}
                              className="px-1.5 py-0.5 bg-slate-100 text-[#1F1F1F] text-[10px] font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-[#82877D]">
                        Last synced: {new Date(githubAccount.lastSyncedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                {githubAccount ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSync('github')}
                      disabled={syncingProvider === 'github'}
                      className="px-3 py-1.5 border border-[#E5E5E5] bg-white hover:bg-slate-50 text-xs font-semibold text-[#1F1F1F] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          syncingProvider === 'github' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Sync</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisconnectConfirm('github')}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Disconnect GitHub"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsGitHubModalOpen(true)}
                    className="px-4 py-2 bg-[#1F1F1F] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Connect GitHub
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Supported Job Portal Gateways (Section 17) */}
          <div className="border border-[#E5E5E5] p-5 bg-[#FAF9F5] space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1F1F1F]">Job Portal Gateway Integrations</h3>
                  <span className="text-[10px] font-semibold text-[#745800] bg-[#FFF4CC] px-2 py-0.5">
                    Authorized API only
                  </span>
                </div>
                <p className="text-xs text-[#666666] pt-1">
                  Connect supported external recruitment gateways for 1-click ATS application dispatch. Unauthorized scraping is prohibited.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white border border-[#E5E5E5] p-3 space-y-1">
                <span className="text-xs font-bold text-[#1F1F1F] block">Naukri.com Enterprise ATS</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">● API Ready</span>
                <p className="text-[10px] text-[#82877D]">Direct job application gateway</p>
              </div>

              <div className="bg-white border border-[#E5E5E5] p-3 space-y-1">
                <span className="text-xs font-bold text-[#1F1F1F] block">Indeed Workday API</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">● API Ready</span>
                <p className="text-[10px] text-[#82877D]">Official XML feed & token pipeline</p>
              </div>

              <div className="bg-white border border-[#E5E5E5] p-3 space-y-1">
                <span className="text-xs font-bold text-[#1F1F1F] block">Instahyre / Workday</span>
                <span className="text-[10px] text-[#82877D] font-semibold block">○ Optional</span>
                <p className="text-[10px] text-[#82877D]">Can link during application step</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Privacy Disclaimer (Section 20, 45) */}
        <div className="p-4 bg-white border border-[#E5E5E5] text-xs text-[#666666] space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[#1F1F1F]">
            <ShieldCheck className="w-4 h-4 text-[#B18A08]" />
            <span>Strict Token & Privacy Security</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            openroles only imports information you authorize. Third-party passwords are never requested or stored. OAuth access tokens are securely managed server-side and never exposed to browser storage. You can disconnect accounts at any time.
          </p>
        </div>

        {/* Section 22: Continue Button taking user to Terms & Conditions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
          <span className="text-xs text-[#82877D]">
            Integrations configured: {connectedAccounts.filter((a) => a.status === 'connected').length} active
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

      {/* GitHub Username Modal */}
      {isGitHubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] w-full max-w-sm p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#1F1F1F]">Connect GitHub Technical Profile</h3>
            <p className="text-xs text-[#666666]">
              Enter your public GitHub username to import verified repositories, programming languages, and contribution statistics.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#53594F] uppercase mb-1">
                  GitHub Username
                </label>
                <div className="flex items-center border border-[#E5E5E5] px-2.5 py-1.5">
                  <span className="text-xs text-slate-400 mr-1">github.com/</span>
                  <input
                    type="text"
                    value={gitHubInput}
                    onChange={(e) => setGitHubInput(e.target.value)}
                    placeholder="username"
                    className="w-full text-xs text-[#1F1F1F] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGitHubModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E5E5E5] text-xs text-[#666666] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGitHub}
                  disabled={isConnecting || !gitHubInput.trim()}
                  className="px-4 py-1.5 bg-[#1F1F1F] hover:bg-black text-white text-xs font-bold disabled:opacity-50"
                >
                  {isConnecting ? 'Importing...' : 'Import Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal (Section 41) */}
      {disconnectConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] w-full max-w-sm p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Disconnect {disconnectConfirm}?
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Are you sure you want to disconnect {disconnectConfirm}? Your existing technical profile and resume data will remain in your profile, but automatic profile sync will be paused.
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
