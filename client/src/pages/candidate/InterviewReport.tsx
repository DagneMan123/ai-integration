import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import { FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const InterviewReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      const response = await interviewAPI.getInterviewReport(id!);
      setReport(response.data.data);
    } catch (error) {
      console.error('Failed to fetch report', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [id, fetchReport]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) return <Loading />;
  if (!report) return <div className="text-center py-12">Report not found</div>;

  const { interview } = report;
  const evaluation = interview.aiEvaluation;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Report</h1>
              <p className="text-gray-600">
                {typeof interview.jobId === 'object' ? interview.jobId.title : 'Interview'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Completed on {new Date(interview.completedAt).toLocaleDateString()}
              </p>
            </div>
            <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition">
              <FiDownload />
              Download PDF
            </button>
          </div>

          {/* Overall Score */}
          <div className={`p-6 rounded-lg ${getScoreBg(evaluation?.overallScore || 0)}`}>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">Overall Score</p>
              <p className={`text-6xl font-bold ${getScoreColor(evaluation?.overallScore || 0)}`}>
                {evaluation?.overallScore || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">out of 100</p>
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        {evaluation && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Breakdown</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Technical Score</span>
                  <span className={`font-bold ${getScoreColor(evaluation.technicalScore)}`}>
                    {evaluation.technicalScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${evaluation.technicalScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Communication</span>
                  <span className={`font-bold ${getScoreColor(evaluation.communicationScore)}`}>
                    {evaluation.communicationScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${evaluation.communicationScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Confidence</span>
                  <span className={`font-bold ${getScoreColor(evaluation.confidenceScore)}`}>
                    {evaluation.confidenceScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${evaluation.confidenceScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Problem Solving</span>
                  <span className={`font-bold ${getScoreColor(evaluation.problemSolvingScore)}`}>
                    {evaluation.problemSolvingScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${evaluation.problemSolvingScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        {evaluation && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiCheckCircle className="text-green-600 text-xl" />
                <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {evaluation.strengths?.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiAlertCircle className="text-yellow-600 text-xl" />
                <h3 className="text-xl font-bold text-gray-900">Areas for Improvement</h3>
              </div>
              <ul className="space-y-2">
                {evaluation.weaknesses?.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recommendation */}
        {evaluation?.recommendation && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">AI Recommendation</h3>
            <p className="text-gray-700 leading-relaxed">{evaluation.recommendation}</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Hiring Decision: <span className="font-bold">{evaluation.hiringDecision?.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/candidate/interviews"
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition text-center"
          >
            Back to Interviews
          </Link>
          <Link
            to="/jobs"
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition text-center"
          >
            Browse More Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;
