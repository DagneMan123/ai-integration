import React, { useState, useRef, useEffect } from 'react';
import { Mic, Video, CheckCircle2, AlertCircle, Clock, BookOpen, Shield, Settings, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface InterviewLobbyProps {
  sessionType: string;
  duration: number;
  questionCount: number;
  onBegin: () => void;
  onCancel: () => void;
  onDemoMode?: () => void;
}

const InterviewLobby: React.FC<InterviewLobbyProps> = ({
  sessionType,
  duration,
  questionCount,
  onBegin,
  onCancel,
  onDemoMode
}) => {
  const [micStatus, setMicStatus] = useState<'checking' | 'ready' | 'error' | 'demo' | 'pending'>('pending');
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'ready' | 'error' | 'demo' | 'pending'>('pending');
  const [micVolume, setMicVolume] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Don't auto-check hardware, let user choose
    // This prevents permission prompts from appearing immediately
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkHardware = async () => {
    try {
      setErrorMessage('');
      setPermissionDenied(false);
      setMicStatus('checking');
      setCameraStatus('checking');

      // Check camera first
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
        // Ensure video plays
        videoRef.current.play().catch(err => console.error('Video play error:', err));
      }
      streamRef.current = videoStream;
      setCameraStatus('ready');
      toast.success('Camera ready');

      // Check microphone separately
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const microphone = audioContext.createMediaStreamSource(audioStream);
        microphone.connect(analyser);
        analyserRef.current = analyser;
        setMicStatus('ready');
        toast.success('Microphone ready');

        // Monitor microphone volume
        let animationId: number;
        const monitorVolume = () => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setMicVolume(Math.round(average));
          animationId = requestAnimationFrame(monitorVolume);
        };
        monitorVolume();
      } catch (audioError) {
        console.error('Microphone check failed:', audioError);
        setMicStatus('error');
        setErrorMessage('Microphone access failed. Please check permissions.');
      }
    } catch (error) {
      console.error('Hardware check failed:', error);
      const errorName = (error as any).name;
      
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setErrorMessage('Camera and microphone permissions are required. Please click "Allow" when prompted, or check your browser settings.');
        setMicStatus('error');
        setCameraStatus('error');
        toast.error('Permission denied. Please allow camera and microphone access.');
      } else if (errorName === 'NotFoundError') {
        setErrorMessage('Camera or microphone not found. Please check that your hardware is connected and not in use by another application.');
        setMicStatus('error');
        setCameraStatus('error');
        toast.error('Hardware not found.');
      } else if (errorName === 'NotReadableError') {
        setErrorMessage('Camera or microphone is already in use by another application. Please close other apps using your camera/microphone and try again.');
        setMicStatus('error');
        setCameraStatus('error');
        toast.error('Hardware is in use by another application.');
      } else {
        setErrorMessage('Failed to access camera and microphone. Please check your browser permissions and try again.');
        setMicStatus('error');
        setCameraStatus('error');
        toast.error('Failed to access hardware.');
      }
    }
  };

  const enableDemoMode = () => {
    setDemoMode(true);
    setCameraStatus('demo');
    setMicStatus('demo');
    setMicVolume(45);
    toast.success('Demo mode enabled - you can now practice without hardware');
    onDemoMode?.();
  };

  const isReady = (micStatus === 'ready' && cameraStatus === 'ready') || demoMode;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <h1 className="text-3xl font-black mb-2">Interview Setup</h1>
          <p className="text-blue-100">Get ready for your {sessionType} interview</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Camera Preview */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Camera Check
            </h2>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
              {demoMode ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-white mx-auto mb-2" />
                    <p className="text-white font-bold">Demo Mode</p>
                  </div>
                </div>
              ) : cameraStatus === 'pending' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">Ready to check camera</p>
                  </div>
                </div>
              ) : cameraStatus === 'checking' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">Loading camera...</p>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              )}
              <div className="absolute top-4 right-4">
                {cameraStatus === 'ready' && (
                  <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Camera Ready
                  </div>
                )}
                {cameraStatus === 'error' && (
                  <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                    <AlertCircle className="w-4 h-4" />
                    Camera Error
                  </div>
                )}
                {cameraStatus === 'demo' && (
                  <div className="flex items-center gap-2 bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                    <Zap className="w-4 h-4" />
                    Demo Mode
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {cameraStatus === 'pending' ? 'Click "Check Hardware" to test your camera' : 'Make sure your face is clearly visible and well-lit'}
            </p>
          </div>

          {/* Microphone Check */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600" />
              Microphone Check
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-100"
                      style={{ width: `${Math.min(micVolume, 100)}%` }}
                    />
                  </div>
                </div>
                {micStatus === 'ready' && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready
                  </div>
                )}
                {micStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Error
                  </div>
                )}
                {micStatus === 'demo' && (
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    Demo
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {micStatus === 'pending' ? 'Click "Check Hardware" to test your microphone' : 'Speak now to test your microphone. The bar should move.'}
              </p>
            </div>
          </div>

          {/* Interview Brief */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              What to Expect
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700"><span className="font-bold">{questionCount} Questions:</span> You'll be asked {questionCount} {sessionType.toLowerCase()} questions</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700"><span className="font-bold">{duration} Minutes:</span> You have {duration} minutes to complete the session</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700"><span className="font-bold">No Pausing:</span> Once you click 'Begin', the timer cannot be paused</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700"><span className="font-bold">AI Analysis:</span> Your responses will be analyzed for feedback</span>
              </li>
            </ul>
          </div>

          {/* Privacy Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-900 font-medium">Privacy Notice</p>
              <p className="text-sm text-amber-800 mt-1">Your session will be recorded and analyzed by AI for performance feedback. Your data is secure and private.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            {!demoMode && !isReady && (
              <button
                onClick={checkHardware}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                {(micStatus === 'error' || cameraStatus === 'error') ? 'Retry' : 'Check Hardware'}
              </button>
            )}
            {!demoMode && !isReady && (micStatus === 'error' || cameraStatus === 'error') && (
              <button
                onClick={enableDemoMode}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Demo Mode
              </button>
            )}
            <button
              onClick={onBegin}
              disabled={!isReady}
              className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                isReady
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Clock className="w-5 h-5" />
              Begin Interview
            </button>
          </div>

          {!isReady && !demoMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">Ready to Start</p>
                <p className="text-sm text-blue-800 mt-1">Click "Check Hardware" to test your camera and microphone, or use "Demo Mode" to practice without hardware.</p>
              </div>
            </div>
          )}

          {!isReady && !demoMode && (micStatus === 'error' || cameraStatus === 'error') && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">Hardware Check Failed</p>
                <p className="text-sm text-red-800 mt-1">{errorMessage || 'Please ensure both your camera and microphone are working before proceeding.'}</p>
                {permissionDenied && (
                  <div className="mt-3 text-xs text-red-800 bg-red-100 p-2 rounded">
                    <p className="font-bold mb-1">How to fix permission issues:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click the lock icon in your browser's address bar</li>
                      <li>Find "Camera" and "Microphone" settings</li>
                      <li>Change them from "Block" to "Allow"</li>
                      <li>Click "Retry" to try again</li>
                    </ul>
                    <p className="font-bold mt-2">Or use Demo Mode to practice without hardware</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewLobby;
