import React, { useState } from 'react';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  FileText,
  CheckCircle2,
  Edit2,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { UserProfile, RemoteType } from '../types/job';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigateToResume: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onNavigateToResume
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [headline, setHeadline] = useState(user.headline);
  const [location, setLocation] = useState(user.location);
  const [about, setAbout] = useState(user.about);
  const [targetTitle, setTargetTitle] = useState(user.careerPreferences.targetTitles.join(', '));
  const [remotePref, setRemotePref] = useState(user.careerPreferences.remotePreference);
  const [minSalary, setMinSalary] = useState(user.careerPreferences.minSalary || 1800000);

  const handleSave = () => {
    onUpdateUser({
      name,
      headline,
      location,
      about,
      careerPreferences: {
        ...user.careerPreferences,
        targetTitles: targetTitle.split(',').map((s) => s.trim()).filter(Boolean),
        remotePreference: remotePref,
        minSalary: Number(minSalary)
      }
    });
    setIsEditing(false);
  };

  const analysis = user.resumeAnalysis;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-green-600/30 flex items-center justify-center font-bold text-xl text-green-700">
              {user.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded">
                  Verified Candidate
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{user.headline}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center gap-1 border border-slate-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Job Titles (comma separated)</label>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">About / Bio</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={3}
                className="w-full p-2 border border-slate-300 rounded text-slate-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">About</h3>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {user.about || 'Passionate software engineer focused on building robust, high-performance distributed systems.'}
        </p>
      </div>

      {/* Career Preferences */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Career Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Target Roles</span>
            <span className="font-semibold text-slate-800 mt-1 block">
              {user.careerPreferences.targetTitles.join(', ') || 'Backend Developer'}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Work Arrangement</span>
            <span className="font-semibold text-slate-800 mt-1 block capitalize">
              {user.careerPreferences.remotePreference}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Minimum Expected Salary</span>
            <span className="font-semibold text-slate-800 mt-1 block">
              ₹{(user.careerPreferences.minSalary || 1800000) / 100000} LPA
            </span>
          </div>
        </div>
      </div>

      {/* Active Resume Link */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {user.resumeFileName || 'Rahul_Sharma_Resume.pdf'}
              </h3>
              <p className="text-xs text-slate-500">
                {analysis ? `Analyzed on ${new Date(analysis.analyzedAt).toLocaleDateString()} (${analysis.allSkills.length} skills)` : 'No active resume uploaded'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToResume}
            className="px-3.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded text-xs font-semibold"
          >
            Manage Resume & Skills
          </button>
        </div>
      </div>
    </div>
  );
};
