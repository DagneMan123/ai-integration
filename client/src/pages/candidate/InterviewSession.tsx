import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchInterview = useCallback(async () => {
    try {
      const response = await interviewAPI.getInterviewReport(id!);
      const data = response.data.data.interview;
      setInterview(data);
      if (data.questions && data.currentQuestionIndex < data.questions.length) {
        setCurrentQuestion(data.questions[data.currentQuestionIndex]);
        setTimeLeft(data.timeLimit * 60);
      }
    } catch (error) {
      toast.error('Failed to load interview');
      navigate('/candidate/interviews');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchInterview();
  }, [id, fetchInterview]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmitting(true);
    try {
      await interviewAPI.submitAnswer(id!, {
        questionIndex: interview.currentQuestionIndex,
        answer,
        timeTaken: (interview.timeLimit * 60) - timeLeft
      });

      if (interview.currentQuestionIndex + 1 >= interview.questions.length) {
        await interviewAPI.completeInterview(id!);
        toast.success('Interview completed!');
        navigate(`/candidate/interview/${id}/report`);
      } else {
        setAnswer('');
        await fetchInterview();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Session</h1>
              <p className="text-gray-600">
                Question {interview?.currentQuestionIndex + 1} of {interview?.questions?.length}
              </p>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FiClock className={timeLeft < 300 ? 'text-red-600' : 'text-primary'} />
              <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-medium mb-4">
                {currentQuestion.type}
              </span>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-4 ml-2">
                {currentQuestion.difficulty}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.text}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Type your answer here..."
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : interview?.currentQuestionIndex + 1 >= interview?.questions?.length ? 'Submit & Complete' : 'Submit & Next'}
              </button>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <FiAlertCircle className="text-yellow-600 mt-1 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Do not switch tabs or leave this page</li>
              <li>Your session is being monitored</li>
              <li>Answer all questions to the best of your ability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
