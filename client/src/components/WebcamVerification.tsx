import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { interviewAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  ShieldCheck,
  Scan,
  Video
} from 'lucide-react';

interface WebcamVerificationProps {
  interviewId: string;
  onVerified: () => void;
  autoCapture?: boolean;
  captureInterval?: number; // in milliseconds
}

const WebcamVerification: React.FC<WebcamVerificationProps> = ({
  interviewId,
  onVerified,
  autoCapture = false,
  captureInterval = 300000 // 5 minutes default
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureAndVerify = useCallback(async () => {
    if (!webcamRef.current) {
      setError('Webcam module not initialized properly.');
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Could not capture identity snapshot.');
      }

      // Metadata for proctoring audit
      const metadata = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      };

      await interviewAPI.recordIdentitySnapshot(interviewId, {
        imageData: imageSrc,
        faceDetected: true,
        confidence: 100,
        metadata
      });

      setIsVerified(true);
      toast.success('Identity Verified', {
        style: { borderRadius: '12px', background: '#0f172a', color: '#fff' }
      });
      onVerified();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Verification Failed. Please ensure your face is visible.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsCapturing(false);
    }
  }, [interviewId, onVerified]);

  // Handle auto-capture for session proctoring
  useEffect(() => {
    if (!autoCapture || !isVerified) return;

    const interval = setInterval(() => {
      captureAndVerify();
    }, captureInterval);

    return () => clearInterval(interval);
  }, [autoCapture, isVerified, captureInterval, captureAndVerify]);

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <UserCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Identity Guard</h3>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">AI Proctoring Enabled</p>
          </div>
        </div>

        {isVerified ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Session Secured</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-500">
            <Scan size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Scan</span>
          </div>
        )}
      </div>

      <div className="p-8 space-y-6">
        {/* Webcam Viewport with Guidance Overlays */}
        <div className="relative group aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover scale-x-[-1]"
            onUserMediaError={() => setError('Camera access denied. Please allow camera permissions in your browser.')}
          />
          
          {/* Pro Scanning Frame */}
          {!isVerified && !error && !isCapturing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-white/20 rounded-full border-dashed animate-spin-slow"></div>
              <div className="absolute inset-12 border-2 border-indigo-500/30 rounded-[3rem]"></div>
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Live Feed</span>
              </div>
            </div>
          )}

          {/* Validation State Overlay */}
          {isCapturing && (
            <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                <RefreshCw size={40} className="text-white animate-spin mb-3" />
                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Authenticating...</span>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in zoom-in-95">
            <AlertCircle className="text-rose-600 shrink-0" size={18} />
            <p className="text-xs font-bold text-rose-800 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-4">
          <button
            onClick={captureAndVerify}
            disabled={isCapturing}
            className={`w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 shadow-xl ${
              isVerified 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-0.5'
            } disabled:opacity-50 disabled:translate-y-0`}
          >
            {isCapturing ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : isVerified ? (
              <RefreshCw size={20} />
            ) : (
              <Video size={20} />
            )}
            {isCapturing ? 'SYSTEM VALIDATING...' : isVerified ? 'RE-SCAN IDENTITY' : 'START IDENTITY SCAN'}
          </button>

          {/* Compliance & Security Footer */}
          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <ShieldCheck className="text-indigo-500 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Privacy Compliance</p>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                To ensure a fair and secure assessment, SimuAI performs periodic facial recognition checks. Data is encrypted and used only for verification purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamVerification;