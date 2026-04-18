import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AIVideoInterview from './AIVideoInterview';

interface Question {
  id: number;
  text: string;
  type: 'technical' | 'behavioral' | 'situational';
  difficulty: 'junior' | 'mid' | 'senior';
}

interface SequentialVideoInterviewProps {
  interviewId: number;
  jobTitle: string;
  totalDuration: number; // in minutes
  onComplete: (responses: any[]) => void;
  onCancel: () => void;
}

// Specialized technical questions for Senior Full Stack role
const SENIOR_FULLSTACK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Describe your experience with microservices architecture. How would you design a scalable system for handling 1 million concurrent users?',
    type: 'technical',
    difficulty: 'senior'
  },
  {
    id: 2,
    text: 'Walk us through your approach to implementing CI/CD pipelines. What tools have you used and what were the key challenges?',
    type: 'technical',
    difficulty: 'senior'
  },
  {
    id: 3,
    text: 'Tell us about a time when you had to optimize a slow database query. What was your debugging process and what was the outcome?',
    type: 'technical',
    difficulty: 'senior'
  },
  {
    id: 4,
    text: 'How do you approach code reviews and mentoring junior developers? Share an example of how you improved team code quality.',
    type: 'behavioral',
    difficulty: 'senior'
  },
  {
    id: 5,
    text: 'Describe a complex technical decision you made in your last role. How did you evaluate trade-offs and communicate your decision to stakeholders?',
    type: 'situational',
    difficulty: 'senior'
  }
];

interface Response {
  questionId: number;
  questionText: string;
  videoUrl: string;
  recordingTime: number;
  timestamp: Date;
  score?: number;
}

const SequentialVideoInterview: React.FC<SequentialVideoInterviewProps> = ({
  interviewId,
  jobTitle,
  totalDuration,
  onComplete,
  onCancel
}) => {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [timeLeft, setTimeLeft] = useState(totalDuration * 60); // in seconds
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  const questions = SENIOR_FULLSTACK_QUESTIONS;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Timer effect - auto-submit when time runs out
  useEffect(() => {
    if (!isSessionActive || timeLeft <= 0) {
      if (timeLeft <= 0 && isSessionActive) {
        handleAutoSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsSessionActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive, timeLeft]);

  // Auto-submit when timer reaches zero
  const handleAutoSubmit = useCallback(async () => {
    if (isAutoSubmitting) return;
    
    setIsAutoSubmitting(true);
    toast.loading('Time\'s up! Saving your responses...');

    try {
      // Submit all responses to backend
      await submitAllResponses();
      
      toast.dismiss();
      toast.success('Interview completed! All responses saved.');
      setIsSessionActive(false);
      
      // Call onComplete after a short delay
      setTimeout(() => {
        onComplete(responses);
      }, 1500);
    } catch (error) {
      console.error('Error auto-submitting:', error);
      toast.error('Error saving responses. Please try again.');
      setIsAutoSubmitting(false);
    }
  }, [responses, isAutoSubmitting]);

  // Submit all responses to backend
  const submitAllResponses = async () => {
    try {
      // This would call your backend API to save all responses
      // For now, we'll just log them
      console.log('Submitting all responses:', responses);
      
      // You can add API call here:
      // await interviewAPI.submitAllResponses(interviewId, responses);
    } catch (error) {
      console.error('Error submitting responses:', error);
      throw error;
    }
  };

  // Handle video response submission
  const handleVideoSubmit = async (videoBlob: Blob) => {
    try {
      // Create response object
      const newResponse: Response = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        videoUrl: URL.createObjectURL(videoBlob), // Temporary URL
        recordingTime: 0, // This would be set from the video component
        timestamp: new Date()
      };

      // Add to responses
      setResponses([...responses, newResponse]);

      // Move to next question or complete
      if (isLastQuestion) {
        // Last question - submit all responses
        toast.success('All questions answered! Submitting...');
        await submitAllResponses();
        setIsSessionActive(false);
        
        setTimeout(() => {
          onComplete([...responses, newResponse]);
        }, 1500);
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        toast.success(`Question ${currentQuestionIndex + 1} of ${questions.length} completed!`);
      }
    } catch (error) {
      console.error('Error handling video submit:', error);
      toast.error('Error saving response. Please try again.');
    }
  };

  // Handle skip question
  const handleSkipQuestion = () => {
    if (isLastQuestion) {
      // Last question - submit all responses
      toast.success('Submitting your responses...');
      submitAllResponses();
      setIsSessionActive(false);
      
      setTimeout(() => {
        onComplete(responses);
      }, 1500);
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      toast.success(`Skipped question ${currentQuestionIndex + 1}. Moving to next...`);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Time warning threshold
  const timeWarning = timeLeft < 300; // Less than 5 minutes
  const timeCritical = timeLeft < 60; // Less than 1 minute

  if (!isSessionActive && responses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Ended</h2>
          <p className="text-slate-600 mb-6">No responses were recorded. Please try again.</p>
          <button
            onClick={onCancel}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header with Progress and Timer */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Progress Info */}
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  {jobTitle} Interview
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border-2 transition-all ${
              timeCritical 
                ? 'bg-red-900/30 border-red-500 animate-pulse' 
                : timeWarning 
                ? 'bg-yellow-900/30 border-yellow-500' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              <Clock className={`w-5 h-5 ${
                timeCritical 
                  ? 'text-red-500' 
                  : timeWarning 
                  ? 'text-yellow-500' 
                  : 'text-blue-400'
              }`} />
              <span className={`text-lg font-black tabular-nums ${
                timeCritical 
                  ? 'text-red-500' 
                  : timeWarning 
                  ? 'text-yellow-500' 
                  : 'text-white'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Progress</span>
              <span className="font-bold text-slate-300">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Question Counter Badge */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/50 rounded-full px-4 py-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              {responses.length} of {questions.length} completed
            </span>
          </div>
          
          {isLastQuestion && (
            <div className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/50 rounded-full px-4 py-2">
              <span className="text-sm font-semibold text-emerald-300">
                Final Question
              </span>
            </div>
          )}
        </div>

        {/* Video Interview Component */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <AIVideoInterview
            interviewId={interviewId}
            questionId={currentQuestion.id}
            question={currentQuestion.text}
            onComplete={handleVideoSubmit}
            onSkip={handleSkipQuestion}
          />
        </div>

        {/* Navigation Info */}
        <div className="mt-8 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-700 px-3 py-1 rounded-full">
              {currentQuestion.type.toUpperCase()}
            </span>
            <span className="text-xs bg-slate-700 px-3 py-1 rounded-full">
              {currentQuestion.difficulty.toUpperCase()}
            </span>
          </div>
          
          {!isLastQuestion && (
            <div className="flex items-center gap-2 text-slate-300">
              <span>Next: Question {currentQuestionIndex + 2}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Time Warning Alert */}
      {timeWarning && !timeCritical && (
        <div className="fixed bottom-6 right-6 bg-yellow-900/90 border border-yellow-500 rounded-xl p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-200">Time Running Out</p>
              <p className="text-sm text-yellow-100 mt-1">
                Less than 5 minutes remaining. Complete your responses soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Critical Time Alert */}
      {timeCritical && (
        <div className="fixed bottom-6 right-6 bg-red-900/90 border border-red-500 rounded-xl p-4 max-w-sm animate-pulse">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-200">CRITICAL: Time Almost Up!</p>
              <p className="text-sm text-red-100 mt-1">
                Less than 1 minute remaining. Your responses will be auto-submitted when time expires.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      <div className="fixed bottom-6 left-6">
        <button
          onClick={onCancel}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default SequentialVideoInterview;
