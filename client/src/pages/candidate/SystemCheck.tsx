import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Wifi, Mic, Video, RefreshCw, Volume2, Eye } from 'lucide-react';

interface SystemCheckResult {
  internet: boolean;
  microphone: boolean;
  camera: boolean;
  speaker: boolean;
  loading: boolean;
}

const SystemCheck: React.FC = () => {
  const [checks, setChecks] = useState<SystemCheckResult>({
    internet: false,
    microphone: false,
    camera: false,
    speaker: false,
    loading: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    performSystemChecks();
  }, []);

  const performSystemChecks = async () => {
    setChecks(prev => ({ ...prev, loading: true }));
    setError('');

    try {
      // Check internet connection
      const internetCheck = await checkInternet();

      // Check microphone
      const microphoneCheck = await checkMicrophone();

      // Check camera
      const cameraCheck = await checkCamera();

      // Check speaker
      const speakerCheck = await checkSpeaker();

      setChecks({
        internet: internetCheck,
        microphone: microphoneCheck,
        camera: cameraCheck,
        speaker: speakerCheck,
        loading: false
      });
    } catch (err: any) {
      setError('Failed to complete system checks');
      setChecks(prev => ({ ...prev, loading: false }));
    }
  };

  const checkInternet = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/interviews/test', { method: 'HEAD' });
      return response.ok;
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

  const checkCamera = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  };

  const checkSpeaker = async (): Promise<boolean> => {
    try {
      // Simple speaker check - if audio context works
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      return audioContext.state !== 'closed';
    } catch {
      return false;
    }
  };

  const allChecksPassed = checks.internet && checks.microphone && checks.camera && checks.speaker;

  const CheckItem = ({ icon: Icon, label, status }: { icon: any; label: string; status: boolean }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-100 rounded-lg">
          <Icon size={24} className="text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{label}</h3>
          <p className="text-sm text-slate-600">
            {status ? 'Ready for interviews' : 'May cause issues during interviews'}
          </p>
        </div>
      </div>
      {status ? (
        <CheckCircle size={28} className="text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle size={28} className="text-red-600 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">System Check</h1>
          <p className="text-slate-600">Verify your device is ready for interviews</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Status Summary */}
        <div className={`rounded-lg shadow-sm p-6 mb-8 border ${
          allChecksPassed
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {allChecksPassed ? (
              <CheckCircle size={24} className="text-green-600" />
            ) : (
              <AlertCircle size={24} className="text-yellow-600" />
            )}
            <h2 className={`text-lg font-semibold ${
              allChecksPassed ? 'text-green-900' : 'text-yellow-900'
            }`}>
              {allChecksPassed ? 'All Systems Ready' : 'Some Issues Detected'}
            </h2>
          </div>
          <p className={`text-sm ${
            allChecksPassed ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {allChecksPassed
              ? 'Your device is ready for interviews. You can proceed with confidence.'
              : 'Please resolve the issues below before starting an interview.'}
          </p>
        </div>

        {/* System Checks */}
        <div className="space-y-4 mb-8">
          {checks.loading ? (
            <div className="text-center py-12">
              <RefreshCw size={32} className="mx-auto mb-4 text-indigo-600 animate-spin" />
              <p className="text-slate-600">Running system checks...</p>
            </div>
          ) : (
            <>
              <CheckItem icon={Wifi} label="Internet Connection" status={checks.internet} />
              <CheckItem icon={Mic} label="Microphone" status={checks.microphone} />
              <CheckItem icon={Video} label="Camera" status={checks.camera} />
              <CheckItem icon={Volume2} label="Speaker" status={checks.speaker} />
            </>
          )}
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Eye size={20} />
            Troubleshooting Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Ensure your internet connection is stable</li>
            <li>• Check that microphone and camera permissions are granted</li>
            <li>• Close other applications using your microphone or camera</li>
            <li>• Test your audio levels before starting an interview</li>
            <li>• Use a quiet environment for better audio quality</li>
            <li>• Ensure adequate lighting for camera visibility</li>
          </ul>
        </div>

        {/* Recheck Button */}
        <button
          onClick={performSystemChecks}
          disabled={checks.loading}
          className="w-full mt-8 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={20} />
          Recheck System
        </button>
      </div>
    </div>
  );
};

export default SystemCheck;
