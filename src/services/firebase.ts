import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  ActionCodeSettings,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

/**
 * Firebase Client Configuration
 * Uses provisioned credentials from firebase-applet-config.json with optional VITE_ overrides.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  measurementId: appletConfig.measurementId || undefined
};

// Initialize Firebase App idempotently
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Analytics and the default Firestore database
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

const emailVerificationActionCodeSettings: ActionCodeSettings = {
  url: window.location.origin,
  handleCodeInApp: true
};
export const emailForSignInStorageKey = 'emailForSignIn';

// Validate Connection to Firestore on startup
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client offline or waiting for network.');
    }
  }
}
testFirestoreConnection();

// Configure Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Translates Firebase Auth error codes into clean, professional messages
 */
export function getFirebaseErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for openroles or use Email sign-in.';
    case 'auth/unauthorized-domain':
      return 'This app domain is not yet allowlisted in Firebase Auth authorized domains. Please use Email Sign-Up or Demo Sign-In.';
    case 'auth/api-key-not-valid':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Firebase API key is refreshing. Please try again or use direct login.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Authentication. Enable it in the Firebase console and try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'This email sign-in link is invalid or has expired. Request a new link and try again.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Invalid email or sign-in credentials.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access is temporarily disabled for security. Please try again later.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email using a different sign-in method.';
    default:
      return error.message || 'Authentication failed. Please verify credentials.';
  }
}

/**
 * Sign in with Google via official Firebase Popup
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { user: result.user, token };
  } catch (error: any) {
    console.error('[Firebase Auth] Google Sign-In Error:', error);
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/**
 * Register with Email and Password
 * Dispatches verification email immediately.
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<{ user: FirebaseUser; token: string; emailVerificationSent: boolean }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    let emailSent = false;
    try {
      await sendEmailVerification(result.user, emailVerificationActionCodeSettings);
      emailSent = true;
    } catch (verifyErr) {
      console.warn('[Firebase Auth] Verification email dispatch note:', verifyErr);
    }
    const token = await result.user.getIdToken();
    return { user: result.user, token, emailVerificationSent: emailSent };
  } catch (error: any) {
    console.error('[Firebase Auth] Email Registration Error:', error);
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(
  email: string,
  pass: string
): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const token = await result.user.getIdToken();
    return { user: result.user, token };
  } catch (error: any) {
    console.error('[Firebase Auth] Email Login Error:', error);
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/**
 * Send a passwordless email sign-in link.
 * Returns false only when the link was sent but the browser could not save the email locally.
 */
export async function sendEmailSignInLink(email: string): Promise<boolean> {
  const normalizedEmail = email.trim();
  try {
    await sendSignInLinkToEmail(auth, normalizedEmail, emailVerificationActionCodeSettings);
  } catch (error: any) {
    console.error('[Firebase Auth] Email Sign-In Link Error:', error);
    throw new Error(getFirebaseErrorMessage(error));
  }

  try {
    window.localStorage.setItem(emailForSignInStorageKey, normalizedEmail);
    return true;
  } catch (error) {
    console.error('[Firebase Auth] Could not save email for sign-in link:', error);
    return false;
  }
}

export function isEmailLinkSignIn(): boolean {
  return isSignInWithEmailLink(auth, window.location.href);
}

/**
 * Complete passwordless email sign-in using the current URL's one-time link.
 */
export async function completeEmailLinkSignIn(
  email: string
): Promise<{ user: FirebaseUser; token: string }> {
  try {
    const result = await signInWithEmailLink(auth, email.trim(), window.location.href);
    try {
      window.localStorage.removeItem(emailForSignInStorageKey);
    } catch (storageError) {
      console.error('[Firebase Auth] Could not clear saved email for sign-in link:', storageError);
    }
    const currentUrl = new URL(window.location.href);
    ['apiKey', 'mode', 'oobCode', 'lang', 'tenantId'].forEach((parameter) => {
      currentUrl.searchParams.delete(parameter);
    });
    window.history.replaceState(null, document.title, currentUrl.toString());
    const token = await result.user.getIdToken();
    return { user: result.user, token };
  } catch (error: any) {
    console.error('[Firebase Auth] Email Link Sign-In Error:', error);
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/**
 * Send password reset email via Firebase
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.error('[Firebase Auth] Password Reset Error:', error);
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/**
 * Sign out of Firebase session
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('[Firebase Auth] Signout Error:', error);
  }
}

/**
 * Get active Firebase ID token for Authorization header
 */
export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  const current = auth.currentUser;
  if (!current) return null;
  return current.getIdToken(forceRefresh);
}

/**
 * Subscribe to Firebase Auth state changes
 */
export function onAuthStateSubscription(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
