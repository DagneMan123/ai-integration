import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Zap } from 'lucide-react';
import { apiService } from '../services/apiService';

interface ScoreData {
  averageScore: number;
  totalInterviews: number;
  completedInterviews: number;
  recentScores: Array<{
    id: number;
    jobTitle: string;
    score: number;
    date: string;
  }>;
}

export const AIScoreVisualization: React.FC = () => {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScoreData();
  }, []);

  const fetchScoreData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/dashboard-enhanced/candidate');
      if ((response as any)?.data) {
        setScoreData({
          averageScore: (response as any).data.stats?.averageScore || 0,
          totalInterviews: (response as any).data.stats?.totalInterviews || 0,
          completedInterviews: (response as any).data.stats?.completedInterviews || 0,
          recentScores: (response as any).data.recentInterviews || []
        });
      }
    } catch (err) {
      console.error('Failed to load score data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 40) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!scoreData) {
    return <div className="text-center text-gray-500">No score data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        AI Interview Scores
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Average Score Card */}
        <div className={`rounded-lg p-6 ${getScoreBgColor(scoreData.averageScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Average Score</p>
              <p className={`text-4xl font-bold ${getScoreColor(scoreData.averageScore)}`}>
                {scoreData.averageScore}%
              </p>
            </div>
            <Award className={`w-12 h-12 ${getScoreColor(scoreData.averageScore)}`} />
          </div>
        </div>

        {/* Completed Interviews Card */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Completed Interviews</p>
              <p className="text-4xl font-bold text-blue-600">
                {scoreData.completedInterviews}
              </p>
            </div>
            <Zap className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Total Interviews Card */}
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Interviews</p>
              <p className="text-4xl font-bold text-purple-600">
                {scoreData.totalInterviews}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Scores */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Interview Scores</h3>
        {scoreData.recentScores.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No interview scores yet</p>
        ) : (
          <div className="space-y-3">
            {scoreData.recentScores.map((score) => (
              <div key={score.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{score.jobTitle}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(score.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        score.score >= 80 ? 'bg-green-600' :
                        score.score >= 60 ? 'bg-blue-600' :
                        score.score >= 40 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${score.score}%` }}
                    ></div>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(score.score)}`}>
                    {score.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
