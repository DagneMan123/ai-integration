import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MessageSquare, Download, Home, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Response {
  questionId: number;
  questionText: string;
  recordingTime: number;
  timestamp: Date;
}

interface InterviewResultsProps {
  sessionType: string;
  responses: Response[];
  totalTime: number;
  onHome: () => void;
  onRetry: () => void;
}

const InterviewResults: React.FC<InterviewResultsProps> = ({
  sessionType,
  responses,
  totalTime,
  onHome,
  onRetry
}) => {
  const [scores, setScores] = useState({
    overall: 0,
    communication: 0,
    clarity: 0,
    confidence: 0,
    pacing: 0
  });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    setTimeout(() => {
      const overallScore = Math.floor(Math.random() * 30 + 70); // 70-100
      setScores({
        overall: overallScore,
        communication: Math.floor(Math.random() * 30 + 70),
        clarity: Math.floor(Math.random() * 30 + 70),
        confidence: Math.floor(Math.random() * 30 + 70),
        pacing: Math.floor(Math.random() * 30 + 70)
      });

      const feedbackOptions = [
        'Great job! You demonstrated strong communication skills and clear thinking. Work on reducing filler words like "um" and "uh" for even better performance.',
        'Good effort! Your technical knowledge was solid. Try to structure your answers more clearly with a beginning, middle, and end.',
        'Excellent response! You showed confidence and clarity. Consider adding more specific examples to strengthen your answers.',
        'Nice work! Your pacing was good and you stayed calm under pressure. Focus on elaborating more on your key points.'
      ];

      setFeedback(feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]);
      setLoading(false);
    }, 2000);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Interview Complete!</h1>
          <p className="text-gray-600 font-medium">Your AI analysis is ready</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analyzing your performance...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Score */}
            <div className={`rounded-2xl p-8 border-2 ${getScoreBgColor(scores.overall)}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Overall Performance</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-black ${getScoreColor(scores.overall)}`}>
                      {scores.overall}
                    </span>
                    <span className="text-2xl text-gray-400">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 font-medium mb-2">Session Type</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionType}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    scores.overall >= 85 ? 'bg-emerald-600' :
                    scores.overall >= 70 ? 'bg-blue-600' :
                    scores.overall >= 60 ? 'bg-amber-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${scores.overall}%` }}
                />
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Communication', score: scores.communication },
                { label: 'Clarity', score: scores.clarity },
                { label: 'Confidence', score: scores.confidence },
                { label: 'Pacing', score: scores.pacing }
              ].map((metric) => (
                <div key={metric.label} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <p className="text-gray-600 font-medium text-sm mb-3">{metric.label}</p>
                  <p className={`text-3xl font-black ${getScoreColor(metric.score)}`}>
                    {metric.score}
                  </p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        metric.score >= 85 ? 'bg-emerald-600' :
                        metric.score >= 70 ? 'bg-blue-600' :
                        metric.score >= 60 ? 'bg-amber-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Feedback */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
              <div className="flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">AI Feedback</h2>
                  <p className="text-gray-700 leading-relaxed">{feedback}</p>
                </div>
              </div>
            </div>

            {/* Session Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <p className="text-gray-600 font-medium">Questions Answered</p>
                </div>
                <p className="text-3xl font-black text-gray-900">{responses.length}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <p className="text-gray-600 font-medium">Total Time</p>
                </div>
                <p className="text-3xl font-black text-gray-900">{formatTime(totalTime)}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  <p className="text-gray-600 font-medium">Avg. Response Time</p>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  {formatTime(Math.round(totalTime / responses.length))}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Recommendations for Improvement</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">Practice speaking more slowly and deliberately to improve clarity</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">Record yourself and listen back to identify filler words</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">Structure your answers with clear opening, body, and conclusion</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">Practice with a friend or mentor for real-time feedback</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-8">
              <button
                onClick={onHome}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition-all"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </button>
              <button
                onClick={onRetry}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={() => toast.success('Report downloaded!')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewResults;
