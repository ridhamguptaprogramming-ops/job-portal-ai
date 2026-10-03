import React, { useState, useMemo, useEffect } from 'react';
import {
  UserProfile,
  Job,
  JobMatchBreakdown,
  Application,
  JobAlert,
  UserNotification,
  ResumeAnalysis,
  ApplicationStatus,
  ConnectedPortals,
  SentEmail,
  Interview
} from './types/job';
import { ConnectedAccount, AccountProvider, OnboardingStep } from './types/auth';
import { calculateJobMatch } from './services/matchingEngine';
import { api, normalizeJob } from './services/api';
import {
  signOutFirebase,
  onAuthStateSubscription,
  isEmailLinkSignIn
} from './services/firebase';

import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { CareerResourcesView } from './components/CareerResourcesView';
import { JobDetailsModal } from './components/JobDetailsModal';
import { ResumeAIView } from './components/ResumeAIView';
import { ApplicationTrackerView } from './components/ApplicationTrackerView';
import { SavedJobsView } from './components/SavedJobsView';
import { JobAlertsView } from './components/JobAlertsView';
import { ProfileView } from './components/ProfileView';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AuthScreen } from './components/AuthScreen';
import { AccountConnectionsScreen } from './components/AccountConnectionsScreen';
import { TermsAndConditionsScreen } from './components/TermsAndConditionsScreen';
import { ApplyModal } from './components/ApplyModal';
import { InterviewsView } from './components/InterviewsView';
import { AdminQualityView } from './components/AdminQualityView';
import { SentEmailsModal } from './components/SentEmailsModal';

function mapApplicationRecord(record: any): Application | null {
  if (!record?.job || !['started', 'submitted', 'applied'].includes(record.status)) return null;
  const status: ApplicationStatus = record.status === 'started' ? 'draft' : 'applied';
  return {
    id: String(record.id),
    jobId: String(record.job_id),
    job: normalizeJob(record.job),
    status,
    appliedDate: record.applied_at || '',
    notes: record.notes || '',
    updatedAt: record.updated_at || '',
  };
}

export default function App() {
  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('home');

  // Authenticated User State
  const [user, setUser] = useState<UserProfile | null>(null);

  // Onboarding & Account Connections State (Sections 1, 10, 23, 28, 29)
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('accounts');
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [authScreenOpen, setAuthScreenOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  useEffect(() => {
    if (isEmailLinkSignIn()) {
      setAuthMode('signin');
      setAuthScreenOpen(true);
    }
  }, []);

  // Listen to Firebase Auth state changes (Section 37)
  useEffect(() => {
    const unsubscribe = onAuthStateSubscription(async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) return;
        try {
          const token = await firebaseUser.getIdToken();
          const res = await api.verifyFirebaseLogin(token);
          if (res && res.user) {
            const isComplete = Boolean(res.user.onboardingCompleted ?? res.user.onboarding_completed);
            const mappedUser: UserProfile = {
              id: res.user.id,
              name: res.user.name || res.user.displayName || 'Candidate',
              email: res.user.email,
              photoUrl: res.user.photoUrl || firebaseUser.photoURL || undefined,
              headline: res.user.headline || '',
              location: res.user.location || '',
              about: res.user.about || '',
              careerPreferences: {
                targetTitles: [],
                preferredLocations: [],
                remotePreference: 'any',
                currency: 'INR'
              },
              isOnboarded: isComplete
            };
            try {
              const { resume } = await api.getResumeAnalysis();
              if (resume) {
                mappedUser.resumeAnalysis = resume.analysis;
                mappedUser.resumeFileName = resume.fileName;
                mappedUser.resumeUploadedAt = resume.updatedAt;
              }
            } catch (resumeError) {
              console.warn('[openroles] Could not restore saved resume analysis:', resumeError);
            }
            setUser(mappedUser);
            setConnectedAccounts(res.connectedAccounts || res.connected_accounts || []);
            setOnboardingStep(res.user.onboardingStep || (isComplete ? 'completed' : 'accounts'));
            localStorage.setItem('openroles_user', JSON.stringify(mappedUser));
            await refreshAccountData();
          }
        } catch (err) {
          console.error('[openroles] Firebase session sync error:', err);
        }
      } else {
        await api.logout();
        setUser(null);
        setConnectedAccounts([]);
        setSavedJobIds(new Set());
        setApplications([]);
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const [jobs, setJobs] = useState<Job[]>([]);

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  const [applications, setApplications] = useState<Application[]>([]);

  const [interviews] = useState<Interview[]>([]);

  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  // Sent Emails
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);

  const refreshAccountData = async () => {
    const [savedResult, applicationsResult, notificationsResult] = await Promise.allSettled([
      api.getSavedJobs(),
      api.getApplications(),
      api.getNotifications(),
    ]);

    if (savedResult.status === 'fulfilled') {
      setSavedJobIds(new Set(savedResult.value.map((job) => job.id)));
    } else {
      console.error('[openroles] Could not load saved jobs:', savedResult.reason);
    }
    if (applicationsResult.status === 'fulfilled') {
      setApplications(
        applicationsResult.value
          .map(mapApplicationRecord)
          .filter((application): application is Application => application !== null),
      );
    } else {
      console.error('[openroles] Could not load applications:', applicationsResult.reason);
    }
    if (notificationsResult.status === 'fulfilled') {
      setNotifications(notificationsResult.value.map((item) => ({
        id: String(item.id),
        title: item.title || '',
        message: item.message || '',
        type: item.notification_type || item.type || 'system',
        jobId: item.job_id || item.jobId,
        read: Boolean(item.is_read ?? item.read),
        createdAt: item.created_at || item.createdAt || '',
      })));
    } else {
      console.error('[openroles] Could not load notifications:', notificationsResult.reason);
    }
  };

  // Modals
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [emailsModalOpen, setEmailsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize AI match scores
  const matchMap = useMemo<Record<string, JobMatchBreakdown>>(() => {
    const map: Record<string, JobMatchBreakdown> = {};
    for (const job of jobs) {
      map[job.id] = calculateJobMatch(job, user?.resumeAnalysis);
    }
    return map;
  }, [jobs, user?.resumeAnalysis]);

  // Toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Section 7, 8, 33: Firebase Auth Success & PostgreSQL Session Sync
  const handleFirebaseAuthSuccess = async (firebaseUser: any, token: string) => {
    try {
      const res = await api.verifyFirebaseLogin(token);
      if (res && res.user) {
        const isComplete = Boolean(res.user.onboardingCompleted);
        const mappedUser: UserProfile = {
          id: res.user.id,
          name: res.user.name || res.user.displayName || 'Candidate',
          email: res.user.email,
          photoUrl: res.user.photoUrl || firebaseUser.photoURL || undefined,
          headline: res.user.headline || '',
          location: res.user.location || '',
          about: res.user.about || '',
          careerPreferences: {
            targetTitles: [],
            preferredLocations: [],
            remotePreference: 'any',
            currency: 'INR'
          },
          isOnboarded: isComplete
        };
        setUser(mappedUser);
        setConnectedAccounts(res.connectedAccounts || res.connected_accounts || []);
        await refreshAccountData();
        localStorage.setItem('openroles_user', JSON.stringify(mappedUser));
        setAuthScreenOpen(false);

        if (isComplete) {
          setOnboardingStep('completed');
          setCurrentView('dashboard');
          showToast(`Welcome back, ${mappedUser.name}!`);
        } else {
          setOnboardingStep('accounts');
          setCurrentView('onboarding');
          showToast('Authentication confirmed via Firebase. Optional profile integrations are not configured yet.');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error synchronizing user session with PostgreSQL backend.');
      throw err;
    }
  };

  // Section 41: Disconnect Account Handler
  const handleDisconnectAccount = async (provider: AccountProvider) => {
    if (provider === 'github') {
      await api.disconnectGitHub();
    } else {
      await api.disconnectLinkedIn();
    }
    setConnectedAccounts((prev) => prev.filter((a) => a.provider !== provider));
    showToast(`Disconnected ${provider}.`);
  };

  // Section 24, 27: Explicit Terms Agreement & Onboarding Completion
  const handleAgreeAndCompleteOnboarding = async (termsVersion: string, privacyVersion: string) => {
    const res = await api.completeOnboarding(true, termsVersion, true, privacyVersion);
    if (res && res.user) {
      setUser((prev) => (prev ? { ...prev, isOnboarded: true } : null));
      setOnboardingStep('completed');
      setCurrentView('dashboard');
      showToast('Welcome to openroles! Your candidate profile is activated.');
    }
  };

  // Section 36: Full Logout Handler
  const handleLogout = async () => {
    await signOutFirebase();
    try {
      await api.logout();
    } catch (error) {
      console.error('[openroles] Could not clear backend session during sign-out:', error);
    }
    setUser(null);
    setConnectedAccounts([]);
    setSavedJobIds(new Set());
    setApplications([]);
    setNotifications([]);
    localStorage.removeItem('openroles_user');
    setCurrentView('home');
    setOnboardingStep('accounts');
    showToast('Signed out of openroles session.');
  };

  // Save toggle
  const handleSaveToggle = async (jobId: string) => {
    if (!user) {
      setAuthMode('signin');
      setAuthScreenOpen(true);
      return;
    }

    const isSaved = savedJobIds.has(jobId);
    try {
      if (isSaved) {
        await api.unsaveJob(jobId);
        setSavedJobIds((previous) => {
          const next = new Set(previous);
          next.delete(jobId);
          return next;
        });
        showToast('Role removed from saved jobs.');
      } else {
        await api.saveJob(jobId);
        setSavedJobIds((previous) => new Set(previous).add(jobId));
        showToast('Role saved.');
      }
    } catch (error: any) {
      console.error('[openroles] Could not update saved job:', error);
      showToast(error.message || 'Could not update saved jobs.');
    }
  };

  const handleApplyClick = (job: Job) => {
    if (!user) {
      setAuthMode('signin');
      setAuthScreenOpen(true);
      return;
    }
    setApplyingJob(job);
  };

  const handleSubmitApplication = async (job: Job, notes: string) => {
    if (!user) throw new Error('Sign in to record application activity.');

    const result = await api.createApplication({
      job_id: job.id,
      status: 'started',
      notes,
    });
    const application = mapApplicationRecord(result);
    if (!application) {
      throw new Error('The application activity was saved, but the server returned an incomplete job record.');
    }

    setApplications((previous) => [
      application,
      ...previous.filter((item) => item.id !== application.id),
    ]);
    showToast('Application start recorded. OpenRoles cannot verify whether the employer received your application.');
  };

  const handleUpdateStatus = async (applicationId: string, status: ApplicationStatus) => {
    const backendStatus = status === 'draft'
      ? 'started'
      : status === 'applied'
        ? 'submitted'
        : null;
    if (!backendStatus) {
      showToast('Employer decisions can only be recorded from a verified employer source.');
      return;
    }

    try {
      const result = await api.updateApplication(applicationId, { status: backendStatus });
      const application = mapApplicationRecord(result);
      if (!application) throw new Error('The server returned an incomplete application record.');
      setApplications((previous) => previous.map((item) => item.id === application.id ? application : item));
    } catch (error: any) {
      console.error('[openroles] Could not update application status:', error);
      showToast(error.message || 'Could not update application status.');
    }
  };

  const handleUpdateNotes = async (applicationId: string, notes: string) => {
    try {
      const result = await api.updateApplication(applicationId, { notes });
      const application = mapApplicationRecord(result);
      if (!application) throw new Error('The server returned an incomplete application record.');
      setApplications((previous) => previous.map((item) => item.id === application.id ? application : item));
    } catch (error: any) {
      console.error('[openroles] Could not save application notes:', error);
      showToast(error.message || 'Could not save application notes.');
      throw error;
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      await api.deleteApplication(applicationId);
      setApplications((previous) => previous.filter((item) => item.id !== applicationId));
      showToast('Application activity removed from your tracker.');
    } catch (error: any) {
      console.error('[openroles] Could not delete application:', error);
      showToast(error.message || 'Could not delete application activity.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F] font-['DM_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'auth') {
            setAuthMode('signin');
            setAuthScreenOpen(true);
          } else if (view === 'dashboard' && user && !user.isOnboarded) {
            // Section 29 Route Protection: Cannot bypass to dashboard
            setCurrentView('onboarding');
          } else {
            setCurrentView(view);
          }
        }}
        user={user}
        notifications={notifications}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenEmails={() => setEmailsModalOpen(true)}
        onOpenAuth={() => {
          setAuthMode('signin');
          setAuthScreenOpen(true);
        }}
        onLogout={handleLogout}
        savedCount={savedJobIds.size}
        applicationCount={applications.length}
        sentEmailCount={sentEmails.length}
        interviewCount={interviews.length}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {/* Section 1, 28, 29: Mandatory Onboarding Flow & Route Protection */}
        {user && !user.isOnboarded ? (
          onboardingStep === 'terms' ? (
            <TermsAndConditionsScreen
              userName={user.name}
              userEmail={user.email}
              onAgreeAndComplete={handleAgreeAndCompleteOnboarding}
              onBackToAccounts={() => setOnboardingStep('accounts')}
            />
          ) : (
            <AccountConnectionsScreen
              userEmail={user.email}
              userName={user.name}
              connectedAccounts={connectedAccounts}
              onDisconnectAccount={handleDisconnectAccount}
              onContinue={() => setOnboardingStep('terms')}
            />
          )
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                jobs={jobs}
                matchMap={matchMap}
                savedJobIds={savedJobIds}
                user={user}
                onSaveToggle={handleSaveToggle}
                onSelectJob={(j) => setSelectedJob(j)}
                onQuickApply={handleApplyClick}
                onJobsLoaded={setJobs}
                onNavigate={(v) => {
                  if (v === 'auth') {
                    setAuthMode('signup');
                    setAuthScreenOpen(true);
                  } else {
                    setCurrentView(v);
                  }
                }}
              />
            )}

            {currentView === 'resources' && (
              <CareerResourcesView onNavigate={(v) => setCurrentView(v)} />
            )}

            {currentView === 'dashboard' && user && (
              <DashboardView
                user={user}
                jobs={jobs}
                savedJobIds={savedJobIds}
                applications={applications}
                interviews={interviews}
                onNavigate={(v) => setCurrentView(v)}
                onSelectJob={(j) => setSelectedJob(j)}
                onSaveToggle={handleSaveToggle}
              />
            )}

            {currentView === 'saved' && (
              <SavedJobsView
                jobs={jobs}
                savedJobIds={savedJobIds}
                matchMap={matchMap}
                onRemoveSaved={handleSaveToggle}
                onSelectJob={(j) => setSelectedJob(j)}
                onQuickApply={handleApplyClick}
              />
            )}

            {currentView === 'tracker' && (
              <ApplicationTrackerView
                applications={applications}
                onUpdateStatus={handleUpdateStatus}
                onUpdateNotes={handleUpdateNotes}
                onDeleteApplication={handleDeleteApplication}
                onSelectJob={(j) => setSelectedJob(j)}
              />
            )}

            {currentView === 'interviews' && (
              <InterviewsView
                interviews={interviews}
              />
            )}

            {currentView === 'profile' && user && (
              <ProfileView
                user={user}
                onUpdateUser={(updated) => {
                  const next = { ...user, ...updated };
                  setUser(next);
                  localStorage.setItem('openroles_user', JSON.stringify(next));
                  showToast('Profile updated');
                }}
                onNavigateToResume={() => setCurrentView('resume')}
              />
            )}

            {currentView === 'resume' && user && (
              <ResumeAIView
                user={user}
                onUpdateAnalysis={(analysis, fileName) => {
                  const updated = {
                    ...user,
                    resumeAnalysis: analysis,
                    resumeFileName: fileName,
                    resumeUploadedAt: new Date().toISOString()
                  };
                  setUser(updated);
                  localStorage.setItem('openroles_user', JSON.stringify(updated));
                  showToast(`Resume parsed: ${analysis.allSkills.length} skills extracted`);
                }}
                onNavigateToMatches={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'quality' && (
              <AdminQualityView
                jobs={jobs}
              />
            )}
          </>
        )}
      </main>

      {/* Footer matching openroles deployed site */}
      <footer className="border-t border-[#E5E5E5] min-h-[72px] px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] bg-white gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-serif italic font-bold text-xl text-[#B18A08]">o</span>
          <span className="font-bold text-sm text-[#1F1F1F]">openroles</span>
          <span className="text-[#BABDB5]">·</span>
          <span>Small steps. Good work. © 2026 Open Roles</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setCurrentView('quality')}
            className="hover:text-[#1F1F1F] text-[#745800]"
          >
            System Status & Providers
          </button>
          <a
            href="mailto:hello@openroles.example"
            className="text-[#745800] hover:text-[#1F1F1F]"
          >
            Say hello ↗
          </a>
        </div>
      </footer>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          match={matchMap[selectedJob.id]}
          isSaved={savedJobIds.has(selectedJob.id)}
          onClose={() => setSelectedJob(null)}
          onSaveToggle={handleSaveToggle}
          onApply={(j) => {
            setSelectedJob(null);
            handleApplyClick(j);
          }}
        />
      )}

      {/* Apply Modal */}
      {applyingJob && user && (
        <ApplyModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSubmitApplication={handleSubmitApplication}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={async (id) => {
          try {
            await api.markNotificationRead(id);
            setNotifications((previous) =>
              previous.map((notification) => notification.id === id
                ? { ...notification, read: true }
                : notification)
            );
          } catch (error: any) {
            console.error('[openroles] Could not mark notification as read:', error);
            showToast(error.message || 'Could not update the notification.');
          }
        }}
        onSelectJobId={(id) => {
          const found = jobs.find((j) => j.id === id);
          if (found) {
            setSelectedJob(found);
            setNotificationsOpen(false);
          }
        }}
      />

      {/* Direct Firebase Auth Screen (Section 2, 3, 5, 6, 47) */}
      {authScreenOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <AuthScreen
            initialMode={authMode}
            onAuthSuccess={handleFirebaseAuthSuccess}
            onCancel={() => setAuthScreenOpen(false)}
          />
        </div>
      )}

      {/* Sent Emails Modal */}
      <SentEmailsModal
        isOpen={emailsModalOpen}
        onClose={() => setEmailsModalOpen(false)}
        emails={sentEmails}
      />

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1F1F1F] text-white px-4 py-2.5 shadow-xl text-xs font-semibold flex items-center gap-2 border border-[#E5E5E5]/20 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-[#F4C430]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
