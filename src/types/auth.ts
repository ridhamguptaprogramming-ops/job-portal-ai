export type OnboardingStep = 'auth' | 'accounts' | 'terms' | 'completed';

export type OnboardingState = 'UNAUTHENTICATED' | 'AUTHENTICATED' | 'ACCOUNTS_PENDING' | 'TERMS_PENDING' | 'COMPLETED';

export type AccountProvider = 'linkedin' | 'github' | 'naukri' | 'indeed' | 'workday';

export interface ConnectedAccountSummary {
  name?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  company?: string;
  location?: string;
  profileUrl?: string;
  reposCount?: number;
  followers?: number;
  topSkills?: string[];
  topRepos?: Array<{
    name: string;
    description: string;
    language: string;
    stars: number;
    url: string;
  }>;
}

export interface ConnectedAccount {
  id: string;
  provider: AccountProvider;
  providerUserId?: string;
  providerUsername?: string;
  profileUrl?: string;
  connectedAt: string;
  lastSyncedAt: string;
  status: 'connected' | 'disconnected' | 'error';
  summary?: ConnectedAccountSummary;
}

export interface LegalDocument {
  documentType: 'terms_and_conditions' | 'privacy_policy';
  version: string;
  title: string;
  content: string;
  publishedAt: string;
}

export interface UserConsentSubmission {
  termsAgreed: boolean;
  termsVersion: string;
  privacyAgreed: boolean;
  privacyVersion: string;
}

export interface AuthSessionResponse {
  user: {
    id: string;
    firebaseUid: string;
    email: string;
    emailVerified: boolean;
    name: string;
    photoUrl?: string;
    headline?: string;
    location?: string;
    onboardingCompleted: boolean;
    onboardingStep: OnboardingStep;
    termsAccepted: boolean;
    termsVersion?: string;
  };
  connectedAccounts: ConnectedAccount[];
  token: string;
}
