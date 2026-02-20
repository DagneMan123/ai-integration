import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { applicationAPI } from '../../utils/api';
import Loading from '../../components/Loading';

const JobCandidates: React.FC = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await applicationAPI.getJobApplications(id!);
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplications();
  }, [id, fetchApplications]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Candidates</h1>

        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {app.candidateId?.firstName} {app.candidateId?.lastName}
                    </h3>
                    <p className="text-gray-600">{app.candidateId?.email}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {app.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No applications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCandidates;
