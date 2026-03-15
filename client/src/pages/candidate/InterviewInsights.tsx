import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, BarChart3, Loader, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import api from '../../utils/api';

interface InterviewResult {
  id: string;
  jobTitle: string;
  companyName: string;
  date: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  status: 'completed' | 'pending';
}

const InterviewInsights: React.FC = () => {
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    fetchInterviewResults();
  }, []);

  const fetchInterviewResults = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the interviewAPI from api.ts which handles the base URL correctly
      const response = await api.get('/interviews/results');
      setResults(response.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch interview results');
      console.error('Error fetching interview results:', err);
      // Show empty state instead of error if no data
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  const completedInterviews = results.filter(r => r.status === 'completed').length;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Star className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Interview Insights</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Average Score</p>
                    <p className="text-3xl font-bold text-gray-900">{averageScore}%</p>
                  </div>
                  <BarChart3 className="text-blue-600" size={32} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Completed Interviews</p>
                    <p className="text-3xl font-bold text-gray-900">{completedInterviews}</p>
                  </div>
                  <TrendingUp className="text-green-600" size={32} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Interviews</p>
                    <p className="text-3xl font-bold text-gray-900">{results.length}</p>
                  </div>
                  <Star className="text-yellow-600" size={32} />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Results List */}
              <div className="lg:col-span-2 space-y-3">
                {results.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    <Star size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No interview results yet</p>
                  </div>
                ) : (
                  results.map(result => (
                    <div
                      key={result.id}
                      onClick={() => setSelectedResult(result)}
                      className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition ${
                        selectedResult?.id === result.id ? 'ring-2 ring-blue-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{result.jobTitle}</h3>
                          <p className="text-sm text-gray-600">{result.companyName}</p>
                          <p className="text-xs text-gray-500 mt-1">{result.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{result.score}%</div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Details Panel */}
              <div className="bg-white rounded-lg shadow p-6">
                {selectedResult ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedResult.jobTitle}</h3>
                      <p className="text-sm text-gray-600">{selectedResult.companyName}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">Overall Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${selectedResult.score}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900">{selectedResult.score}%</span>
                      </div>
                    </div>

                    {selectedResult.strengths.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {selectedResult.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedResult.improvements.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-orange-700 mb-2">Areas to Improve</h4>
                        <ul className="space-y-1">
                          {selectedResult.improvements.map((improvement, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-orange-600 mt-1">→</span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedResult.feedback && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Feedback</h4>
                        <p className="text-sm text-gray-700">{selectedResult.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Star size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select an interview to view details</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InterviewInsights;
