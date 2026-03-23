import React, { useEffect, useState } from 'react';
import { Users, Briefcase, FileCheck, Activity, AlertCircle, Loader } from 'lucide-react';
import crossDashboardService from '../services/crossDashboardService';

interface SharedDashboardInfoProps {
  role: 'candidate' | 'employer' | 'admin';
}

const SharedDashboardInfo: React.FC<SharedDashboardInfoProps> = ({ role }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (role === 'candidate') {
        data = await crossDashboardService.getCandidateSharedData();
      } else if (role === 'employer') {
        data = await crossDashboardService.getEmployerSharedData();
      } else {
        data = await crossDashboardService.getAdminSharedData();
      }
      
      setStats(data);
    } catch (err: any) {
      setError('Failed to load dashboard stats');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="animate-spin text-blue-600" size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  // Render based on role
  if (role === 'candidate') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-semibold">Applications</p>
              <p className="text-lg font-bold text-blue-900">{stats.myApplications || 0}</p>
            </div>
            <FileCheck size={24} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-semibold">Interviews</p>
              <p className="text-lg font-bold text-purple-900">{stats.myInterviews || 0}</p>
            </div>
            <Activity size={24} className="text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-semibold">Completed</p>
              <p className="text-lg font-bold text-green-900">{stats.myResults || 0}</p>
            </div>
            <Briefcase size={24} className="text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-semibold">Success Rate</p>
              <p className="text-lg font-bold text-orange-900">
                {stats.myInterviews > 0 ? Math.round((stats.myResults / stats.myInterviews) * 100) : 0}%
              </p>
            </div>
            <AlertCircle size={24} className="text-orange-400" />
          </div>
        </div>
      </div>
    );
  }

  if (role === 'employer') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-semibold">Total Jobs</p>
              <p className="text-lg font-bold text-blue-900">{stats.totalJobs || 0}</p>
            </div>
            <Briefcase size={24} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-semibold">Applications</p>
              <p className="text-lg font-bold text-purple-900">{stats.totalApplications || 0}</p>
            </div>
            <FileCheck size={24} className="text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-semibold">Interviews</p>
              <p className="text-lg font-bold text-green-900">{stats.activeInterviews || 0}</p>
            </div>
            <Activity size={24} className="text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-semibold">Conversion</p>
              <p className="text-lg font-bold text-orange-900">
                {stats.totalApplications > 0 ? Math.round((stats.activeInterviews / stats.totalApplications) * 100) : 0}%
              </p>
            </div>
            <AlertCircle size={24} className="text-orange-400" />
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-semibold">Total Users</p>
            <p className="text-lg font-bold text-blue-900">{stats.totalUsers || 0}</p>
          </div>
          <Users size={24} className="text-blue-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-600 font-semibold">Total Jobs</p>
            <p className="text-lg font-bold text-purple-900">{stats.totalJobs || 0}</p>
          </div>
          <Briefcase size={24} className="text-purple-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-green-600 font-semibold">Active Interviews</p>
            <p className="text-lg font-bold text-green-900">{stats.activeInterviews || 0}</p>
          </div>
          <Activity size={24} className="text-green-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-600 font-semibold">Pending Apps</p>
            <p className="text-lg font-bold text-orange-900">{stats.pendingApplications || 0}</p>
          </div>
          <FileCheck size={24} className="text-orange-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200 md:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-red-600 font-semibold">Total Companies</p>
            <p className="text-lg font-bold text-red-900">{stats.totalCompanies || 0}</p>
          </div>
          <Users size={24} className="text-red-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg border border-indigo-200 md:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-600 font-semibold">System Health</p>
            <p className="text-lg font-bold text-indigo-900">Healthy ✓</p>
          </div>
          <AlertCircle size={24} className="text-indigo-400" />
        </div>
      </div>
    </div>
  );
};

export default SharedDashboardInfo;
