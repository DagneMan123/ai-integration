import React, { useEffect, useState } from 'react';
import { applicationAPI } from '../../utils/api';
import { Application } from '../../types';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';

const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getCandidateApplications();
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      interviewing: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <Link to="/jobs" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition">
            Browse Jobs
          </Link>
        </div>

        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {typeof app.jobId === 'object' ? app.jobId.title : 'Job Title'}
                    </h3>
                    <p className="text-gray-600">
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                {app.interviewScore && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Interview Score: <span className="font-bold text-primary">{app.interviewScore}/100</span>
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg mb-4">No applications yet</p>
              <Link to="/jobs" className="text-primary hover:text-primary-dark font-medium">
                Browse available jobs →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateApplications;
