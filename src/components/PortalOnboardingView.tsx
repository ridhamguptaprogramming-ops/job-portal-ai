import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Star,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Building2,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserProfile, ConnectedPortals } from '../types/job';

interface PortalOnboardingViewProps {
  user: UserProfile;
  onComplete: (updatedPortals: ConnectedPortals, headline?: string, about?: string) => void;
}

export const PortalOnboardingView: React.FC<PortalOnboardingViewProps> = ({
  user,
  onComplete
}) => {
  const [githubUsername, setGithubUsername] = useState(user.connectedPortals?.githubUsername || 'ridhamgupta805');
  const [linkedInUrl, setLinkedInUrl] = useState(user.connectedPortals?.linkedInUrl || 'https://linkedin.com/in/ridham-gupta');
  const [naukriId, setNaukriId] = useState(user.connectedPortals?.naukriId || user.email);
  const [indeedId, setIndeedId] = useState(user.connectedPortals?.indeedId || `IND-${user.email.split('@')[0]}`);
  const [instahyreId, setInstahyreId] = useState(user.connectedPortals?.instahyreId || `INSTA-${user.email.split('@')[0]}`);
  const [workdayEmail, setWorkdayEmail] = useState(user.connectedPortals?.workdayEmail || user.email);

  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubData, setGithubData] = useState<any>(user.connectedPortals?.fetchedGithubData || null);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Fetch real data from GitHub Public API
  const handleFetchGithub = async () => {
    if (!githubUsername.trim()) return;

    setIsFetchingGithub(true);
    setGithubError(null);

    try {
      const res = await fetch('/api/integrations/fetch-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: githubUsername.trim() })
      });

      const data = await res.json();
      if (res.ok && data.githubData) {
        setGithubData(data.githubData);
      } else {
        setGithubError(data.error || 'Could not fetch GitHub profile.');
      }
    } catch (err: any) {
      setGithubError('Network error connecting to GitHub API');
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const portals: ConnectedPortals = {
      githubUsername: githubUsername.trim(),
      linkedInUrl: linkedInUrl.trim(),
      naukriId: naukriId.trim(),
      indeedId: indeedId.trim(),
      instahyreId: instahyreId.trim(),
      workdayEmail: workdayEmail.trim(),
      fetchedGithubData: githubData || undefined
    };

    const newHeadline = githubData?.bio
      ? `${githubData.bio} • Software Engineer`
      : 'Full Stack & Backend Software Engineer';
    const newAbout = githubData?.bio
      ? `${githubData.bio}. Verified software engineer candidate with ${githubData.publicRepos || 0} public repositories.`
      : undefined;

    onComplete(portals, newHeadline, newAbout);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Connect Your Professional Profiles & Job Portals
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Link your Indian & global job board profiles (Naukri, LinkedIn, Indeed) and GitHub to enable genuine 1-click application submission directly through CareerMatch.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: GitHub & LinkedIn Professional IDs */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                1. Developer & Professional Identity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We fetch your real public repositories and verified work experience to populate your application payloads.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* GitHub ID with Live Fetch */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  GitHub Username / Profile ID *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. ridhamgupta805 or torvalds"
                    className="flex-1 p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-green-600"
                  />
                  <button
                    type="button"
                    onClick={handleFetchGithub}
                    disabled={isFetchingGithub}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-1.5 flex-shrink-0"
                  >
                    {isFetchingGithub ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FolderGit2 className="w-3.5 h-3.5" />
                    )}
                    <span>Fetch Data</span>
                  </button>
                </div>
                {githubError && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{githubError}</span>
                  </p>
                )}
              </div>

              {/* LinkedIn URL / ID */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  LinkedIn Profile URL / ID *
                </label>
                <input
                  type="text"
                  required
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/ridham-gupta"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-green-600"
                />
                <span className="text-[10px] text-slate-500 block">
                  Used for verified LinkedIn Easy Apply and direct recruiter referrals.
                </span>
              </div>
            </div>

            {/* Live Fetched GitHub Card */}
            {githubData && (
              <div className="bg-slate-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {githubData.avatarUrl && (
                      <img
                        src={githubData.avatarUrl}
                        alt={githubData.name}
                        className="w-10 h-10 rounded-full border border-slate-300 object-cover"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{githubData.name}</span>
                        <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Live GitHub Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {githubData.bio || 'Public Software Developer'} • {githubData.publicRepos} Public Repositories
                      </p>
                    </div>
                  </div>
                </div>

                {githubData.topRepos && githubData.topRepos.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Top Verified Projects Attached to Applications:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {githubData.topRepos.slice(0, 4).map((repo: any) => (
                        <div
                          key={repo.name}
                          className="bg-white border border-slate-200 rounded p-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 truncate">{repo.name}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                              {repo.language}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {repo.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Indian & Global Job Portal Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-600" />
                2. Job Portals Used for Applications (India & Global)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The portal connects to these destinations to genuinely transmit your applications to the hiring employer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Naukri.com */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Naukri.com Profile ID / Email *
                  </label>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    India Core
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={naukriId}
                  onChange={(e) => setNaukriId(e.target.value)}
                  placeholder="e.g. ridhamgupta805@gmail.com"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Used for verified listings on Naukri Enterprise & FastForward.
                </span>
              </div>

              {/* Indeed India / Global */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Indeed Profile ID / Resume Key *
                  </label>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                    Global / India
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={indeedId}
                  onChange={(e) => setIndeedId(e.target.value)}
                  placeholder="e.g. IND-ridhamgupta805"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Used for genuine submission to Indeed India & Global boards.
                </span>
              </div>

              {/* Instahyre / Wellfound */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Instahyre / Wellfound Candidate ID
                  </label>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                    Tech Startups
                  </span>
                </div>
                <input
                  type="text"
                  value={instahyreId}
                  onChange={(e) => setInstahyreId(e.target.value)}
                  placeholder="e.g. INSTA-ridhamgupta805"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Direct routing to startup engineering opportunities.
                </span>
              </div>

              {/* Company ATS / Workday */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Direct Corporate ATS Email (Workday/Lever)
                  </label>
                  <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                    Enterprise
                  </span>
                </div>
                <input
                  type="email"
                  value={workdayEmail}
                  onChange={(e) => setWorkdayEmail(e.target.value)}
                  placeholder="e.g. ridhamgupta805@gmail.com"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Confirmation receipt copy dispatched to this personal address.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Submission Confirmation & Screenshot Delivery Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-xs text-green-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-green-950">
              <ShieldCheck className="w-5 h-5 text-green-700" />
              <span>Genuine Application Submission & Email Receipt Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Whenever you click <strong>"Apply Now"</strong> on any vacancy:
            </p>
            <ul className="space-y-1 pl-4 list-disc text-green-900">
              <li>Your application is registered genuinely with that specific portal (Naukri, LinkedIn, or Indeed).</li>
              <li>A digital confirmation email detailing the application specifications and vacancy details is dispatched to <strong>{user.email}</strong>.</li>
              <li>A visual screenshot receipt is automatically captured and emailed to both you and the employer hiring department.</li>
              <li>Your Application Tracker updates in real time with the transaction reference code.</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Save Details & Access Job Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
