import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Zap, Camera, Mic, Wifi, Volume2, ArrowRight, Clock } from 'lucide-react';
import Loading from '../../components/Loading';
import { jobAPI } from '../../utils/api';
import toast from 'react-hot-toast';

interface SystemCheck {
  camera: boolean;
  microphone: boolean;
  internet: boolean;
  speaker: boolean;
}

const InterviewStart: React.FC = () => {
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [systemChecks, setSystemChecks] = useState<SystemCheck>({
    camera: false,
    microphone: false,
    internet: false,
    speaker: false
  });
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [allChecksPassed, setAllChecksPassed] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    performSystemChecks();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setSystemChecks(prev => ({ ...prev, internet: true }));
      setAllChecksPassed(true);
    };
    
    const handleOffline = () => {
      setSystemChecks(prev => ({ ...prev, internet: false }));
      setAllChecksPassed(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial internet status based on navigator.onLine
    setSystemChecks(prev => ({ ...prev, internet: navigator.onLine }));
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      if (jobId) {
        const response = await jobAPI.getOne(jobId);
        setJob(response.data?.data);
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSystemChecks = async () => {
    setChecking(true);
    try {
      // Check internet with retry logic
      let internetOk = false;
      for (let i = 0; i < 2; i++) {
        internetOk = await checkInternet();
        if (internetOk) break;
        if (i < 1) await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Check camera
      const cameraOk = await checkCamera();
      
      // Check microphone
      const micOk = await checkMicrophone();
      
      // Check speaker
      const speakerOk = await checkSpeaker();

      const checks = {
        internet: internetOk,
        camera: cameraOk,
        microphone: micOk,
        speaker: speakerOk
      };

      setSystemChecks(checks);
      setAllChecksPassed(internetOk && cameraOk && micOk && speakerOk);
    } catch (error) {
      console.error('System check error:', error);
      toast.error('Failed to complete system checks');
    } finally {
      setChecking(false);
    }
  };

  const checkInternet = async (): Promise<boolean> => {
    try {
      // Primary check: navigator.onLine
      if (!navigator.onLine) {
        return false;
      }
      
      // Secondary check: Try to reach the API server with multiple attempts
      const maxAttempts = 2;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch('/api/interviews/test', {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          // Accept any response status as long as we got a response
          return true;
        } catch (apiError) {
          if (attempt < maxAttempts - 1) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      // If API check fails, try a simple connectivity test
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // Try to fetch a small resource from a reliable CDN
        await fetch('https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        return true;
      } catch {
        // Fall back to navigator.onLine
        return navigator.onLine;
      }
    } catch {
      return navigator.onLine;
    }
  };

  const checkCamera = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  };

  const checkMicrophone = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  };

  const checkSpeaker = async (): Promise<boolean> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      return audioContext.state !== 'closed';
    } catch {
      return false;
    }
  };

  const handleStartInterview = () => {
    if (!allChecksPassed) {
      toast.error('Please ensure all system requirements are met');
      return;
    }
    
    // Redirect directly to interview session
    navigate(`/candidate/interview-session/${applicationId}`);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Zap size={18} />
            <span className="font-semibold">Ready to Interview?</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Start Your Interview</h1>
          <p className="text-lg text-gray-600">Complete the system check and begin your AI-powered interview</p>
        </div>

        {/* Position Information */}
        {job && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Position Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Job Title</p>
                <p className="text-2xl font-bold text-gray-900">{job.title}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Company</p>
                <p className="text-2xl font-bold text-gray-900">{job.company?.name || 'Company'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Experience Level</p>
                <p className="text-lg font-semibold text-blue-600 capitalize">{job.experienceLevel || 'Mid-Level'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Interview Type</p>
                <p className="text-lg font-semibold text-blue-600">Technical</p>
              </div>
            </div>
          </div>
        )}

        {/* System Requirements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle size={24} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">System Requirements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Camera Check */}
            <div className={`rounded-xl p-4 border-2 transition-all ${
              systemChecks.camera 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera size={20} className={systemChecks.camera ? 'text-green-600' : 'text-red-600'} />
                  <div>
                    <p className="font-semibold text-gray-900">Camera</p>
                    <p className={`text-sm ${systemChecks.camera ? 'text-green-700' : 'text-red-700'}`}>
                      {systemChecks.camera ? 'Camera is working' : 'Camera not detected'}
                    </p>
                  </div>
                </div>
                {systemChecks.camera && <CheckCircle size={20} className="text-green-600" />}
              </div>
            </div>

            {/* Microphone Check */}
            <div className={`rounded-xl p-4 border-2 transition-all ${
              systemChecks.microphone 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic size={20} className={systemChecks.microphone ? 'text-green-600' : 'text-red-600'} />
                  <div>
                    <p className="font-semibold text-gray-900">Microphone</p>
                    <p className={`text-sm ${systemChecks.microphone ? 'text-green-700' : 'text-red-700'}`}>
                      {systemChecks.microphone ? 'Microphone is working' : 'Microphone not detected'}
                    </p>
                  </div>
                </div>
                {systemChecks.microphone && <CheckCircle size={20} className="text-green-600" />}
              </div>
            </div>

            {/* Internet Check */}
            <div className={`rounded-xl p-4 border-2 transition-all ${
              systemChecks.internet 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi size={20} className={systemChecks.internet ? 'text-green-600' : 'text-red-600'} />
                  <div>
                    <p className="font-semibold text-gray-900">Internet</p>
                    <p className={`text-sm ${systemChecks.internet ? 'text-green-700' : 'text-red-700'}`}>
                      {systemChecks.internet ? 'Connection stable' : 'Connection unstable'}
                    </p>
                  </div>
                </div>
                {systemChecks.internet && <CheckCircle size={20} className="text-green-600" />}
              </div>
            </div>

            {/* Speaker Check */}
            <div className={`rounded-xl p-4 border-2 transition-all ${
              systemChecks.speaker 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 size={20} className={systemChecks.speaker ? 'text-green-600' : 'text-red-600'} />
                  <div>
                    <p className="font-semibold text-gray-900">Speaker</p>
                    <p className={`text-sm ${systemChecks.speaker ? 'text-green-700' : 'text-red-700'}`}>
                      {systemChecks.speaker ? 'Speaker is working' : 'Speaker not detected'}
                    </p>
                  </div>
                </div>
                {systemChecks.speaker && <CheckCircle size={20} className="text-green-600" />}
              </div>
            </div>
          </div>

          {/* Recheck Button */}
          <button
            onClick={performSystemChecks}
            disabled={checking}
            className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Recheck System'}
          </button>
        </div>

        {/* Interview Guidelines */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Before You Start</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• Find a quiet, well-lit space</li>
                <li>• Ensure a professional background</li>
                <li>• Have a stable internet connection</li>
                <li>• Close other applications</li>
                <li>• Allow camera and microphone permissions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/candidate/invitations')}
            className="flex-1 px-6 py-4 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartInterview}
            disabled={!allChecksPassed || checking}
            className={`flex-1 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              allChecksPassed && !checking
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Clock size={20} />
            Start Interview
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewStart;
