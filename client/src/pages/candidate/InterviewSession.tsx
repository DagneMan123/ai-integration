import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI, jobAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import AIVideoInterview from '../../components/AIVideoInterview';
import toast from 'react-hot-toast';
import { useAntiPaste } from '../../hooks/useAntiPaste';
import { 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  Cpu, 
  Maximize2,
  Info,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Heart,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [jobSaved, setJobSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  const { handlePaste, handleDrop, handleContextMenu } = useAntiPaste({
    interviewId: interview?.id,
    onCheatingDetected: () => {
      setCheatingDetected(true);
      toast.error('Cheating detected. Interview will be terminated.');
      setTimeout(() => {
        navigate('/candidate/interviews');
      }, 3000);
    },
    enabled: !isVideoMode
  });

  const fetchInterview = useCallback(async () => {
    try {
      const response = await interviewAPI.getReport(id!);
      const data = response.data.data as any;
      
      setInterview(data);
      
      if (data?.interviewMode === 'video') {
        setIsVideoMode(true);
      }
      
      if (data?.jobId) {
        try {
          const jobResponse = await jobAPI.getOne(data.jobId);
          setJob(jobResponse.data?.data);
        } catch (jobError) {
          console.warn('Could not fetch job details');
        }
      }
      
      const introQuestion = {
        text: `Welcome to the ${data?.job?.title || 'interview'}! Please provide a professional introduction about yourself. Include: 1. Your name and current role 2. Your professional background (2-3 years of experience) 3. Your key skills relevant to this position 4. Why you're interested in this opportunity. Take your time and speak clearly.`,
        type: 'intro',
        difficulty: 'easy',
        isIntroduction: true
      };
      
      const jobTitle = data?.job?.title || 'the position';
      const requiredSkills = data?.job?.requiredSkills || [];
      const skillsText = requiredSkills.length > 0 ? requiredSkills.slice(0, 3).join(', ') : 'technical skills';
      
      const detailedQuestions = [
        {
          text: `Describe a challenging project you've worked on for a ${jobTitle} role. What was the problem, your approach, and the outcome?`,
          type: 'technical',
          difficulty: 'medium'
        },
        {
          text: `Tell us about your experience with ${skillsText}. How have you applied these skills in your previous roles?`,
          type: 'technical',
          difficulty: 'medium'
        },
        {
          text: `How do you stay updated with the latest trends and technologies in your field? Can you give an example?`,
          type: 'technical',
          difficulty: 'medium'
        },
        {
          text: `Describe a time when you had to work with a difficult team member. How did you handle the situation?`,
          type: 'behavioral',
          difficulty: 'medium'
        },
        {
          text: `Tell us about a time when you failed at something. What did you learn from that experience?`,
          type: 'behavioral',
          difficulty: 'medium'
        },
        {
          text: `How do you prioritize your work when you have multiple deadlines? Can you give a specific example?`,
          type: 'behavioral',
          difficulty: 'medium'
        },
        {
          text: `What are your career goals for the next 3-5 years, and how does this ${jobTitle} position align with them?`,
          type: 'behavioral',
          difficulty: 'medium'
        },
        {
          text: `Describe your approach to learning new technologies or tools. How quickly can you adapt?`,
          type: 'technical',
          difficulty: 'medium'
        },
        {
          text: `Why do you think you're a good fit for this ${jobTitle} position at our company? What unique value can you bring?`,
          type: 'behavioral',
          difficulty: 'medium'
        }
      ];
      
      const questionsWithIntro = [introQuestion, ...detailedQuestions];
      setAllQuestions(questionsWithIntro);
      
      if (questionsWithIntro.length > 0) {
        setCurrentQuestion(questionsWithIntro[0]);
        setCurrentQuestionIndex(0);
        setTimeLeft(data.timeLimit ? data.timeLimit * 60 : 3600);
      }
    } catch (error) {
      toast.error('Failed to load interview session');
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

  useEffect(() => {
    if (timeLeft === 0 && allQuestions.length > 0 && !submitting) {
      toast.error('Time limit reached. Submitting interview...');
      handleCompleteInterview();
    }
  }, [timeLeft, allQuestions.length, submitting]);

  const handleCompleteInterview = useCallback(async () => {
    try {
      await interviewAPI.complete(id!);
      navigate(`/candidate/interview/${id}/report`);
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error('Failed to complete interview');
    }
  }, [id, navigate]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer before submitting');
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < allQuestions.length) {
        setCurrentQuestion(allQuestions[nextIndex]);
        setCurrentQuestionIndex(nextIndex);
        setAnswer('');
        toast.success('Response submitted! Moving to next question...');
      } else {
        toast.success('All questions answered! Generating evaluation...');
        await handleCompleteInterview();
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Failed to process response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveJob = async () => {
    if (!job) {
      toast.error('Job information not available');
      return;
    }

    if (savingJob) return;

    setSavingJob(true);
    try {
      await jobAPI.saveJob(job.id);
      setJobSaved(true);
      toast.success('Job saved successfully! ❤️');
    } catch (error: any) {
      if (error.response?.status === 409) {
        setJobSaved(true);
        toast.error('Job already saved');
      } else {
        console.error('Error saving job:', error);
        toast.error('Failed to save job');
      }
    } finally {
      setSavingJob(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading />;

  if (isVideoMode) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-lg shadow-md">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Video Interview</h2>
                <p className="text-xs text-gray-500">AI-Powered Assessment</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border-2 transition-all ${
              timeLeft < 300 ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-blue-50 border-blue-200'
            }`}>
              <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`} />
              <span className={`text-lg font-bold tabular-nums ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase">Proctoring Active</span>
            </div>
          </div>
        </nav>

        <main className="flex-1 max-w-6xl mx-auto w-full p-6 lg:p-10">
          <AIVideoInterview
            interviewId={parseInt(id!)}
            questionId={currentQuestionIndex}
            question={currentQuestion?.text || 'Please answer the following question'}
            onComplete={() => {
              toast.success('Video recorded successfully');
              if (currentQuestionIndex + 1 >= interview.questions.length) {
                handleCompleteInterview();
              } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setCurrentQuestion(interview.questions[currentQuestionIndex + 1]);
              }
            }}
            onSkip={() => {
              if (currentQuestionIndex + 1 >= interview.questions.length) {
                handleCompleteInterview();
              } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setCurrentQuestion(interview.questions[currentQuestionIndex + 1]);
              }
            }}
          />
        </main>
      </div>
    );
  }

  const progress = allQuestions.length ? ((currentQuestionIndex + 1) / allQuestions.length) * 100 : 0;
  const isTimeWarning = timeLeft < 300;
  const isCritical = timeLeft < 60;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-lg shadow-md">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">SimuAI Assessment</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {currentQuestionIndex + 1} of {allQuestions.length}
                </span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border-2 transition-all font-mono font-bold ${
            isCritical 
              ? 'bg-red-50 border-red-300 text-red-700 animate-pulse' 
              : isTimeWarning 
              ? 'bg-amber-50 border-amber-300 text-amber-700' 
              : 'bg-blue-50 border-blue-300 text-blue-700'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="text-lg">{formatTime(timeLeft)}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase">Proctoring Active</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full grid lg:grid-cols-12 gap-8 p-6 lg:p-10">
        {/* Question Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-blue-500" />
            
            {/* Question Type Badges */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                currentQuestion?.isIntroduction 
                  ? 'bg-purple-100 text-purple-700' 
                  : currentQuestion?.type === 'technical'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {currentQuestion?.isIntroduction ? '🎤 Introduction' : (currentQuestion?.type === 'technical' ? '💻 Technical' : '🤝 Behavioral')}
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                {currentQuestion?.difficulty || 'Medium'}
              </span>
            </div>

            {/* Question Text */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-8">
              {currentQuestion?.text || 'Loading question...'}
            </h1>

            {/* Answer Input */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-blue-600" /> Your Response
                </label>
                <span className="text-xs font-mono text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                  {answer.length} / 5000 characters
                </span>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 5000))}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onContextMenu={handleContextMenu}
                rows={14}
                autoComplete="off"
                className="w-full p-6 text-base border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none shadow-inner leading-relaxed"
                placeholder="Type your answer here... (Paste is disabled for security)"
                disabled={submitting || cheatingDetected}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-4">
              {job && (
                <button
                  onClick={handleSaveJob}
                  disabled={jobSaved || savingJob}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-red-300 bg-white hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-gray-700 hover:text-red-600"
                  title="Save this job to your saved jobs"
                >
                  {jobSaved ? (
                    <>
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      <span>Job Saved</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      <span>Save Job</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim() || cheatingDetected}
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Response</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Cheating Detection Alert */}
            {cheatingDetected && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">Cheating Detected</p>
                  <p className="text-sm text-red-700">Your interview will be terminated. Redirecting...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Job Information */}
          {job && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-blue-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Position Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Job Title</p>
                  <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                </div>
                
                {job.company?.name && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Company
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{job.company.name}</p>
                  </div>
                )}
                
                {job.location && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{job.location}</p>
                  </div>
                )}
                
                {job.experienceLevel && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Experience</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{job.experienceLevel}</p>
                  </div>
                )}
                
                {job.salary?.min && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Salary
                    </p>
                    <p className="text-sm font-semibold text-emerald-600">
                      ${(job.salary.min/1000).toFixed(0)}k - ${(job.salary.max/1000).toFixed(0)}k
                    </p>
                  </div>
                )}
                
                {job.requiredSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 5).map((skill: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" /> Tips for Success
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Provide specific examples from your experience</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Be clear and concise in your responses</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Focus on technical depth and clarity</span>
              </li>
              <li className="flex gap-3 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Take your time - quality over speed</span>
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">Security Notice</h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  AI monitoring is active. Tab switching, copy-pasting, and suspicious behavior are logged and may result in disqualification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSession;