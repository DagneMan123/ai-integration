import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Zap, Clock, Target, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import InterviewLobby from '../../components/InterviewLobby';
import PracticeInterviewEnvironment from '../../components/PracticeInterviewEnvironment';
import InterviewResults from '../../components/InterviewResults';
import InterviewProcessing from '../../components/InterviewProcessing';
import InterviewFeedbackDashboard from '../../components/InterviewFeedbackDashboard';
import toast from 'react-hot-toast';

type InterviewPhase = 'selection' | 'lobby' | 'interview' | 'processing' | 'feedback' | 'results';

interface Question {
  id: number;
  text: string;
  type: string;
  difficulty: string;
}

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

const Practice: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<InterviewPhase>('selection');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [processingResponseId, setProcessingResponseId] = useState<number | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackData | null>(null);
  const [feedbackIndex, setFeedbackIndex] = useState(0);

  const practiceSessions = [
    {
      id: 1,
      title: 'Technical Interview',
      description: 'Practice coding and technical questions',
      difficulty: 'Intermediate',
      icon: Target,
      color: 'blue',
      duration: 45,
      questionCount: 5,
      benefits: ['Improve problem-solving', 'Learn best practices', 'Build confidence']
    },
    {
      id: 2,
      title: 'Behavioral Interview',
      description: 'Improve your soft skills and communication',
      difficulty: 'Beginner',
      icon: BookOpen,
      color: 'emerald',
      duration: 30,
      questionCount: 4,
      benefits: ['Master storytelling', 'Enhance communication', 'Showcase personality']
    },
    {
      id: 3,
      title: 'Case Study Analysis',
      description: 'Solve real-world business problems',
      difficulty: 'Advanced',
      icon: Lightbulb,
      color: 'amber',
      duration: 60,
      questionCount: 3,
      benefits: ['Strategic thinking', 'Business acumen', 'Analytical skills']
    },
  ];

  const handleStartPractice = async (sessionId: number) => {
    const session = practiceSessions.find(s => s.id === sessionId);
    if (!session) return;

    setSelectedSession(session);
    setDemoMode(false);
    
    // ROUTE HANDLING: Navigate to assessment page with category and difficulty as URL parameters
    const category = session.title.includes('Technical') ? 'Technical' :
                     session.title.includes('Behavioral') ? 'Behavioral' : 'Case';
    const difficulty = session.difficulty;
    const duration = session.duration;
    
    console.log('[Practice Mode] Starting practice session', {
      category,
      difficulty,
      duration,
      questionCount: session.questionCount
    });

    // Navigate to assessment page with parameters
    navigate(`/assessment?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}&duration=${duration}`, {
      state: {
        sessionType: session.title,
        duration: session.duration,
        questionCount: session.questionCount,
        category,
        difficulty
      }
    });

    setPhase('lobby');
  };

  const handleBeginInterview = async () => {
    if (!selectedSession) return;

    setLoading(true);
    try {
      // Generate mock questions
      const mockQuestions: Question[] = Array.from({ length: selectedSession.questionCount }, (_, i) => ({
        id: i + 1,
        text: generateMockQuestion(selectedSession.title, i),
        type: selectedSession.title.includes('Technical') ? 'Technical' : 
              selectedSession.title.includes('Behavioral') ? 'Behavioral' : 'Case Study',
        difficulty: selectedSession.difficulty
      }));

      setQuestions(mockQuestions);
      setPhase('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInterview = (interviewResponses: any[]) => {
    setResponses(interviewResponses);
    
    // Calculate total time
    const total = interviewResponses.reduce((sum, r) => sum + r.recordingTime, 0);
    setTotalTime(total);

    // If there are responses with responseIds, show processing for the first one
    const firstResponseWithId = interviewResponses.find(r => r.responseId);
    if (firstResponseWithId) {
      setProcessingResponseId(firstResponseWithId.responseId);
      setFeedbackIndex(0);
      setPhase('processing');
    } else {
      // Demo mode - skip to results
      setPhase('results');
    }
  };

  const handleProcessingComplete = (feedback: FeedbackData) => {
    setCurrentFeedback(feedback);
    setPhase('feedback');
  };

  const handleProcessingError = (error: string) => {
    toast.error(`Processing failed: ${error}`);
    setPhase('results');
  };

  const handleNextQuestion = () => {
    // Move to next response if available
    const nextIndex = feedbackIndex + 1;
    if (nextIndex < responses.length && responses[nextIndex].responseId) {
      setFeedbackIndex(nextIndex);
      setProcessingResponseId(responses[nextIndex].responseId);
      setCurrentFeedback(null);
      setPhase('processing');
    } else {
      // All responses processed, go to results
      setPhase('results');
    }
  };

  const handleRetry = () => {
    setPhase('selection');
    setSelectedSession(null);
    setQuestions([]);
    setResponses([]);
    setTotalTime(0);
    setProcessingResponseId(null);
    setCurrentFeedback(null);
    setFeedbackIndex(0);
  };

  const handleHome = () => {
    handleRetry();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Advanced':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Phase: Selection
  if (phase === 'selection') {
    return (
      <DashboardLayout menuItems={candidateMenu} role="candidate">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">Practice Mode</h1>
                  <p className="text-gray-600 font-medium mt-1">Master interview skills with AI-powered practice sessions</p>
                </div>
              </div>
            </div>

            {/* Practice Sessions Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {practiceSessions.map((session) => {
                const IconComponent = session.icon;
                return (
                  <div
                    key={session.id}
                    className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                  >
                    {/* Gradient Top */}
                    <div className={`h-1 bg-gradient-to-r ${
                      session.color === 'blue' ? 'from-blue-400 to-blue-600' :
                      session.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                      'from-amber-400 to-amber-600'
                    }`} />

                    <div className="p-8">
                      {/* Icon and Title */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                            session.color === 'blue' ? 'bg-blue-100' :
                            session.color === 'emerald' ? 'bg-emerald-100' :
                            'bg-amber-100'
                          }`}>
                            <IconComponent className={`w-6 h-6 ${
                              session.color === 'blue' ? 'text-blue-600' :
                              session.color === 'emerald' ? 'text-emerald-600' :
                              'text-amber-600'
                            }`} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                          <p className="text-gray-600 text-sm mt-2">{session.description}</p>
                        </div>
                      </div>

                      {/* Difficulty Badge */}
                      <div className="mb-6">
                        <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg border ${getDifficultyColor(session.difficulty)}`}>
                          {session.difficulty}
                        </span>
                      </div>

                      {/* Session Details */}
                      <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{session.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{session.questionCount} questions</span>
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="mb-6">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">What you'll learn</p>
                        <ul className="space-y-2">
                          {session.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Start Button */}
                      <button
                        onClick={() => handleStartPractice(session.id)}
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-200 ${
                          loading
                            ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                            : session.color === 'blue'
                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200'
                            : session.color === 'emerald'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-200'
                            : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95 shadow-lg shadow-amber-200'
                        }`}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Start Practice
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Pro Tips for Effective Practice</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700"><span className="font-bold">Practice regularly</span> - Consistency builds confidence and muscle memory</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700"><span className="font-bold">Record yourself</span> - Review your performance to identify areas for improvement</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700"><span className="font-bold">Focus on clarity</span> - Clear communication and structure are key to success</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700"><span className="font-bold">Track progress</span> - Monitor your improvement over time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl font-black text-blue-600 mb-2">3</div>
                <p className="text-gray-600 font-medium">Practice Types</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl font-black text-emerald-600 mb-2">AI-Powered</div>
                <p className="text-gray-600 font-medium">Real-time Feedback</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl font-black text-amber-600 mb-2">Unlimited</div>
                <p className="text-gray-600 font-medium">Practice Sessions</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Phase: Lobby
  if (phase === 'lobby' && selectedSession) {
    return (
      <InterviewLobby
        sessionType={selectedSession.title}
        duration={selectedSession.duration}
        questionCount={selectedSession.questionCount}
        onBegin={handleBeginInterview}
        onCancel={() => setPhase('selection')}
        onDemoMode={() => {
          setDemoMode(true);
          handleBeginInterview();
        }}
      />
    );
  }

  // Phase: Interview
  if (phase === 'interview' && selectedSession && questions.length > 0) {
    return (
      <PracticeInterviewEnvironment
        sessionType={selectedSession.title}
        questions={questions}
        duration={selectedSession.duration}
        onComplete={handleCompleteInterview}
        onCancel={() => setPhase('selection')}
        demoMode={demoMode}
      />
    );
  }

  // Phase: Results
  if (phase === 'results' && selectedSession) {
    return (
      <InterviewResults
        sessionType={selectedSession.title}
        responses={responses}
        totalTime={totalTime}
        onHome={handleHome}
        onRetry={handleRetry}
      />
    );
  }

  // Phase: Processing
  if (phase === 'processing' && processingResponseId) {
    return (
      <InterviewProcessing
        responseId={processingResponseId}
        onComplete={handleProcessingComplete}
        onError={handleProcessingError}
      />
    );
  }

  // Phase: Feedback
  if (phase === 'feedback' && currentFeedback) {
    const hasMoreResponses = feedbackIndex + 1 < responses.length && responses[feedbackIndex + 1].responseId;
    return (
      <InterviewFeedbackDashboard
        feedback={currentFeedback}
        onRetry={handleNextQuestion}
        onHome={handleHome}
        showRetryButton={hasMoreResponses}
      />
    );
  }

  return null;
};

function generateMockQuestion(sessionType: string, index: number): string {
  const technicalQuestions = [
    'Explain the concept of closures in JavaScript and provide a practical example.',
    'How would you optimize a slow database query? Walk us through your approach.',
    'Describe the difference between SQL and NoSQL databases and when to use each.',
    'What is the time complexity of binary search and why is it efficient?',
    'How would you handle authentication and authorization in a web application?'
  ];

  const behavioralQuestions = [
    'Tell us about a time when you had to work with a difficult team member. How did you handle it?',
    'Describe a situation where you failed. What did you learn from it?',
    'How do you prioritize tasks when you have multiple deadlines?',
    'Tell us about your greatest professional achievement.',
    'How do you stay updated with the latest industry trends?'
  ];

  const caseStudyQuestions = [
    'A startup wants to build a ride-sharing app. How would you approach the technical architecture?',
    'Design a system to handle real-time notifications for millions of users.',
    'How would you scale an e-commerce platform to handle Black Friday traffic?'
  ];

  if (sessionType.includes('Technical')) {
    return technicalQuestions[index % technicalQuestions.length];
  } else if (sessionType.includes('Behavioral')) {
    return behavioralQuestions[index % behavioralQuestions.length];
  } else {
    return caseStudyQuestions[index % caseStudyQuestions.length];
  }
}

export default Practice;
