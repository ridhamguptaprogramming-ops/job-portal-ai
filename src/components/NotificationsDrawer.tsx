import React from 'react';
import { X, Bell, Check, Sparkles, Briefcase, Clock } from 'lucide-react';
import { UserNotification } from '../types/job';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: UserNotification[];
  onMarkAsRead: (id: string) => void;
  onSelectJobId: (jobId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onSelectJobId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkAsRead(notif.id);
                if (notif.jobId) onSelectJobId(notif.jobId);
              }}
              className={`pt-3 first:pt-0 p-2.5 rounded-lg cursor-pointer transition-colors ${
                notif.read ? 'bg-white hover:bg-slate-50' : 'bg-green-50/60 hover:bg-green-50 border border-green-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {notif.type === 'recommendation' ? (
                    <Sparkles className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {notif.title}
                  </h4>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                )}
              </div>

              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {notif.message}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                {notif.jobId && (
                  <span className="text-green-700 font-semibold hover:underline">
                    View Job Posting →
                  </span>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
