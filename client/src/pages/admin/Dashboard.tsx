import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await analyticsAPI.getAdminDashboard();
      setData(response.data.data || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      toast.error('Failed to load dashboard data');
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">System Overview</h1>
            <p className="text-gray-600 mt-2">Monitor platform activity and manage users</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium flex items-center gap-2"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Users</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{data?.totalUsers || 0}</h3>
                <p className="text-blue-700 text-sm mt-2">Active platform users</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center text-2xl">
                �
              </div>
            </div>
          </div>

          {/* Total Jobs */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Total Jobs</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{data?.totalJobs || 0}</h3>
                <p className="text-green-700 text-sm mt-2">Job postings on platform</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center text-2xl">
                💼
              </div>
            </div>
          </div>

          {/* Total Interviews */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Interviews</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{data?.totalInterviews || 0}</h3>
                <p className="text-purple-700 text-sm mt-2">Conducted interviews</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center text-2xl">
                🎤
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-semibold uppercase tracking-wide">Revenue</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">
                  ${(data?.totalRevenue || 0).toLocaleString()}
                </h3>
                <p className="text-yellow-700 text-sm mt-2">Total platform revenue</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center text-2xl">
                💰
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Verifications */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pending Verifications</h2>
                <p className="text-gray-600 text-sm mt-1">Items awaiting approval</p>
              </div>
              <Link to="/admin/companies" className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-semibold text-gray-900">Companies</p>
                  <p className="text-sm text-gray-600">Awaiting verification</p>
                </div>
                <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {data?.pendingCompanies || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-semibold text-gray-900">Job Postings</p>
                  <p className="text-sm text-gray-600">Awaiting approval</p>
                </div>
                <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {data?.pendingJobs || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-gray-600 text-sm mt-1">Latest platform events</p>
              </div>
              <Link to="/admin/logs" className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-3">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      📝
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-medium">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition border border-gray-200 group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">👥</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-gray-600 text-sm">View and manage all platform users</p>
            <div className="mt-4 text-red-600 font-semibold flex items-center gap-1">
              Go to Users
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/admin/companies"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition border border-gray-200 group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">🏢</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Companies</h3>
            <p className="text-gray-600 text-sm">Review and verify company profiles</p>
            <div className="mt-4 text-red-600 font-semibold flex items-center gap-1">
              Go to Companies
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/admin/jobs"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition border border-gray-200 group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">💼</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Moderate Jobs</h3>
            <p className="text-gray-600 text-sm">Review and approve job postings</p>
            <div className="mt-4 text-red-600 font-semibold flex items-center gap-1">
              Go to Jobs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition border border-gray-200 group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">📈</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-gray-600 text-sm">Detailed platform analytics and reports</p>
            <div className="mt-4 text-red-600 font-semibold flex items-center gap-1">
              Go to Analytics
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
