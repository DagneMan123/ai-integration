import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Target, 
  MessageSquare, 
  Brain,
  ShieldCheck,
  ArrowLeft,
  Briefcase,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

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

  if (loading) return <Loading />;
  if (!report) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-xl font-bold text-gray-900">Report not found</p>
      <Link to="/candidate/interviews" className="mt-4 text-blue-600 hover:underline">Back to interviews</Link>
    </div>
  );

  const interview = report?.interview || report;
  const evalData = interview?.aiEvaluation || interview?.evaluation || {};
  const overallScore = evalData?.overallScore || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <Link to="/candidate/interviews" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Interviews
          </Link>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export Full Report (PDF)
          </button>
        </div>

        {/* Hero Section: Summary Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-white p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Brain className="w-40 h-40 text-blue-600" />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Score Ring */}
            <div className="relative flex-shrink-0">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={553} strokeDashoffset={553 - (553 * overallScore) / 100}
                  className={`${overallScore >= 80 ? 'text-emerald-500' : overallScore >= 60 ? 'text-blue-500' : 'text-rose-500'} transition-all duration-1000 ease-out`} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-gray-900">{overallScore}%</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Overall</span>
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">Neural Analysis Complete</span>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Integrity Verified
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                {typeof interview.jobId === 'object' ? interview.jobId.title : 'Interview Results'}
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
                {evalData?.recommendation || "Our AI has completed the analysis of your performance across technical, communication, and structural benchmarks."}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Technical" score={evalData?.technicalScore} icon={<Target className="text-blue-600" />} color="blue" />
          <MetricCard title="Communication" score={evalData?.communicationScore} icon={<MessageSquare className="text-purple-600" />} color="purple" />
          <MetricCard title="Confidence" score={evalData?.confidenceScore} icon={<TrendingUp className="text-emerald-600" />} color="emerald" />
          <MetricCard title="Problem Solving" score={evalData?.problemSolvingScore} icon={<Brain className="text-orange-600" />} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Strengths & Improvements */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Strengths
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {evalData?.strengths?.map((s: string, i: number) => (
                  <div key={i} className="flex gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm font-semibold text-emerald-900 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500" /> Areas for Improvement
              </h3>
              <div className="space-y-4">
                {evalData?.weaknesses?.map((w: string, i: number) => (
                  <div key={i} className="flex gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-50">
                    <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-semibold text-amber-900 leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Info: Recommendation & Meta */}
          <div className="space-y-8">
            <div className="bg-gray-900 text-white rounded-[2rem] p-8 shadow-xl">
              <Trophy className="w-10 h-10 text-yellow-400 mb-6" />
              <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Hiring Verdict</h3>
              <p className="text-gray-400 text-sm mb-6">Based on AI evaluation and industry benchmarks.</p>
              
              <div className="p-4 bg-white/10 rounded-2xl mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xl font-black text-white capitalize">
                  {evalData?.hiringDecision?.replace('_', ' ') || 'Processing'}
                </p>
              </div>

              <Link to="/jobs" className="flex items-center justify-center gap-2 w-full bg-white text-gray-900 py-4 rounded-2xl font-black hover:bg-gray-100 transition-all">
                Find More Jobs
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
              <Briefcase className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
              <h4 className="font-bold mb-2">Did you know?</h4>
              <p className="text-sm text-blue-100 leading-relaxed">
                Candidates who review their AI improvement areas increase their hireability by 35% in their next interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Helper Components */
const MetricCard = ({ title, score, icon, color }: any) => {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
        <span className={`text-xl font-black ${colors[color].split(' ')[0]}`}>{score}%</span>
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <div className="mt-3 w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color].split(' ')[0].replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export default InterviewReport;