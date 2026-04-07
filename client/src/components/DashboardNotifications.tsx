import React, { useState } from 'react';
import { X, Bell, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { DashboardMessage, DashboardRole } from '../services/dashboardCommunicationService';

interface DashboardNotificationsProps {
  messages: DashboardMessage[];
  role: DashboardRole;
  onMarkAsRead: (messageId: string | number) => void;
}

const DashboardNotifications: React.FC<DashboardNotificationsProps> = ({ messages, role, onMarkAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadMessages = messages.filter(m => !m.read);

  const getMessageIcon = (type: DashboardMessage['type']) => {
    switch (type) {
      case 'alert':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'notification':
        return <Bell size={18} className="text-blue-500" />;
      case 'data-update':
        return <CheckCircle2 size={18} className="text-green-500" />;
      case 'request':
        return <Info size={18} className="text-yellow-500" />;
      default:
        return <Bell size={18} className="text-slate-500" />;
    }
  };

  const getMessageColor = (type: DashboardMessage['type']) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 border-red-200';
      case 'notification':
        return 'bg-blue-50 border-blue-200';
      case 'data-update':
        return 'bg-green-50 border-green-200';
      case 'request':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getRoleLabel = (role: DashboardRole | undefined) => {
    if (!role) return 'Unknown';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        title="Cross-Dashboard Messages"
      >
        <Bell size={20} />
        {unreadMessages.length > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadMessages.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Cross-Dashboard Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Messages List */}
          <div className="divide-y divide-slate-100">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    message.read ? 'opacity-60' : 'opacity-100'
                  } ${getMessageColor(message.type)}`}
                  onClick={() => {
                    if (!message.read) {
                      onMarkAsRead(message.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getMessageIcon(message.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 text-sm">{message.title}</h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {getRoleLabel(message.from)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        {!message.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {messages.length > 0 && (
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-3 text-center">
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All Messages
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardNotifications;
