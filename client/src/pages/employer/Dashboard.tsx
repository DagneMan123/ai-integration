import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { employerMenu } from '../../config/menuConfig';

const EmployerDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getEmployerDashboard();
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
    <DashboardLayout menuItems={employerMenu} role="employer">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <Link
            to="/employer/jobs/create"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            + Post New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                💼
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{data?.totalJobs || 0}</h3>
                <p className="text-gray-600">Total Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{data?.activeJobs || 0}</h3>
                <p className="text-gray-600">Active Jobs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{data?.totalApplications || 0}</h3>
                <p className="text-gray-600">Applications</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                🎤
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{data?.totalInterviews || 0}</h3>
                <p className="text-gray-600">Interviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
            <div className="space-y-3">
              <p className="text-gray-500 text-center py-8">No recent applications</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Completions</h2>
            <div className="space-y-3">
              <p className="text-gray-500 text-center py-8">No completed interviews</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/employer/jobs"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Jobs</h3>
            <p className="text-gray-600">View and edit your job postings</p>
          </Link>

          <Link
            to="/employer/analytics"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">View hiring insights</p>
          </Link>

          <Link
            to="/employer/subscription"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Subscription</h3>
            <p className="text-gray-600">Manage your plan</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
