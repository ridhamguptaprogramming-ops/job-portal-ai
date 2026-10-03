import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  ExternalLink,
  Download,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Interview } from '../types/job';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../services/calendarService';

interface InterviewsViewProps {
  interviews: Interview[];
}

export const InterviewsView: React.FC<InterviewsViewProps> = ({
  interviews
}) => {
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const handleDownloadIcs = (interview: Interview) => {
    downloadIcsFile(interview);
    setDownloadSuccessId(interview.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Upcoming Interviews
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Employer-confirmed interview details will appear here when they are available from a verified source.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-xs text-green-900 font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Verified details only</span>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {interviews.length > 0 ? (
          interviews.map((interview) => {
            const start = new Date(interview.startTime);
            const end = new Date(interview.endTime);
            const gCalUrl = generateGoogleCalendarUrl(interview);

            return (
              <div
                key={interview.id}
                className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-xs space-y-4 hover:border-green-600/50 transition-colors"
              >
                {/* Top Strip */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {interview.companyLogo ? (
                        <img
                          src={interview.companyLogo}
                          alt={interview.company}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-extrabold text-base text-slate-700">
                          {interview.company.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          {interview.role} Interview
                        </h3>
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-200">
                          Confirmed by Employer
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {interview.company}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lead Interviewer: <strong>{interview.interviewer}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Date & Time pill */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-green-600" />
                      <span>{start.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="text-xs font-semibold text-green-800 mt-1 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-green-600" />
                      <span>
                        {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} –{' '}
                        {end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} ({interview.timezone})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meeting Link & Description */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-green-600" />
                      Virtual Video Room:
                    </span>
                    <a
                      href={interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>{interview.meetingUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {interview.notes && (
                    <p className="text-slate-600 italic pt-1 border-t border-slate-200/60">
                      Format: {interview.notes}
                    </p>
                  )}
                </div>

                {/* Action Buttons: Calendar Integration */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Add to Google Calendar Button */}
                    <a
                      href={gCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-md text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                      <span>Add to Google Calendar</span>
                    </a>

                    {/* Download .ics File Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadIcs(interview)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-md text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>{downloadSuccessId === interview.id ? 'Downloaded!' : 'Download .ics File'}</span>
                    </button>

                    {/* Join Meeting Button */}
                    <a
                      href={interview.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Interview Room</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              No employer-confirmed interviews are available
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Interviews are shown only when a verified source provides the details. No interview has been recorded for your account yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
