import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Wifi,
  Mic,
  Video,
  Eye,
  Clock,
  BookOpen,
  Shield,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import { interviewAPI, jobAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

const InterviewStart: React.FC = () => {
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [systemReady, setSystemReady] = useState(false);
  const [checks, setChecks] = useState({
    camera: false,
    microphone: false,
    internet: false,
    browser: false
  });

  const fetchJobDetails = async () => {
    try {
      if (jobId) {
        const response = await jobAPI.getOne(jobId);
        setJob(response.data?.data);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const runSystemChecks = async () => {
    const newChecks = { ...checks };

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        newChecks.camera = true;
      } catch {
        newChecks.camera = false;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        newChecks.microphone = true;
      } catch {
        newChecks.microphone = false;
      }
    }

    newChecks.internet = navigator.onLine;
    newChecks.browser = true;

    setChecks(newChecks);
    setSystemReady(Object.values(newChecks).every(v => v));
  };

  useEffect(() => {
    fetchJobDetails();
    runSystemChecks();
  }, [jobId]);

  const handleStartInterview = async () => {
    if (!systemReady) {
      toast.error('Please fix system issues before starting');
      return;
    }

    setStarting(true);
    try {
      const response = await interviewAPI.start({
        jobId: parseInt(jobId!),
        applicationId: parseInt(applicationId!),
        interviewMode: 'text',
        strictnessLevel: 'moderate'
      });

      if (response.data.success) {
        toast.success('Interview started!');
        const interviewId = (response.data.data as any).interviewId || (response.data.data as any).id;
        navigate(`/candidate/interview/${interviewId}`);
      }
    } catch (error: any) {
      console.error('Error starting interview:', error);
      toast.error(error.response?.data?.message || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <Loading />;

  const allChecksPass = Object.values(checks).every(v => v);

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              <Zap className="w-4 h-4" />
              Ready to Interview?
            </div>
            <h1 className="text-4xl font-black text-gray-900">Start Your Interview</h1>
            <p className="text-gray-600 font-medium">Complete the system check and begin your AI-powered interview</p>
          </div>

          {/* Job Information Card */}
          {job && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Position Information</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-2">Job Title</p>
                  <p className="text-2xl font-bold text-gray-900">{job.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-2">Company</p>
                  <p className="text-2xl font-bold text-gray-900">{job.company?.name || 'Company'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-2">Experience Level</p>
                  <p className="text-lg font-bold text-blue-600 capitalize">{job.experienceLevel || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-2">Interview Type</p>
                  <p className="text-lg font-bold text-blue-600 capitalize">{job.interviewType || 'Technical'}</p>
                </div>
              </div>
            </div>
          )}

          {/* System Checks */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              System Requirements
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Camera Check */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                checks.camera 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Video className={`w-5 h-5 ${checks.camera ? 'text-emerald-600' : 'text-red-600'}`} />
                    <span className="font-bold text-gray-900">Camera</span>
                  </div>
                  {checks.camera ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className={`text-sm ${checks.camera ? 'text-emerald-700' : 'text-red-700'}`}>
                  {checks.camera ? 'Camera is working' : 'Camera not detected or permission denied'}
                </p>
              </div>

              {/* Microphone Check */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                checks.microphone 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Mic className={`w-5 h-5 ${checks.microphone ? 'text-emerald-600' : 'text-red-600'}`} />
                    <span className="font-bold text-gray-900">Microphone</span>
                  </div>
                  {checks.microphone ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className={`text-sm ${checks.microphone ? 'text-emerald-700' : 'text-red-700'}`}>
                  {checks.microphone ? 'Microphone is working' : 'Microphone not detected or permission denied'}
                </p>
              </div>

              {/* Internet Check */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                checks.internet 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Wifi className={`w-5 h-5 ${checks.internet ? 'text-emerald-600' : 'text-red-600'}`} />
                    <span className="font-bold text-gray-900">Internet</span>
                  </div>
                  {checks.internet ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className={`text-sm ${checks.internet ? 'text-emerald-700' : 'text-red-700'}`}>
                  {checks.internet ? 'Internet connection stable' : 'No internet connection'}
                </p>
              </div>

              {/* Browser Check */}
              <div className={`p-6 rounded-xl border-2 transition-all ${
                checks.browser 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Eye className={`w-5 h-5 ${checks.browser ? 'text-emerald-600' : 'text-red-600'}`} />
                    <span className="font-bold text-gray-900">Browser</span>
                  </div>
                  {checks.browser ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className={`text-sm ${checks.browser ? 'text-emerald-700' : 'text-red-700'}`}>
                  {checks.browser ? 'Browser is compatible' : 'Browser not supported'}
                </p>
              </div>
            </div>

            {!allChecksPass && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-bold">
                  ⚠️ Please fix the issues above before starting the interview.
                </p>
              </div>
            )}
          </div>

          {/* Interview Guidelines */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Interview Guidelines
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">What to Expect</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>Multiple technical and behavioral questions</span>
                  </li>
                  <li className="flex gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>AI-powered evaluation of your responses</span>
                  </li>
                  <li className="flex gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>Real-time feedback and scoring</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Important Rules</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                    <span>No tab switching or external resources</span>
                  </li>
                  <li className="flex gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                    <span>No copy-pasting from external sources</span>
                  </li>
                  <li className="flex gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                    <span>Maintain eye contact with camera</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interview Duration */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-8">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Estimated Duration</h3>
                <p className="text-gray-600">This interview typically takes 45-60 minutes to complete.</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/candidate/interviews')}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleStartInterview}
              disabled={!allChecksPass || starting}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
                allChecksPass && !starting
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5" />
              {starting ? 'Starting...' : 'Start Interview'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewStart;
