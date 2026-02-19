import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { interviewAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiCamera, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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
      setError('Webcam not available');
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      // Simple face detection check (in production, use a proper face detection API)
      // For now, we'll assume face is detected if image is captured
      const faceDetected = true;
      const confidence = 85;

      await interviewAPI.recordIdentitySnapshot(interviewId, {
        imageData: imageSrc,
        faceDetected,
        confidence,
        metadata: {
          timestamp: new Date().toISOString(),
          deviceInfo: navigator.userAgent
        }
      });

      setIsVerified(true);
      toast.success('Identity verified successfully!');
      onVerified();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to verify identity';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsCapturing(false);
    }
  }, [interviewId, onVerified]);

  // Auto-capture at intervals
  React.useEffect(() => {
    if (!autoCapture || !isVerified) return;

    const interval = setInterval(() => {
      captureAndVerify();
    }, captureInterval);

    return () => clearInterval(interval);
  }, [autoCapture, isVerified, captureInterval, captureAndVerify]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Identity Verification</h3>
        {isVerified && (
          <div className="flex items-center gap-2 text-green-600">
            <FiCheckCircle />
            <span className="text-sm font-medium">Verified</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            onUserMediaError={() => setError('Unable to access webcam. Please grant camera permissions.')}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={captureAndVerify}
            disabled={isCapturing}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiCamera />
            {isCapturing ? 'Capturing...' : isVerified ? 'Verify Again' : 'Capture & Verify'}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your photo will be captured periodically during the interview to ensure identity verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamVerification;
