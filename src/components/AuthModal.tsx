import React, { useState } from 'react';
import { UserProfile } from '../types/job';
import { api } from '../services/api';
import {
  loginWithEmail,
  registerWithEmail,
  refreshCurrentFirebaseUser,
  resendCurrentEmailVerification
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: Partial<UserProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);

  if (!isOpen) return null;

  const completeSignIn = async (firebaseUser: any, token: string) => {
    if (!firebaseUser.emailVerified) {
      setVerificationPending(true);
      setSuccessMessage('Verify your email before continuing. Use the link sent to your inbox, then return here.');
      return;
    }
    const response = await api.verifyFirebaseLogin(token);
    onAuthSuccess(token, {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      isOnboarded: response.user.onboardingCompleted
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const { user, token } = await loginWithEmail(email, password);
        await completeSignIn(user, token);
      } else {
        const { user, emailVerificationSent } = await registerWithEmail(email, password, name);
        setVerificationPending(!user.emailVerified);
        setSuccessMessage(
          emailVerificationSent
            ? `A verification link was sent to ${user.email}. Verify it before continuing.`
            : `Your account was created, but the verification email could not be sent to ${user.email}. Retry below.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmEmailVerification = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { user, token } = await refreshCurrentFirebaseUser();
      setVerificationPending(false);
      await completeSignIn(user, token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify your email yet.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await resendCurrentEmailVerification();
      setSuccessMessage(`A new verification link was sent to ${email.trim()}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not resend the verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#20231E]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E5] shadow-2xl max-w-sm w-full p-8 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666666] hover:text-[#1F1F1F] text-2xl font-light leading-none cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header matching openroles account dialog */}
        <div className="mb-6">
          <span className="text-[10px] font-bold tracking-widest text-[#8C9285] uppercase block">
            YOUR OPENROLES ACCOUNT
          </span>
          <h2 className="text-2xl font-semibold text-[#1F1F1F] mt-1.5 font-display tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <label className="block space-y-1.5 font-semibold text-[#1F1F1F]">
              <span>Full Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full border border-[#E5E5E5] p-2.5 text-xs text-[#1F1F1F] focus:outline-2 focus:outline-[#F4C430] bg-white font-normal"
              />
            </label>
          )}

          <label className="block space-y-1.5 font-semibold text-[#1F1F1F]">
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="w-full border border-[#E5E5E5] p-2.5 text-xs text-[#1F1F1F] focus:outline-2 focus:outline-[#F4C430] bg-white font-normal"
            />
          </label>

          <label className="block space-y-1.5 font-semibold text-[#1F1F1F]">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full border border-[#E5E5E5] p-2.5 text-xs text-[#1F1F1F] focus:outline-2 focus:outline-[#F4C430] bg-white font-normal"
            />
          </label>

          {errorMessage && <p className="text-xs text-red-600 font-medium">{errorMessage}</p>}
          {successMessage && <p className="text-xs text-emerald-700 font-medium">{successMessage}</p>}

          {verificationPending && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => void confirmEmailVerification()}
                disabled={isLoading}
                className="w-full border border-[#E5E5E5] py-2.5 text-xs font-semibold disabled:opacity-50"
              >
                I have verified my email
              </button>
              <button
                type="button"
                onClick={() => void resendVerification()}
                disabled={isLoading}
                className="w-full border border-[#E5E5E5] py-2.5 text-xs font-semibold disabled:opacity-50"
              >
                Resend verification email
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F4C430] hover:bg-[#e0b224] text-[#1F1F1F] py-3 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Processing…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-4 pt-4 border-t border-[#ECE7D8] flex flex-col items-start gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-[#745800] hover:text-[#1F1F1F] font-bold cursor-pointer"
          >
            {mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}
          </button>

        </div>
      </div>
    </div>
  );
};
