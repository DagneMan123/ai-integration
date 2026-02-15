import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getAdminDashboard();
      setData(response.data.data || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{data?.totalUsers || 0}</h3>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                🏢
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{data?.totalJobs || 0}</h3>
                <p className="text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                🎤
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{data?.totalInterviews || 0}</h3>
                <p className="text-gray-600">Interviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                💰
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  ${data?.totalRevenue?.toLocaleString() || 0}
                </h3>
                <p className="text-gray-600">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Pending Verifications</h2>
              <Link to="/admin/companies" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Companies</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Pending
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Job Postings</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Pending
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Link to="/admin/logs" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-bold text-gray-900">Manage Users</h3>
          </Link>

          <Link
            to="/admin/companies"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-lg font-bold text-gray-900">Verify Companies</h3>
          </Link>

          <Link
            to="/admin/jobs"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">💼</div>
            <h3 className="text-lg font-bold text-gray-900">Moderate Jobs</h3>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-lg font-bold text-gray-900">View Analytics</h3>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
