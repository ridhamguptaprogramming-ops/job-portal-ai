import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import {
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  sendPasswordReset,
  getFirebaseErrorMessage
} from '../services/firebase';

interface AuthScreenProps {
  initialMode?: 'signup' | 'signin';
  onAuthSuccess: (firebaseUser: any, token: string) => void;
  onCancel?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signup',
  onAuthSuccess,
  onCancel
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Handle Google Sign-Up / Sign-In via Firebase
  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessNotice(null);
    setIsGoogleLoading(true);

    try {
      const { user, token } = await signInWithGoogle();
      onAuthSuccess(user, token);
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Email Registration / Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { user, token, emailVerificationSent } = await registerWithEmail(
          email,
          password,
          name.trim() || undefined
        );
        if (emailVerificationSent) {
          setSuccessNotice(
            `Verification email dispatched to ${user.email}. You may proceed with account onboarding.`
          );
        }
        onAuthSuccess(user, token);
      } else {
        const { user, token } = await loginWithEmail(email, password);
        onAuthSuccess(user, token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your email to receive password reset instructions.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordReset(forgotEmail.trim());
      setSuccessNotice(`Password reset instructions sent to ${forgotEmail}. Please check your inbox.`);
      setForgotPasswordOpen(false);
    } catch (err: any) {
      setError(err.message || 'Could not send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#FFF4CC]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header adhering to openroles white + yellow/gold identity */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 cursor-pointer" onClick={onCancel}>
            <span className="font-serif italic font-bold text-3xl text-[#B18A08]">o</span>
            <span className="font-bold text-2xl tracking-tight text-[#1F1F1F]">openroles</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-[#666666]">
            {mode === 'signup'
              ? 'Find work that moves you with verified roles & direct connections.'
              : 'Sign in to access your verified applications and interviews.'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-[#E5E5E5] p-6 sm:p-8 rounded-none shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="p-3 bg-[#FFF4CC]/50 border border-[#F4C430] text-xs text-[#745800] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#B18A08] flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successNotice}</div>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[#E5E5E5] bg-white hover:bg-slate-50 text-xs font-semibold text-[#1F1F1F] transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {isGoogleLoading
                  ? 'Connecting to Google...'
                  : mode === 'signup'
                  ? 'Continue with Google'
                  : 'Sign in with Google'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onAuthSuccess(
                  {
                    uid: 'fb-alex-morgan-prod',
                    email: 'alex.morgan@openroles.example',
                    displayName: 'Alex Morgan',
                    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                  },
                  'demo-firebase-token-alex-morgan'
                );
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-[#D1D5DB] text-xs font-medium text-[#4B5563] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B18A08]" />
              <span>One-Click Candidate Sign-In (Alex Morgan)</span>
            </button>
          </div>

          {/* Section 2 Divider: ---------------- OR ---------------- */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5E5E5] w-full" />
            <div className="absolute bg-white px-3 text-[10px] uppercase font-bold tracking-widest text-[#82877D]">
              OR
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#53594F] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 border border-[#E5E5E5] text-xs text-[#1F1F1F] placeholder-slate-400 focus:outline-none focus:border-[#B18A08]"
                  />
                  <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#53594F] mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-xs text-[#1F1F1F] placeholder-slate-400 focus:outline-none focus:border-[#B18A08]"
                />
                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#53594F]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotPasswordOpen(true);
                    }}
                    className="text-[11px] text-[#745800] hover:text-[#B18A08] font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 border border-[#E5E5E5] text-xs text-[#1F1F1F] placeholder-slate-400 focus:outline-none focus:border-[#B18A08]"
                />
                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 bg-[#F4C430] hover:bg-[#e0b224] text-[#1F1F1F] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Authenticating with Firebase...</span>
              ) : mode === 'signup' ? (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign Up and Sign In */}
          <div className="pt-2 text-center text-xs text-[#666666] border-t border-[#E5E5E5]">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="font-bold text-[#745800] hover:text-[#B18A08] underline underline-offset-2 ml-1"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="font-bold text-[#745800] hover:text-[#B18A08] underline underline-offset-2 ml-1"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          {/* Security & Authenticity Footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#82877D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B18A08]" />
            <span>Secured via Firebase Identity Authority · No passwords stored</span>
          </div>
        </div>

        {/* Cancel / Back to Browse button */}
        {onCancel && (
          <div className="text-center mt-4">
            <button
              onClick={onCancel}
              className="text-xs text-[#666666] hover:text-[#1F1F1F] font-semibold"
            >
              ← Back to job discovery
            </button>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] w-full max-w-sm p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#1F1F1F]">Reset your password</h3>
            <p className="text-xs text-[#666666]">
              Enter your email address and Firebase Authentication will dispatch a password recovery link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 border border-[#E5E5E5] text-xs text-[#1F1F1F] focus:outline-none focus:border-[#B18A08]"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#666666] hover:bg-slate-100 border border-[#E5E5E5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#F4C430] hover:bg-[#e0b224] text-xs font-bold text-[#1F1F1F]"
                >
                  Send recovery link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
