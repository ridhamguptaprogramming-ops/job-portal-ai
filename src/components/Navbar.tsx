import React, { useState } from 'react';
import {
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Bookmark,
  Kanban,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, UserNotification } from '../types/job';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  notifications: UserNotification[];
  onOpenNotifications: () => void;
  onOpenEmails?: () => void;
  onOpenPortals?: () => void;
  onOpenAIApply?: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  savedCount: number;
  applicationCount: number;
  sentEmailCount: number;
  interviewCount: number;
  apiConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  notifications,
  onOpenNotifications,
  onOpenAuth,
  onLogout,
  savedCount,
  applicationCount,
  interviewCount,
  apiConnected = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo matching openroles */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-1.5 text-left group focus:outline-none"
            >
              <span className="font-serif italic font-bold text-2xl text-[#B18A08] leading-none group-hover:text-[#F4C430] transition-colors">
                o
              </span>
              <span className="font-bold text-lg tracking-tight text-[#1F1F1F]">
                openroles
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-[13px] font-medium" aria-label="Main navigation">
              <button
                onClick={() => onNavigate('home')}
                className={`py-5 transition-all relative ${
                  currentView === 'home' || currentView === 'jobs'
                    ? 'text-[#1F1F1F] font-semibold border-b-2 border-[#F4C430]'
                    : 'text-[#666666] hover:text-[#1F1F1F]'
                }`}
              >
                Find jobs
              </button>

              <button
                onClick={() => onNavigate('resources')}
                className={`py-5 transition-all relative ${
                  currentView === 'resources'
                    ? 'text-[#1F1F1F] font-semibold border-b-2 border-[#F4C430]'
                    : 'text-[#666666] hover:text-[#1F1F1F]'
                }`}
              >
                Career resources
              </button>

              {user && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`py-5 transition-all relative ${
                      currentView === 'dashboard'
                        ? 'text-[#1F1F1F] font-semibold border-b-2 border-[#F4C430]'
                        : 'text-[#666666] hover:text-[#1F1F1F]'
                    }`}
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => onNavigate('saved')}
                    className={`py-5 transition-all flex items-center gap-1.5 ${
                      currentView === 'saved'
                        ? 'text-[#1F1F1F] font-semibold border-b-2 border-[#F4C430]'
                        : 'text-[#666666] hover:text-[#1F1F1F]'
                    }`}
                  >
                    <span>Saved</span>
                    {savedCount > 0 && (
                      <span className="bg-[#FFF4CC] text-[#745800] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {savedCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigate('tracker')}
                    className={`py-5 transition-all flex items-center gap-1.5 ${
                      currentView === 'tracker'
                        ? 'text-[#1F1F1F] font-semibold border-b-2 border-[#F4C430]'
                        : 'text-[#666666] hover:text-[#1F1F1F]'
                    }`}
                  >
                    <span>Applications</span>
                    {applicationCount > 0 && (
                      <span className="bg-[#ECE7D8] text-[#1F1F1F] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {applicationCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigate('interviews')}
                    className={`py-5 transition-all flex items-center gap-1.5 ${
                      currentView === 'interviews'
                        ? 'text-[#1F1F1F] font-semibold border-b-2 border-[#F4C430]'
                        : 'text-[#666666] hover:text-[#1F1F1F]'
                    }`}
                  >
                    <span>Interviews</span>
                    {interviewCount > 0 && (
                      <span className="bg-[#FFF4CC] text-[#745800] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {interviewCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell if logged in */}
            {user && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2 text-[#666666] hover:text-[#1F1F1F] transition-colors rounded-full hover:bg-slate-100"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F4C430] ring-2 ring-white" />
                )}
              </button>
            )}

            {/* Auth / Account trigger */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 border border-[#E5E5E5] hover:border-[#B18A08] px-3 py-1.5 text-xs font-semibold text-[#1F1F1F] bg-white transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#FFF4CC] text-[#745800] flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#666666]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E5E5] shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-[#ECE7D8] bg-slate-50">
                      <p className="font-semibold text-[#1F1F1F] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#666666] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[#1F1F1F] hover:bg-[#FFF4CC]/50 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[#1F1F1F] hover:bg-[#FFF4CC]/50 transition-colors"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('resume');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[#1F1F1F] hover:bg-[#FFF4CC]/50 transition-colors"
                    >
                      Resume & Skills
                    </button>
                    <div className="border-t border-[#ECE7D8]" />
                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="border border-[#E5E5E5] hover:border-[#B18A08] px-3.5 py-1.5 text-xs font-semibold text-[#1F1F1F] bg-white transition-colors"
              >
                Sign in
              </button>
            )}

            {/* "For employers →" Link */}
            <a
              href="mailto:hello@openroles.example?subject=Posting%20roles%20on%20OpenRoles"
              className="text-xs font-semibold text-[#745800] hover:text-[#1F1F1F] flex items-center gap-1 transition-colors"
            >
              <span>For employers</span>
              <span className="text-sm font-normal">→</span>
            </a>

            {/* Mobile menu hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#1F1F1F]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-white px-4 py-3 space-y-2 text-sm font-medium">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-[#1F1F1F]"
          >
            Find jobs
          </button>
          <button
            onClick={() => {
              onNavigate('resources');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-[#666666]"
          >
            Career resources
          </button>
          {user && (
            <>
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-[#1F1F1F]"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  onNavigate('saved');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-[#1F1F1F]"
              >
                Saved jobs ({savedCount})
              </button>
              <button
                onClick={() => {
                  onNavigate('tracker');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-[#1F1F1F]"
              >
                Applications ({applicationCount})
              </button>
              <button
                onClick={() => {
                  onNavigate('interviews');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-[#1F1F1F]"
              >
                Interviews ({interviewCount})
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-red-600 font-semibold"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
