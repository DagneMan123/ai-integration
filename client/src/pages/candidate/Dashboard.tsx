import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

const CandidateDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getCandidateDashboard();
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
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <Link
            to="/jobs"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Browse Jobs
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
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
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
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
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {data?.averageScore?.toFixed(1) || 'N/A'}
                </h3>
                <p className="text-gray-600">Average Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Interviews</h2>
            <Link to="/candidate/interviews" className="text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {data?.recentInterviews && data.recentInterviews.length > 0 ? (
              data.recentInterviews.map((interview: any) => (
                <div
                  key={interview._id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-600 transition"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{interview.jobId?.title || 'Interview'}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        interview.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {interview.status}
                    </span>
                    {interview.status === 'completed' && (
                      <Link
                        to={`/candidate/interview/${interview._id}/report`}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No interviews yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/candidate/profile"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Update Profile</h3>
            <p className="text-gray-600">Keep your profile up to date</p>
          </Link>

          <Link
            to="/candidate/applications"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Applications</h3>
            <p className="text-gray-600">Track your job applications</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
