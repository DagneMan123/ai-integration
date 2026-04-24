import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, Award, ArrowRight } from 'lucide-react';
import Loading from '../../components/Loading';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../utils/api';

interface InterviewRecord {
  id: string;
  jobTitle: string;
  companyName: string;
  date: string;
  status: 'completed' | 'failed' | 'incomplete';
  score?: number;
  duration: number;
}

const InterviewHistory: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'incomplete'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getCandidateInterviews();
      const data = response.data?.data || [];
      // Map Interview type to InterviewRecord type
      const mapped = data.map((item: any) => ({
        id: item.id,
        jobTitle: item.job?.title || 'Interview',
        companyName: item.job?.company?.name || 'Company',
        date: item.createdAt,
        status: item.status || 'incomplete',
        score: item.overallScore || item.aiEvaluation?.overallScore,
        duration: item.duration || 0
      }));
      setInterviews(mapped);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interview history');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'all') return true;
    return interview.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'failed':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'incomplete':
        return <Clock size={20} className="text-yellow-600" />;
      default:
        return <Clock size={20} className="text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'incomplete':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleViewReport = (interviewId: string) => {
    navigate(`/candidate/interview-report?interviewId=${interviewId}`);
  };

  if (loading) return <Loading />;

  const stats = {
    total: interviews.length,
    completed: interviews.filter(i => i.status === 'completed').length,
    failed: interviews.filter(i => i.status === 'failed').length,
    incomplete: interviews.filter(i => i.status === 'incomplete').length,
    averageScore: interviews.filter(i => i.score).length > 0
      ? Math.round(interviews.filter(i => i.score).reduce((sum, i) => sum + (i.score || 0), 0) / interviews.filter(i => i.score).length)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Interview History</h1>
          <p className="text-slate-600">Review your past interviews and performance</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Interviews</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Clock size={24} className="text-indigo-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Average Score</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.averageScore}%</p>
              </div>
              <Award size={24} className="text-indigo-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Incomplete</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.incomplete}</p>
              </div>
              <TrendingUp size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'completed', 'failed', 'incomplete'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Interview List */}
        {filteredInterviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-slate-200">
            <Clock size={64} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Interviews Found</h2>
            <p className="text-slate-600">You don't have any interviews in this category yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <div key={interview.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(interview.status)}
                      <h3 className="text-lg font-semibold text-slate-900">{interview.jobTitle}</h3>
                    </div>
                    <p className="text-slate-600 mb-2">{interview.companyName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(interview.status)}`}>
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(interview.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{interview.duration} minutes</span>
                  </div>
                  {interview.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <Award size={16} />
                      <span className="font-semibold">{interview.score}%</span>
                    </div>
                  )}
                </div>

                {interview.status === 'completed' && (
                  <button
                    onClick={() => handleViewReport(interview.id)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    View Report
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;
