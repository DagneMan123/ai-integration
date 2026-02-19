import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import AntiCheatMonitor from '../../components/AntiCheatMonitor';
import WebcamVerification from '../../components/WebcamVerification';
import toast from 'react-hot-toast';
import { FiClock, FiAlertCircle, FiMic, FiVideo, FiType } from 'react-icons/fi';

const EnhancedInterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    fetchInterview();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && isVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isVerified && interview) {
      // Auto-submit when time runs out
      handleAutoSubmit();
    }
  }, [timeLeft, isVerified]);

  const fetchInterview = async () => {
    try {
      const response = await interviewAPI.getInterviewReport(id!);
      const data = response.data.data.interview;
      setInterview(data);
      
      if (data.questions && data.responses) {
        const nextIndex = data.responses.length;
        if (nextIndex < data.questions.length) {
          setCurrentQuestion(data.questions[nextIndex]);
          setTimeLeft(3600); // 60 minutes default
          setQuestionStartTime(Date.now());
        } else {
          // All questions answered
          navigate(`/candidate/interview/${id}/report`);
        }
      } else if (data.questions) {
        setCurrentQuestion(data.questions[0]);
        setTimeLeft(3600);
        setQuestionStartTime(Date.now());
      }
    } catch (error) {
      toast.error('Failed to load interview');
      navigate('/candidate/interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = () => {
    setIsVerified(true);
    setShowVerification(false);
    toast.success('You can now start the interview');
  };

  const handleAutoSubmit = async () => {
    if (!answer.trim()) {
      toast.error('Time is up! Submitting empty answer.');
    }
    await handleSubmitAnswer();
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() && timeLeft > 0) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
      const currentIndex = interview.responses?.length || 0;

      const response = await interviewAPI.submitAnswer(id!, {
        questionIndex: currentIndex,
        answer,
        timeTaken,
        audioTranscript: null, // For text mode
        audioDuration: null
      });

      const { nextQuestion, isLastQuestion, integrityWarning } = response.data.data;

      if (integrityWarning) {
        toast.error(`Integrity Warning: ${integrityWarning}`);
      }

      if (isLastQuestion) {
        // Complete interview
        await interviewAPI.completeInterview(id!);
        toast.success('Interview completed!');
        navigate(`/candidate/interview/${id}/report`);
      } else {
        // Move to next question
        setAnswer('');
        setCurrentQuestion(nextQuestion);
        setQuestionStartTime(Date.now());
        toast.success('Answer submitted successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViolation = (type: string) => {
    // Handle violations - could show warnings or take action
    console.log('Violation detected:', type);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInterviewModeIcon = () => {
    switch (interview?.interviewMode) {
      case 'audio':
        return <FiMic className="text-primary" />;
      case 'video':
        return <FiVideo className="text-primary" />;
      default:
        return <FiType className="text-primary" />;
    }
  };

  if (loading) return <Loading />;

  // Show verification screen first
  if (showVerification && !isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification Required</h1>
            <p className="text-gray-600">
              Before starting the interview, we need to verify your identity using your webcam.
            </p>
          </div>
          
          <WebcamVerification
            interviewId={id!}
            onVerified={handleVerified}
            autoCapture={true}
            captureInterval={300000} // 5 minutes
          />

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-yellow-600 mt-1 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">Interview Guidelines:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure good lighting and clear visibility of your face</li>
                  <li>Do not switch tabs or leave the interview window</li>
                  <li>Copy-paste is disabled for integrity purposes</li>
                  <li>Your session is being monitored for fairness</li>
                  <li>Periodic identity verification will occur during the interview</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <AntiCheatMonitor interviewId={id!} onViolation={handleViolation} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getInterviewModeIcon()}
                <h1 className="text-2xl font-bold text-gray-900">
                  {interview?.interviewMode === 'audio' ? 'Audio Interview' : 
                   interview?.interviewMode === 'video' ? 'Video Interview' : 'Text Interview'}
                </h1>
              </div>
              <p className="text-gray-600">
                Question {(interview?.responses?.length || 0) + 1} of {interview?.questions?.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Strictness: <span className="font-medium capitalize">{interview?.strictnessLevel || 'moderate'}</span>
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
                {currentQuestion.type || 'Technical'}
              </span>
              {currentQuestion.difficulty && (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-4 ml-2">
                  {currentQuestion.difficulty}
                </span>
              )}
              {currentQuestion.reason && (
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-4 ml-2">
                  Follow-up Question
                </span>
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentQuestion.question}
            </h2>
            
            {currentQuestion.reason && (
              <p className="text-sm text-gray-600 mb-6 italic">
                {currentQuestion.reason}
              </p>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Type your answer here... Be specific and provide examples where possible."
                disabled={submitting}
              />
              <p className="text-sm text-gray-500 mt-2">
                {answer.length} characters
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 
                 (interview?.responses?.length || 0) + 1 >= interview?.questions?.length ? 
                 'Submit & Complete Interview' : 'Submit & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <FiAlertCircle className="text-yellow-600 mt-1 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Active Monitoring:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tab switches and window changes are being tracked</li>
              <li>Copy-paste attempts will be flagged</li>
              <li>AI-generated content detection is active</li>
              <li>Answer all questions honestly and in your own words</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInterviewSession;
