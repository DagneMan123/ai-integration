import React from 'react';
import { Activity, Users, Briefcase, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useCrossDashboardData } from '../hooks/useCrossDashboardData';

const SharedDashboardWidget: React.FC = () => {
  const { stats, activities, notifications, loading, error, refresh } = useCrossDashboardData();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalJobs || 0}</p>
            </div>
            <Briefcase className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase">Active Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeInterviews || 0}</p>
            </div>
            <Activity className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase">Pending Apps</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingApplications || 0}</p>
            </div>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedInterviews || 0}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase">Companies</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCompanies || 0}</p>
            </div>
            <Briefcase className="text-indigo-500" size={24} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Notifications</h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-semibold text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {activities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.type}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  activity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  activity.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={refresh}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default SharedDashboardWidget;
