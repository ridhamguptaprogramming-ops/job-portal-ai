import React, { useState } from 'react';
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types/job';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('ridhamgupta805@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'linkedin' | 'email' | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthMethod('google');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ridhamgupta805@gmail.com',
          name: 'Ridham Gupta',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          googleId: '1092847291048291'
        })
      });

      const data = await res.json();
      if (data && data.user) {
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess({
            ...data.user,
            location: 'Bengaluru, India',
            about: 'Software engineer and active candidate seeking verified technical roles.',
            careerPreferences: {
              targetTitles: ['Backend Developer', 'Software Engineer', 'Full Stack Developer'],
              preferredLocations: ['Bengaluru', 'Remote'],
              remotePreference: 'remote',
              minSalary: 1800000,
              currency: 'INR'
            },
            isOnboarded: false
          });
        }, 600);
      }
    } catch {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    setIsLoading(true);
    setAuthMethod('linkedin');

    try {
      const res = await fetch('/api/auth/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ridhamgupta805@gmail.com',
          name: 'Ridham Gupta',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          linkedinId: 'li-ridham-gupta'
        })
      });

      const data = await res.json();
      if (data && data.user) {
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess({
            ...data.user,
            location: 'India',
            about: 'Software engineer and active candidate seeking verified technical roles.',
            careerPreferences: {
              targetTitles: ['Backend Developer', 'Software Engineer'],
              preferredLocations: ['Bengaluru', 'Remote'],
              remotePreference: 'remote',
              minSalary: 1800000,
              currency: 'INR'
            },
            isOnboarded: false
          });
        }, 600);
      }
    } catch {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setAuthMethod('email');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (data && data.user) {
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess({
            ...data.user,
            name: email.split('@')[0],
            location: 'India',
            about: 'Software engineer candidate.',
            careerPreferences: {
              targetTitles: ['Software Engineer'],
              preferredLocations: ['Remote'],
              remotePreference: 'remote',
              minSalary: 1800000,
              currency: 'INR'
            },
            isOnboarded: false
          });
        }, 600);
      }
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Career<span className="text-green-600">Match</span> Portal
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
          Sign in to find jobs and manage your own application tracker.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-xl shadow-xs space-y-6">
          {/* Header notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              Applications are completed on employer websites. This portal does not submit applications or send application confirmation emails.
            </div>
          </div>

          {/* Social Auth Providers */}
          <div className="space-y-3">
            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-2xs transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoading && authMethod === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* LinkedIn Sign-in Button */}
            <button
              type="button"
              onClick={handleLinkedInLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#0A66C2] rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#0A66C2] hover:bg-[#084e96] focus:outline-none focus:ring-2 focus:ring-[#0A66C2] shadow-2xs transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.44a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
              </svg>
              <span>{isLoading && authMethod === 'linkedin' ? 'Connecting to LinkedIn...' : 'Continue with LinkedIn'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold text-slate-400 bg-white px-3">
              <span>Or sign in with email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Candidate Personal Email
              </label>
              <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600">
                <Mail className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ridhamgupta805@gmail.com"
                  className="w-full bg-transparent text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Password
              </label>
              <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600">
                <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{isLoading && authMethod === 'email' ? 'Signing in...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            By continuing, your profile will be configured to receive genuine application receipts and confirmation emails at <strong>{email}</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
