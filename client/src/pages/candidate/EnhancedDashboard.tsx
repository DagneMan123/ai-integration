import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, FileText, CheckCircle, AlertCircle, Clock, Award, BarChart3, Target, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardDataService } from '../../services/dashboardDataService';
import Loading from '../../components/Loading';

interface AIScore {
  id: string;
  jobTitle: string;
  company: string;
  score: number;
  status: 'passed' | 'pending' | 'failed' | 'incomplete';
  date: string;
  isIncomplete?: boolean;
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  appliedDate: string;
  aiScore?: number;
}

interface DashboardStats {
  totalApplications: number;
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
}

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [aiScores, setAIScores] = useState<AIScore[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format date safely
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Validate date is reasonable (not epoch, not in far future)
      if (date.getTime() <= 0 || date.getFullYear() < 2020) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch candidate dashboard data
        const dashboardData = await dashboardDataService.getCandidateDashboard();
        
        // Extract AI scores from interviews
        if (dashboardData?.data?.interviews) {
          const aiScoresData = dashboardData.data.interviews.map((interview: any) => ({
            id: interview.id,
            jobTitle: interview.jobTitle || 'Unknown Position',
            company: interview.companyName || 'Unknown Company',
            score: Math.max(0, Math.min(100, interview.score || 0)), // Clamp between 0-100
            status: interview.status || 'pending',
            date: formatDate(interview.date),
            isIncomplete: interview.isIncomplete || false
          }));
          setAIScores(aiScoresData);
        }

        // Fetch applications
        const applicationsData = await dashboardDataService.getCandidateApplications();
        if (applicationsData?.data) {
          const appsData = applicationsData.data.map((app: any) => ({
            id: app.id,
            jobTitle: app.jobTitle || app.job?.title || 'Unknown Position',
            company: app.companyName || app.job?.company?.name || 'Unknown Company',
            status: (app.status?.toLowerCase() || 'applied') as any,
            appliedDate: formatDate(app.appliedAt || app.appliedDate),
            aiScore: app.aiScore
          }));
          setApplications(appsData);
        }

        // Set stats from dashboard data
        if (dashboardData?.data?.stats) {
          setStats({
            totalApplications: dashboardData.data.stats.totalApplications || 0,
            totalInterviews: dashboardData.data.stats.totalInterviews || 0,
            completedInterviews: dashboardData.data.stats.completedInterviews || 0,
            averageScore: dashboardData.data.stats.averageScore || 0
          });
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'incomplete':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'pending':
      case 'reviewing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'interview':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'accepted':
        return <CheckCircle size={16} />;
      case 'incomplete':
        return <AlertCircle size={16} />;
      case 'pending':
      case 'reviewing':
        return <Clock size={16} />;
      case 'failed':
      case 'rejected':
        return <AlertCircle size={16} />;
      case 'interview':
        return <Target size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'incomplete') return 'Incomplete';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <TrendingUp size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Enhanced Dashboard</h1>
              <p className="text-slate-400 text-lg">AI Scores & Application Insights</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Score */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">Average AI Score</span>
              <Zap size={20} className="text-yellow-400" />
            </div>
            <p className="text-4xl font-black text-white mb-2">{stats.averageScore}%</p>
            <p className="text-slate-500 text-sm">Based on {stats.completedInterviews} completed assessments</p>
          </div>

          {/* Total Applications */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">Total Applications</span>
              <Briefcase size={20} className="text-purple-400" />
            </div>
            <p className="text-4xl font-black text-white mb-2">{stats.totalApplications}</p>
            <p className="text-slate-500 text-sm">Active applications</p>
          </div>

          {/* Total Interviews */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-700 hover:border-green-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">Total Interviews</span>
              <Target size={20} className="text-green-400" />
            </div>
            <p className="text-4xl font-black text-white mb-2">{stats.totalInterviews}</p>
            <p className="text-slate-500 text-sm">All interview sessions</p>
          </div>

          {/* Completed Interviews */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-700 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">Completed</span>
              <Award size={20} className="text-emerald-400" />
            </div>
            <p className="text-4xl font-black text-white mb-2">{stats.completedInterviews}</p>
            <p className="text-slate-500 text-sm">Finished assessments</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Assessment Scores */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
                <Zap size={24} className="text-white" />
                <h2 className="text-xl font-bold text-white">AI Assessment Scores</h2>
              </div>

              {/* Table */}
              {aiScores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Position</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Company</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Score</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiScores.map((score) => (
                        <tr key={score.id} className="border-b border-slate-600 hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-white">{score.jobTitle}</td>
                          <td className="px-6 py-4 text-sm text-slate-300">{score.company}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-600 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                                  style={{ width: `${score.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-white">{score.score}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(score.status)}`}>
                              {getStatusIcon(score.status)}
                              {getStatusLabel(score.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">{score.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-slate-400">No AI assessment scores yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Applications Summary */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-400" />
                Recent Applications
              </h3>
              {applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
                      <p className="text-sm font-semibold text-white">{app.jobTitle}</p>
                      <p className="text-xs text-slate-400 mb-2">{app.company}</p>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {getStatusLabel(app.status)}
                        </span>
                        {app.aiScore && (
                          <span className="text-xs font-bold text-blue-400">{app.aiScore}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No applications yet</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/candidate/applications')}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                View All Applications
              </button>
              <button
                onClick={() => navigate('/candidate/interviews')}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all border border-slate-600 hover:border-slate-500"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
