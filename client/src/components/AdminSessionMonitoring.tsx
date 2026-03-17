import React, { useState, useEffect } from 'react';
import { X, Activity, Clock, Users, AlertCircle } from 'lucide-react';

interface AdminSessionMonitoringProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SessionInfo {
  userId: string;
  userName: string;
  loginTime: string;
  lastActivity: string;
  status: 'active' | 'idle' | 'offline';
  currentPage: string;
  sessionDuration: string;
}

const AdminSessionMonitoring: React.FC<AdminSessionMonitoringProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([
    {
      userId: '1',
      userName: 'John Candidate',
      loginTime: '10:30 AM',
      lastActivity: '2 mins ago',
      status: 'active',
      currentPage: '/candidate/dashboard',
      sessionDuration: '45 mins'
    },
    {
      userId: '2',
      userName: 'Sarah Employer',
      loginTime: '09:15 AM',
      lastActivity: '5 mins ago',
      status: 'idle',
      currentPage: '/employer/jobs',
      sessionDuration: '2 hrs 15 mins'
    },
    {
      userId: '3',
      userName: 'Mike Admin',
      loginTime: '08:00 AM',
      lastActivity: 'Just now',
      status: 'active',
      currentPage: '/admin/dashboard',
      sessionDuration: '3 hrs 30 mins'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'idle':
        return 'bg-yellow-100 text-yellow-700';
      case 'offline':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity size={24} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Session Monitor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-xs text-blue-600 font-medium">Active</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">1</p>
              <p className="text-xs text-yellow-600 font-medium">Idle</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-600">0</p>
              <p className="text-xs text-gray-600 font-medium">Offline</p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Active Sessions
            </h3>
            {sessions.map((session) => (
              <div key={session.userId} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{session.userName}</p>
                    <p className="text-xs text-slate-500">{session.userId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(session.status)}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>Login: {session.loginTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-slate-400" />
                    <span>Last: {session.lastActivity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-slate-400" />
                    <span>Page: {session.currentPage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>Duration: {session.sessionDuration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSessionMonitoring;
