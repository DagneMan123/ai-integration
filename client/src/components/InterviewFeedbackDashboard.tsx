import React, { useState } from 'react';
import { Download, RotateCcw, Home, TrendingUp, MessageSquare, Lightbulb, Volume2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackData {
  responseId: number;
  questionText: string;
  videoUrl: string;
  transcript: string;
  scores: {
    clarity: number;
    technicalKnowledge: number;
    confidence: number;
    communication: number;
    relevance: number;
    overall: number;
  };
  strengths: string[];
  improvements: string[];
  observations: string[];
  fillerWords: {
    total: number;
    byWord: Record<string, number>;
    frequency: string;
  };
  speechPatterns: {
    totalWords: number;
    totalSentences: number;
    averageWordsPerSentence: string;
    uniqueWords: number;
    vocabularyDiversity: string;
    complexity: string;
  };
  feedback: string;
  analyzedAt: string;
}

interface InterviewFeedbackDashboardProps {
  feedback: FeedbackData;
  onRetry: () => void;
  onHome: () => void;
  showRetryButton?: boolean;
}

const InterviewFeedbackDashboard: React.FC<InterviewFeedbackDashboardProps> = ({
  feedback,
  onRetry,
  onHome,
  showRetryButton = true
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'video'>('overview');

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

  const downloadReport = () => {
    const report = `
INTERVIEW FEEDBACK REPORT
========================

Question: ${feedback.questionText}

OVERALL SCORE: ${feedback.scores.overall}/100

DETAILED SCORES:
- Clarity: ${feedback.scores.clarity}/100
- Technical Knowledge: ${feedback.scores.technicalKnowledge}/100
- Confidence: ${feedback.scores.confidence}/100
- Communication: ${feedback.scores.communication}/100
- Relevance: ${feedback.scores.relevance}/100

STRENGTHS:
${feedback.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${feedback.improvements.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

OBSERVATIONS:
${feedback.observations.map((o, i) => `${i + 1}. ${o}`).join('\n')}

SPEECH ANALYSIS:
- Total Words: ${feedback.speechPatterns.totalWords}
- Total Sentences: ${feedback.speechPatterns.totalSentences}
- Average Words per Sentence: ${feedback.speechPatterns.averageWordsPerSentence}
- Vocabulary Diversity: ${feedback.speechPatterns.vocabularyDiversity}
- Complexity: ${feedback.speechPatterns.complexity}

FILLER WORDS:
- Total: ${feedback.fillerWords.total}
- Frequency: ${feedback.fillerWords.frequency}%
${Object.entries(feedback.fillerWords.byWord)
  .filter(([_, count]) => count > 0)
  .map(([word, count]) => `- "${word}": ${count} times`)
  .join('\n')}

AI FEEDBACK:
${feedback.feedback}

TRANSCRIPT:
${feedback.transcript}

Generated: ${new Date(feedback.analyzedAt).toLocaleString()}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `interview_feedback_${feedback.responseId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Your Interview Feedback</h1>
          <p className="text-gray-600 font-medium">Detailed AI analysis of your performance</p>
        </div>

        {/* Overall Score Card */}
        <div className={`rounded-2xl p-8 border-2 mb-8 ${getScoreBgColor(feedback.scores.overall)}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600 font-medium mb-2">Overall Performance</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-6xl font-black ${getScoreColor(feedback.scores.overall)}`}>
                  {feedback.scores.overall}
                </span>
                <span className="text-2xl text-gray-400">/100</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600 font-medium mb-2">Performance Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {feedback.scores.overall >= 85 ? 'Excellent' :
                 feedback.scores.overall >= 70 ? 'Good' :
                 feedback.scores.overall >= 60 ? 'Fair' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                feedback.scores.overall >= 85 ? 'bg-emerald-600' :
                feedback.scores.overall >= 70 ? 'bg-blue-600' :
                feedback.scores.overall >= 60 ? 'bg-amber-600' :
                'bg-red-600'
              }`}
              style={{ width: `${feedback.scores.overall}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'video'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Video Replay
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-6 py-3 font-bold border-b-2 transition-all ${
              activeTab === 'transcript'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Transcript
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Detailed Scores */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Scores</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Clarity', score: feedback.scores.clarity },
                  { label: 'Technical Knowledge', score: feedback.scores.technicalKnowledge },
                  { label: 'Confidence', score: feedback.scores.confidence },
                  { label: 'Communication', score: feedback.scores.communication },
                  { label: 'Relevance', score: feedback.scores.relevance }
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
            </div>

            {/* AI Feedback */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
              <div className="flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">AI Feedback</h3>
                  <p className="text-gray-700 leading-relaxed">{feedback.feedback}</p>
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Strengths */}
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {feedback.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-bold text-gray-900">Areas for Improvement</h3>
                </div>
                <ul className="space-y-3">
                  {feedback.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Observations */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Key Observations</h3>
              </div>
              <ul className="space-y-3">
                {feedback.observations.map((observation, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{observation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Speech Analysis */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Filler Words */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Volume2 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Filler Words Analysis</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Filler Words</p>
                    <p className="text-3xl font-black text-blue-600">{feedback.fillerWords.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Frequency</p>
                    <p className="text-lg font-bold text-gray-900">{feedback.fillerWords.frequency}%</p>
                  </div>
                  {Object.entries(feedback.fillerWords.byWord)
                    .filter(([_, count]) => count > 0)
                    .map(([word, count]) => (
                      <div key={word} className="flex justify-between items-center">
                        <span className="text-gray-700">"{word}"</span>
                        <span className="font-bold text-gray-900">{count}x</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Speech Patterns */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Speech Patterns</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Words</span>
                    <span className="font-bold text-gray-900">{feedback.speechPatterns.totalWords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sentences</span>
                    <span className="font-bold text-gray-900">{feedback.speechPatterns.totalSentences}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Words/Sentence</span>
                    <span className="font-bold text-gray-900">{feedback.speechPatterns.averageWordsPerSentence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique Words</span>
                    <span className="font-bold text-gray-900">{feedback.speechPatterns.uniqueWords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vocabulary Diversity</span>
                    <span className="font-bold text-gray-900">{feedback.speechPatterns.vocabularyDiversity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complexity</span>
                    <span className="font-bold text-gray-900">{feedback.speechPatterns.complexity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Replay</h2>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-6">
              <video
                src={feedback.videoUrl}
                controls
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-gray-600">
              Watch your interview response to see your body language, facial expressions, and overall presentation.
            </p>
          </div>
        )}

        {/* Transcript Tab */}
        {activeTab === 'transcript' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Full Transcript</h2>
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.transcript}</p>
            </div>
            <p className="text-sm text-gray-600">
              This is the AI-generated transcript of your response. Review it to see how your words were interpreted.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-12 mt-12 border-t border-gray-200">
          <button
            onClick={onHome}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={downloadReport}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
          {showRetryButton && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Try Another Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewFeedbackDashboard;
