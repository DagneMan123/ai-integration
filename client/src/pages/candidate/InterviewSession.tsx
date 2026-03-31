import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI, jobAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
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
  DollarSign
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

  const fetchInterview = useCallback(async () => {
    try {
      const response = await interviewAPI.getInterviewReport(id!);
      const data = response.data.data as any;
      
      setInterview(data);
      
      // Fetch job details if jobId exists
      if (data?.jobId) {
        try {
          const jobResponse = await jobAPI.getJob(data.jobId);
          setJob(jobResponse.data?.data);
          console.log('Job fetched:', jobResponse.data?.data);
        } catch (jobError) {
          console.error('Failed to fetch job:', jobError);
        }
      }
      
      if (data?.questions && data.questions.length > 0) {
        setCurrentQuestion(data.questions[0]);
        setCurrentQuestionIndex(0);
        setTimeLeft(data.timeLimit ? data.timeLimit * 60 : 3600); // Default 1 hour
      }
    } catch (error) {
      console.error('Session loading error:', error);
      toast.error('Session loading failed');
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
      toast.error('Answer cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      await interviewAPI.submitAnswer(id!, {
        questionIndex: currentQuestionIndex,
        answer,
        timeTaken: (interview.timeLimit ? interview.timeLimit * 60 : 3600) - timeLeft
      });

      if (currentQuestionIndex + 1 >= interview.questions.length) {
        await interviewAPI.completeInterview(id!);
        toast.success('Interview completed!');
        navigate(`/candidate/interview/${id}/report`);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentQuestion(interview.questions[currentQuestionIndex + 1]);
        setAnswer('');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Submission failed');
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

  const progress = interview?.questions?.length ? ((currentQuestionIndex + 1) / interview.questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Professional Header */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">SimuAI Assessment</h2>
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400">Step {currentQuestionIndex + 1}/{interview?.questions?.length}</span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border-2 transition-all ${timeLeft < 300 ? 'bg-red-50 border-red-100 animate-pulse' : 'bg-white border-gray-100'}`}>
            <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`} />
            <span className={`text-xl font-black tabular-nums ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase">AI Proctoring Active</span>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl mx-auto w-full grid lg:grid-cols-12 gap-8 p-6 lg:p-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
            
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {currentQuestion?.type || 'TECHNICAL'}
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {currentQuestion?.difficulty || 'GENERAL'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-8">
              {currentQuestion?.text}
            </h1>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" /> Your Response
                </label>
                <span className="text-[10px] font-mono text-gray-400">{answer.length} Characters</span>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={12}
                className="w-full p-6 text-lg border-2 border-gray-50 rounded-[1.5rem] bg-gray-50/30 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none shadow-inner leading-relaxed"
                placeholder="Compose your answer here..."
                disabled={submitting}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
                className="group flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
              >
                {submitting ? 'PROCESSING...' : 'SUBMIT RESPONSE'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          {/* Job Information Card */}
          {job && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] border border-blue-100 shadow-sm p-6">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Position Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Job Title</p>
                  <p className="text-sm font-bold text-gray-900">{job.title}</p>
                </div>
                
                {job.company && (
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Company
                    </p>
                    <p className="text-sm font-bold text-gray-900">{job.company.name}</p>
                  </div>
                )}
                
                {job.location && (
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location
                    </p>
                    <p className="text-sm font-bold text-gray-900">{job.location}</p>
                  </div>
                )}
                
                {job.experienceLevel && (
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Experience Level</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{job.experienceLevel}</p>
                  </div>
                )}
                
                {job.salary?.min && (
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Salary Range
                    </p>
                    <p className="text-sm font-bold text-emerald-600">
                      ${(job.salary.min/1000)}k - ${(job.salary.max/1000)}k {job.salary.currency}
                    </p>
                  </div>
                )}
                
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 5).map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" /> Guidelines
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-gray-600 font-medium">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                Provide specific examples from your past projects.
              </li>
              <li className="flex gap-3 text-sm text-gray-600 font-medium">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                Focus on clarity and technical depth.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-[2rem] border border-amber-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">Integrity Notice</h3>
            </div>
            <p className="text-[11px] text-amber-800 font-bold leading-relaxed uppercase italic">
              AI Monitoring is active. Tab switching and copy-pasting are strictly logged.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSession;