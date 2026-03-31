import React, { useState } from 'react';
import { Bell, MessageSquare, Activity, TrendingUp, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useDashboardCommunication } from '../hooks/useDashboardCommunication';
import { useAuthStore } from '../store/authStore';

interface DashboardCommunicationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardCommunicationPanel: React.FC<DashboardCommunicationPanelProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuthStore();
  const dashboard = (user?.role || 'candidate') as 'candidate' | 'employer' | 'admin';
  const {
    messages,
    notifications,
    stats,
    unreadCount,
    markNotificationAsRead
  } = useDashboardCommunication(dashboard);

  const [activeTab, setActiveTab] = useState<'notifications' | 'messages' | 'stats'>('notifications');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            <h2 className="text-xl font-bold">Dashboard Hub</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 sticky top-20">
          <div className="flex">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === 'messages'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === 'stats'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${getNotificationBgColor(
                      notification.type
                    )} ${notification.read ? 'opacity-60' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm font-medium">No notifications</p>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-3">
              {messages.length > 0 ? (
                messages.map(message => (
                  <div
                    key={message.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                            {message.fromDashboard}
                          </span>
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            {message.eventType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {JSON.stringify(message.data).substring(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm font-medium">No messages</p>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-bold text-blue-600 uppercase">Total Users</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">{stats.totalUsers}</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs font-bold text-emerald-600 uppercase">Total Jobs</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{stats.totalJobs}</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs font-bold text-purple-600 uppercase">Applications</p>
                  <p className="text-2xl font-black text-purple-900 mt-1">
                    {stats.totalApplications}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs font-bold text-orange-600 uppercase">Interviews</p>
                  <p className="text-2xl font-black text-orange-900 mt-1">{stats.totalInterviews}</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-bold text-red-600 uppercase">Active Now</p>
                  <p className="text-2xl font-black text-red-900 mt-1">{stats.activeInterviews}</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-bold text-amber-600 uppercase">Pending</p>
                  <p className="text-2xl font-black text-amber-900 mt-1">
                    {stats.pendingApplications}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs font-bold text-gray-600 uppercase">Recent Messages</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stats.recentMessages}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardCommunicationPanel;
