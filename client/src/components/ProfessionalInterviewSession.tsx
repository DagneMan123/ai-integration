import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Clock, AlertCircle, CheckCircle2, Zap, MessageCircle, Loader, RotateCcw, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { interviewAPI } from '../utils/api';
import { proctorService } from '../services/proctorService';

interface Message {
  id: string;
  type: 'question' | 'response' | 'feedback';
  sender: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  isAI?: boolean;
}

interface ProfessionalInterviewSessionProps {
  jobTitle: string;
  company: string;
  jobId: string;
  applicationId: string;
  onComplete: (data: { responses: any[]; scores: any[]; overallScore: any }) => void;
  onCancel: () => void;
}

type InterviewPhase = 'INTRO' | 'TECHNICAL' | 'FINISH';

const ProfessionalInterviewSession: React.FC<ProfessionalInterviewSessionProps> = ({
  jobTitle,
  company,
  jobId,
  applicationId,
  onComplete,
  onCancel
}) => {
  // Core interview state
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('INTRO');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300);
  const [responses, setResponses] = useState<any[]>([]);
  const [responseScores, setResponseScores] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Security state
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [lastTextLength, setLastTextLength] = useState(0);
  const [riskScore, setRiskScore] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const riskCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = (currentTurn / 7) * 100;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitResponse();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Initialize interview
  useEffect(() => {
    initializeInterview();

    // Global shortcut lockdown
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === 'v') ||
        (e.metaKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 'Insert') ||
        (e.shiftKey && e.key === 'Insert')
      ) {
        e.preventDefault();
        e.stopPropagation();
        setCheatingDetected(true);
        toast.error('🚨 PASTE DETECTED - Interview Terminated');
        setTimeout(() => handleTerminateInterview('PASTE_ATTEMPT'), 2000);
      }
    };

    // Tab/window focus guard
    const handleWindowBlur = () => {
      setViolationCount(prev => {
        const newCount = prev + 1;
        if (newCount > 3) {
          setCheatingDetected(true);
          toast.error('🚨 EXCESSIVE TAB SWITCHING - Interview Terminated');
          setTimeout(() => handleTerminateInterview('EXCESSIVE_TAB_SWITCHING'), 1000);
        }
        return newCount;
      });
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
      window.removeEventListener('blur', handleWindowBlur);
      if (riskCheckIntervalRef.current) clearInterval(riskCheckIntervalRef.current);
      proctorService.destroy();
    };
  }, []);

  const initializeInterview = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      const response = await interviewAPI.start({
        jobId: parseInt(jobId),
        applicationId: parseInt(applicationId),
        interviewMode: 'text',
        strictnessLevel: 'moderate'
      });

      if (response.data.success) {
        const data = response.data.data as any;
        setInterviewId(data.interviewId);
        proctorService.initialize(data.interviewId);

        // Start with intro question
        const introQuestion = `ሰላም! (Selam - Hello!) Welcome to our professional interview.

Please provide a professional introduction about yourself in English. Include:
1. Your name and current role
2. Your professional background (2-3 years of experience)
3. Your key skills relevant to this position
4. Why you're interested in this opportunity

Take your time and speak clearly.`;

        const questionMessage: Message = {
          id: `q-1`,
          type: 'question',
          sender: 'interviewer',
          content: introQuestion,
          timestamp: new Date(),
          isAI: true
        };

        setMessages([questionMessage]);
        setCurrentTurn(1);
        setCurrentPhase('INTRO');
        setTimeLeft(300);
      }
    } catch (err: any) {
      console.error('Error initializing interview:', err);
      setError(err.response?.data?.message || 'Failed to initialize interview');
      toast.error('Failed to start interview');
    } finally {
      setIsInitializing(false);
    }
  };

  // SECURITY: Multi-level paste block
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCheatingDetected(true);
    toast.error('🚨 PASTE BLOCKED - Unauthorized Input');
    setTimeout(() => handleTerminateInterview('PASTE_ATTEMPT'), 2000);
    return false;
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCheatingDetected(true);
    toast.error('🚨 DRAG & DROP BLOCKED');
    setTimeout(() => handleTerminateInterview('DRAG_DROP_ATTEMPT'), 2000);
    return false;
  };

  // SECURITY: Sudden text change detection
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newLength = newText.length;
    const lengthDifference = newLength - lastTextLength;

    if (lengthDifference > 50) {
      setCheatingDetected(true);
      setUserResponse('');
      setLastTextLength(0);
      toast.error('🚨 CHEATING DETECTED - Massive text input blocked');
      setTimeout(() => handleTerminateInterview('SUDDEN_TEXT_INCREASE'), 2000);
      return;
    }

    setUserResponse(newText);
    setLastTextLength(newLength);
  };

  const handleTerminateInterview = async (reason: string) => {
    try {
      setIsLoading(true);
      setCheatingDetected(true);

      await interviewAPI.submitAnswer({
        interviewId,
        response: '',
        terminationReason: reason,
        proctorData: proctorService.getSessionReport()
      });

      toast.error(`Interview terminated: ${reason}`);
      setTimeout(() => onCancel(), 3000);
    } catch (err) {
      console.error('Error terminating interview:', err);
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!userResponse.trim()) {
      toast.error('Please provide a response');
      return;
    }

    if (!interviewId) {
      toast.error('Interview not initialized');
      return;
    }

    if (currentPhase === 'INTRO' && userResponse.length < 50) {
      toast.error('Introduction must be at least 50 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Add candidate response to messages
      const responseMessage: Message = {
        id: `r-${currentTurn}`,
        type: 'response',
        sender: 'candidate',
        content: userResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, responseMessage]);

      // Submit response
      const response = await interviewAPI.submitAnswer({
        interviewId,
        response: userResponse,
        turn: currentTurn,
        phase: currentPhase,
        proctorData: proctorService.getSessionReport()
      });

      if (response.data.success) {
        const data = response.data.data as any;

        // Store response
        const newResponse = {
          turn: currentTurn,
          phase: currentPhase,
          response: userResponse,
          score: data.responseScore || 0,
          timestamp: new Date()
        };

        setResponses(prev => [...prev, newResponse]);
        setResponseScores(prev => [...prev, {
          turn: currentTurn,
          score: data.responseScore || 0
        }]);

        // Add score feedback
        const scoreMessage: Message = {
          id: `score-${currentTurn}`,
          type: 'feedback',
          sender: 'interviewer',
          content: `Response Score: ${data.responseScore || 0}/100`,
          timestamp: new Date(),
          isAI: false
        };

        setMessages(prev => [...prev, scoreMessage]);

        // Determine next phase
        let nextTurn = currentTurn + 1;
        let nextPhase: InterviewPhase = currentPhase;
        let nextQuestion = '';
        let isFinished = false;

        if (currentTurn === 1) {
          // Move to technical questions
          nextPhase = 'TECHNICAL';
          nextTurn = 2;
          nextQuestion = getTechnicalQuestion(2, jobTitle);
        } else if (currentTurn >= 2 && currentTurn < 6) {
          // Continue technical questions
          nextPhase = 'TECHNICAL';
          nextTurn = currentTurn + 1;
          nextQuestion = getTechnicalQuestion(nextTurn, jobTitle);
        } else if (currentTurn === 6) {
          // Move to finish
          nextPhase = 'FINISH';
          nextTurn = 7;
          nextQuestion = `Thank you for your responses! Before we conclude, do you have any questions for us about the role, team, or company?`;
        } else if (currentTurn === 7) {
          // Interview complete
          isFinished = true;
        }

        if (!isFinished) {
          const nextQuestionMessage: Message = {
            id: `q-${nextTurn}`,
            type: 'question',
            sender: 'interviewer',
            content: nextQuestion,
            timestamp: new Date(),
            isAI: true
          };

          setMessages(prev => [...prev, nextQuestionMessage]);
          setCurrentTurn(nextTurn);
          setCurrentPhase(nextPhase);
          setTimeLeft(300);
        } else {
          // Interview finished
          const completionMessage: Message = {
            id: `completion`,
            type: 'feedback',
            sender: 'interviewer',
            content: `Interview Complete! Overall Score: ${data.overallScore || 0}/100`,
            timestamp: new Date(),
            isAI: false
          };

          setMessages(prev => [...prev, completionMessage]);

          setTimeout(() => {
            onComplete({
              responses,
              scores: responseScores,
              overallScore: data.overallScore || 0
            });
          }, 2000);
        }

        setUserResponse('');
        setLastTextLength(0);
      }
    } catch (err: any) {
      console.error('Error submitting response:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit response';
      toast.error(errorMsg);
      setMessages(prev => prev.filter(m => m.id !== `r-${currentTurn}`));
    } finally {
      setIsLoading(false);
    }
  };

  const getTechnicalQuestion = (turn: number, jobTitle: string): string => {
    const technicalQuestions: { [key: string]: string[] } = {
      'Senior Full Stack Developer': [
        'Describe your experience with React and Node.js. What are the key differences between class components and functional components with hooks?',
        'Explain your approach to database design. How would you optimize a complex SQL query with multiple joins?',
        'Tell us about a challenging bug you fixed. What was your debugging process and what did you learn?',
        'How do you approach API design? What REST principles do you follow and why?',
        'Describe your experience with deployment and DevOps. How do you ensure code quality before production?'
      ],
      'Frontend Developer': [
        'Explain the component lifecycle in React. How do hooks change the way you manage state and side effects?',
        'How do you optimize frontend performance? What tools do you use to measure and improve it?',
        'Describe your experience with CSS. How do you handle responsive design and cross-browser compatibility?',
        'Tell us about your experience with state management. Why would you choose Redux, Context API, or other solutions?',
        'How do you approach testing in frontend development? What testing frameworks and strategies do you use?'
      ],
      'Backend Developer': [
        'Explain your experience with backend frameworks. How do you structure a scalable API?',
        'Describe your database experience. How do you handle data modeling and relationships?',
        'How do you approach authentication and authorization? What security best practices do you follow?',
        'Tell us about your experience with caching and performance optimization at scale.',
        'How do you handle error handling and logging in production systems?'
      ]
    };

    const questions = technicalQuestions[jobTitle] || technicalQuestions['Senior Full Stack Developer'];
    return questions[turn - 2] || questions[0];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 120) return 'text-green-600';
    if (timeLeft > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Initializing interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Interview Error</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{jobTitle}</h1>
              <p className="text-sm text-slate-400">{company}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {violationCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/50">
                <AlertTriangle className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-sm text-orange-400 font-bold">Violations: {violationCount}/3</span>
              </div>
            )}

            {cheatingDetected && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/50">
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-sm text-red-400 font-medium">Flagged</span>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Phase</p>
              <p className="text-sm font-bold text-blue-400 uppercase">{currentPhase}</p>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Turn</p>
              <p className="text-lg font-bold text-white">{currentTurn}/7</p>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Time</p>
              <p className={`text-lg font-bold ${getTimeColor()}`}>{formatTime(timeLeft)}</p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400 font-medium">Live</span>
            </div>
          </div>
        </div>

        <div className="h-1 bg-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.sender === 'candidate' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      message.sender === 'interviewer' ? 'bg-blue-600' : 'bg-slate-700'
                    }`}>
                      {message.sender === 'interviewer' ? '👔' : '👤'}
                    </div>

                    <div className="flex-1 max-w-md">
                      <div className={`px-4 py-3 rounded-lg ${
                        message.sender === 'interviewer'
                          ? 'bg-slate-700 text-slate-100'
                          : 'bg-blue-600 text-white'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.type === 'feedback' && (
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-700 p-6 bg-slate-800/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-600/50 rounded-lg">
                    <Shield className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                      🔒 SECURE PROCTORING ACTIVE - UNAUTHORIZED INPUT DISABLED
                    </span>
                  </div>

                  {cheatingDetected && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-900/30 border border-red-600 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-red-400">🚨 CHEATING DETECTED</p>
                        <p className="text-xs text-red-300">Interview will be terminated.</p>
                      </div>
                    </div>
                  )}

                  <textarea
                    ref={textareaRef}
                    value={userResponse}
                    onChange={handleTextChange}
                    onPaste={handlePaste}
                    onContextMenu={handleContextMenu}
                    onDrop={handleDrop}
                    placeholder="Type your response here... (Paste disabled)"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    disabled={cheatingDetected}
                  />

                  <button
                    onClick={handleSubmitResponse}
                    disabled={!userResponse.trim() || isLoading || cheatingDetected}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Response
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interview Info */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h4 className="font-bold text-white mb-4">Interview Progress</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Current Phase</p>
                  <p className="text-sm font-bold text-blue-400">{currentPhase}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Turn</p>
                  <p className="text-sm font-bold text-white">{currentTurn} of 7</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Responses Submitted</p>
                  <p className="text-sm font-bold text-white">{responses.length}</p>
                </div>
              </div>
            </div>

            {/* Score Display */}
            {responseScores.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-6">
                <h4 className="font-bold text-emerald-100 mb-4">Scores</h4>
                <div className="space-y-2">
                  {responseScores.map((score, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <p className="text-xs text-slate-400">Turn {score.turn}</p>
                      <p className="text-sm font-bold text-emerald-400">{score.score}/100</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-100 mb-2">Proctoring Rules</h4>
                  <ul className="text-sm text-amber-100/80 space-y-1">
                    <li>✓ Speak clearly and confidently</li>
                    <li>✓ Take your time to think</li>
                    <li>✗ No copy-paste allowed</li>
                    <li>✗ No tab switching</li>
                    <li>✗ No drag & drop</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Exit Button */}
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-all"
            >
              Exit Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInterviewSession;
