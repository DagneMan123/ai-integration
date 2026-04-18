import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Eye, Mail } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Applicant {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  aiScore: number | null;
  technicalScore: number | null;
  communicationScore: number | null;
  interviewStatus: string;
  applicationStatus: string;
}

interface ApplicantsListProps {
  jobId?: number;
}

export const ApplicantsList: React.FC<ApplicantsListProps> = ({ jobId }) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'aiScore' | 'name'>('aiScore');

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      if (jobId) {
        const response = await apiService.get(`/dashboard-enhanced/employer/job/${jobId}/applicants`);
        if ((response as any)?.data?.data) {
          setApplicants((response as any).data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedApplicants = [...applicants].sort((a, b) => {
    if (sortBy === 'aiScore') {
      return (b.aiScore || 0) - (a.aiScore || 0);
    }
    return a.name.localeCompare(b.name);
  });

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Applicants
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('aiScore')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sortBy === 'aiScore'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sort by Score
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sortBy === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sort by Name
          </button>
        </div>
      </div>

      {applicants.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No applicants yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {applicant.profilePicture ? (
                    <img
                      src={applicant.profilePicture}
                      alt={applicant.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{applicant.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {applicant.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* AI Score */}
                  {applicant.aiScore !== null && (
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className={`text-lg font-bold ${getScoreColor(applicant.aiScore)}`}>
                          {applicant.aiScore}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">AI Score</p>
                    </div>
                  )}

                  {/* Technical Score */}
                  {applicant.technicalScore !== null && (
                    <div className="text-center">
                      <p className={`text-lg font-bold ${getScoreColor(applicant.technicalScore)}`}>
                        {applicant.technicalScore}%
                      </p>
                      <p className="text-xs text-gray-600">Technical</p>
                    </div>
                  )}

                  {/* Communication Score */}
                  {applicant.communicationScore !== null && (
                    <div className="text-center">
                      <p className={`text-lg font-bold ${getScoreColor(applicant.communicationScore)}`}>
                        {applicant.communicationScore}%
                      </p>
                      <p className="text-xs text-gray-600">Communication</p>
                    </div>
                  )}

                  {/* Status */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    applicant.interviewStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    applicant.interviewStatus === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {applicant.interviewStatus}
                  </span>

                  {/* View Button */}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
