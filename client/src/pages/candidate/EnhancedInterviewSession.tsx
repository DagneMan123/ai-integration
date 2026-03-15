import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import AntiCheatMonitor from '../../components/AntiCheatMonitor';
import WebcamVerification from '../../components/WebcamVerification';
import toast from 'react-hot-toast';
import { 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  Info,
  Maximize2,
  Cpu
} from 'lucide-react';

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

  useEffect(() => { fetchInterview(); }, [id]);

  const fetchInterview = async () => {
    try {
      const response = await interviewAPI.getInterviewReport(id!);
      const data = (response.data as any).data.interview;
      setInterview(data);
      
      const nextIndex = data.responses?.length || 0;
      if (nextIndex < data.questions.length) {
        setCurrentQuestion(data.questions[nextIndex]);
        setTimeLeft(data.timePerQuestion || 600); // Default 10 mins if not set
        setQuestionStartTime(Date.now());
      } else {
        navigate(`/candidate/interview/${id}/report`);
      }
    } catch (error) {
      toast.error('Session error');
      navigate('/candidate/interviews');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (timeLeft > 0 && isVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isVerified) {
      handleAutoSubmit();
    }
  }, [timeLeft, isVerified]);

  const handleVerified = () => {
    setIsVerified(true);
    setShowVerification(false);
    toast.success('Identity Verified. Session Started.');
  };

  const handleAutoSubmit = async () => {
    await handleSubmitAnswer();
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() && timeLeft > 0) {
      toast.error('Please provide a response');
      return;
    }

    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
      const currentIndex = interview.responses?.length || 0;

      const response = await interviewAPI.submitAnswer(id!, {
        questionIndex: currentIndex,
        answer,
        timeTaken
      });

      const { nextQuestion, isLastQuestion } = (response.data as any).data;

      if (isLastQuestion) {
        await interviewAPI.completeInterview(id!);
        navigate(`/candidate/interview/${id}/report`);
      } else {
        setAnswer('');
        setCurrentQuestion(nextQuestion);
        setQuestionStartTime(Date.now());
        setTimeLeft(interview.timePerQuestion || 600);
      }
    } catch (error: any) {
      toast.error('Submission failed');
    } finally { setSubmitting(false); }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading />;

  // 1. Verification Step UI
  if (showVerification && !isVerified) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Identity Check</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              To ensure a fair assessment, we use AI-powered identity verification. Please position yourself clearly in front of the camera.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <span className="text-sm font-medium">Biometric monitoring active</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-400 ml-2">
                <li className="flex items-center gap-2 italic font-mono"><ChevronRight className="w-4 h-4 text-blue-500" /> No tab switching allowed</li>
                <li className="flex items-center gap-2 italic font-mono"><ChevronRight className="w-4 h-4 text-blue-500" /> Session is recorded</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl">
            <WebcamVerification
              interviewId={id!}
              onVerified={handleVerified}
              autoCapture={true}
              captureInterval={300000}
            />
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Session UI
  const progress = ((interview?.responses?.length || 0) / interview?.questions?.length) * 100;

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      <AntiCheatMonitor interviewId={id!} onViolation={(v) => console.log(v)} />

      {/* Top Navigation / Progress */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">SimuAI Assessment</h2>
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Step {(interview?.responses?.length || 0) + 1}/{interview?.questions?.length}</span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border-2 transition-all shadow-sm ${timeLeft < 60 ? 'bg-red-50 border-red-100 animate-pulse' : 'bg-white border-gray-100'}`}>
            <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`} />
            <span className={`text-xl font-black tabular-nums ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-tighter">Secure Link Active</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8 p-6 lg:p-10">
        
        {/* Left Side: Question Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
            
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black uppercase tracking-widest">
                {currentQuestion?.type || 'CORE COMPETENCY'}
              </span>
              <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-black uppercase tracking-widest">
                {currentQuestion?.difficulty || 'General'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-8">
              {currentQuestion?.question}
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
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SUBMIT RESPONSE'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Instructions & Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" /> Interview Tips
            </h3>
            <div className="space-y-4">
              <TipItem text="Be specific: Use the STAR method (Situation, Task, Action, Result)." />
              <TipItem text="Focus on your unique role and contribution in projects." />
              <TipItem text="The AI evaluates clarity, technical accuracy, and structure." />
            </div>
          </div>

          <div className="bg-amber-50 rounded-[2rem] border border-amber-100 p-6">
            <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Integrity Notice
            </h3>
            <ul className="space-y-3">
              <IntegrityItem text="Tab switches are logged" />
              <IntegrityItem text="No copy-pasting allowed" />
              <IntegrityItem text="Face must remain visible" />
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

/* Helper Components */
const TipItem = ({ text }: { text: string }) => (
  <div className="flex gap-3 text-sm text-gray-600 font-medium leading-relaxed">
    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
    {text}
  </div>
);

const IntegrityItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3 text-xs font-bold text-amber-800/70 uppercase italic">
    <div className="w-1 h-1 bg-amber-400 rounded-full" />
    {text}
  </li>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

export default EnhancedInterviewSession;