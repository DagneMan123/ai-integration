import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { interviewAPI } from '../../utils/api';
import { Interview } from '../../types';
import Loading from '../../components/Loading';
import { FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const CandidateInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await interviewAPI.getCandidateInterviews();
      setInterviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch interviews', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-green-600" />;
      case 'in_progress':
        return <FiClock className="text-yellow-600" />;
      default:
        return <FiAlertCircle className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Interviews</h1>

        <div className="space-y-4">
          {interviews.length > 0 ? (
            interviews.map((interview) => (
              <div key={interview._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {typeof interview.jobId === 'object' ? interview.jobId.title : 'Interview'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Started: {new Date(interview.startedAt || interview.createdAt).toLocaleDateString()}</span>
                      {interview.completedAt && (
                        <span>Completed: {new Date(interview.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(interview.status)}
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                      {interview.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {interview.status === 'completed' && interview.aiEvaluation && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-700 mb-1">Overall Score</p>
                        <p className="text-3xl font-bold text-primary">
                          {interview.aiEvaluation.overallScore}/100
                        </p>
                      </div>
                      <Link
                        to={`/candidate/interview/${interview._id}/report`}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
                      >
                        View Full Report
                      </Link>
                    </div>
                  </div>
                )}

                {interview.status === 'in_progress' && (
                  <Link
                    to={`/candidate/interview/${interview._id}`}
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
                  >
                    Continue Interview
                  </Link>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg mb-4">No interviews yet</p>
              <Link to="/candidate/applications" className="text-primary hover:text-primary-dark font-medium">
                View your applications →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviews;
