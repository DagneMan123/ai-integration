import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import toast from 'react-hot-toast';

const CandidateDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await analyticsAPI.getCandidateDashboard();
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
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="text-gray-600 mt-2">Track your job applications and interview progress</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link
              to="/jobs"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Applications Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Applications</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{data?.applications || 0}</h3>
                <p className="text-blue-700 text-sm mt-2">Total job applications submitted</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
            </div>
          </div>

          {/* Interviews Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Interviews</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{data?.interviews || 0}</h3>
                <p className="text-green-700 text-sm mt-2">Scheduled and completed interviews</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center text-2xl">
                🎤
              </div>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Avg Score</p>
                <h3 className="text-4xl font-bold text-gray-900 mt-2">{data?.averageScore?.toFixed(1) || 'N/A'}</h3>
                <p className="text-purple-700 text-sm mt-2">Your average interview score</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center text-2xl">
                🏆
              </div>
            </div>
          </div>
        </div>

        {/* Recent Interviews Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Interviews</h2>
              <p className="text-gray-600 text-sm mt-1">Your latest interview activity</p>
            </div>
            <Link to="/candidate/interviews" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {data?.recentInterviews && data.recentInterviews.length > 0 ? (
            <div className="space-y-3">
              {data.recentInterviews.map((interview: any) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{interview.jobTitle}</h4>
                    <p className="text-sm text-gray-600">{interview.companyName} • {new Date(interview.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {interview.score && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{interview.score}</p>
                        <p className="text-xs text-gray-600">Score</p>
                      </div>
                    )}
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        interview.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : interview.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {interview.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No interviews yet</p>
              <p className="text-gray-400 text-sm">Apply to jobs to get started with interviews</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/candidate/profile"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition border border-gray-200 group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">👤</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Update Profile</h3>
            <p className="text-gray-600">Keep your profile up to date with latest skills and experience</p>
            <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1">
              Edit Profile
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            to="/candidate/applications"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition border border-gray-200 group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Applications</h3>
            <p className="text-gray-600">Track all your job applications and their status</p>
            <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1">
              View Applications
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

export default CandidateDashboard;
