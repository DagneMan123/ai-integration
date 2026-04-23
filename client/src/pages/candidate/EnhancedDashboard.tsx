import React, { useState } from 'react';
import { TrendingUp, Zap, FileText, CheckCircle, AlertCircle, Clock, Award, BarChart3, Target, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIScore {
  id: string;
  jobTitle: string;
  company: string;
  score: number;
  status: 'passed' | 'pending' | 'failed';
  date: string;
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  appliedDate: string;
  aiScore?: number;
}

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [aiScores] = useState<AIScore[]>([
    {
      id: '1',
      jobTitle: 'Senior Developer',
      company: 'Tech Corp',
      score: 92,
      status: 'passed',
      date: '2024-04-20'
    },
    {
      id: '2',
      jobTitle: 'Full Stack Engineer',
      company: 'StartUp Inc',
      score: 78,
      status: 'passed',
      date: '2024-04-18'
    },
    {
      id: '3',
      jobTitle: 'Product Manager',
      company: 'Innovation Labs',
      score: 65,
      status: 'pending',
      date: '2024-04-15'
    }
  ]);

  const [applications] = useState<Application[]>([
    {
      id: '1',
      jobTitle: 'Senior Developer',
      company: 'Tech Corp',
      status: 'interview',
      appliedDate: '2024-04-10',
      aiScore: 92
    },
    {
      id: '2',
      jobTitle: 'Full Stack Engineer',
      company: 'StartUp Inc',
      status: 'reviewing',
      appliedDate: '2024-04-12',
      aiScore: 78
    },
    {
      id: '3',
      jobTitle: 'Product Manager',
      company: 'Innovation Labs',
      status: 'applied',
      appliedDate: '2024-04-15',
      aiScore: 65
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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

  const averageScore = Math.round(aiScores.reduce((sum, score) => sum + score.score, 0) / aiScores.length);
  const passedCount = aiScores.filter(s => s.status === 'passed').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;
  const successRate = Math.round((passedCount / aiScores.length) * 100);

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
            <p className="text-4xl font-black text-white mb-2">{averageScore}%</p>
            <p className="text-slate-500 text-sm">Based on {aiScores.length} assessments</p>
          </div>

          {/* Total Applications */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">Total Applications</span>
              <Briefcase size={20} className="text-purple-400" />
            </div>
            <p className="text-4xl font-black text-white mb-2">{applications.length}</p>
            <p className="text-slate-500 text-sm">Active applications</p>
          </div>

          {/* Interviews */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-700 hover:border-green-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">Interviews</span>
              <Target size={20} className="text-green-400" />
            </div>
            <p className="text-4xl font-black text-white mb-2">{interviewCount}</p>
            <p className="text-slate-500 text-sm">Scheduled interviews</p>
          </div>

          {/* Success Rate */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-700 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-semibold">Success Rate</span>
              <Award size={20} className="text-emerald-400" />
            </div>
            <p className="text-4xl font-black text-white mb-2">{successRate}%</p>
            <p className="text-slate-500 text-sm">Passed assessments</p>
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
                            {score.status.charAt(0).toUpperCase() + score.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{score.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Applications Summary */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-400" />
                Applications
              </h3>
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
                    <p className="text-sm font-semibold text-white">{app.jobTitle}</p>
                    <p className="text-xs text-slate-400 mb-2">{app.company}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      {app.aiScore && (
                        <span className="text-xs font-bold text-blue-400">{app.aiScore}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
