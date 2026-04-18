import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Play, 
  Square, 
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiInterviewService } from '../services/aiInterviewService';
import VideoPreviewModal from './VideoPreviewModal';
import VideoProcessingOverlay from './VideoProcessingOverlay';
import { uploadVideoToCloudinary, createVideoPreviewUrl, revokeVideoPreviewUrl } from '../services/cloudinaryService';

interface AIVideoInterviewProps {
  interviewId: number;
  questionId: number;
  question: string;
  onComplete: (videoBlob: Blob) => void;
  onSkip?: () => void;
}

const AIVideoInterview: React.FC<AIVideoInterviewProps> = ({
  interviewId,
  questionId,
  question,
  onComplete,
  onSkip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  // New state for preview and processing
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [processingStage, setProcessingStage] = useState<'uploading' | 'analyzing' | 'complete'>('uploading');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProcessing, setShowProcessing] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (previewUrl) {
        revokeVideoPreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setIsMicOn(true);
      toast.success('Camera and microphone ready');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera or microphone');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
    setIsMicOn(false);
  };

  const startRecording = () => {
    if (!streamRef.current) {
      toast.error('Camera not initialized');
      return;
    }

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      
      // Create preview URL
      const url = createVideoPreviewUrl(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    toast.success('Recording started');
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const handleRetake = () => {
    setShowPreview(false);
    if (previewUrl) {
      revokeVideoPreviewUrl(previewUrl);
      setPreviewUrl(null);
    }
    setVideoBlob(null);
    chunksRef.current = [];
  };

  const handleConfirmSubmit = async () => {
    if (!videoBlob) {
      toast.error('No video to submit');
      return;
    }

    setShowPreview(false);
    setShowProcessing(true);
    setProcessingStage('uploading');
    setUploadProgress(0);
    setIsSubmitting(true);

    try {
      const hasCloudinaryConfig = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME && 
                                  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
      
      let videoUrl: string | null = null;
      let uploadedToCloudinary = false;

      // Try Cloudinary upload if configured
      if (hasCloudinaryConfig) {
        try {
          console.log('Attempting Cloudinary upload...');
          const cloudinaryResponse = await uploadVideoToCloudinary(videoBlob, (event) => {
            setUploadProgress(event.percentage);
          });
          
          videoUrl = cloudinaryResponse.secure_url;
          uploadedToCloudinary = true;
          setCloudinaryUrl(videoUrl);
          console.log('Cloudinary upload successful');
        } catch (cloudinaryError) {
          console.warn('Cloudinary upload failed, falling back to direct upload:', cloudinaryError);
          toast.error('Using direct upload (Cloudinary unavailable)');
          // Fall through to direct upload
        }
      } else {
        console.log('Cloudinary not configured, using direct upload');
      }

      // If Cloudinary failed or not configured, use direct backend upload
      if (!videoUrl) {
        console.log('Uploading video directly to backend...');
        setUploadProgress(0);
        
        const response = await aiInterviewService.submitVideoResponse(
          interviewId,
          questionId,
          videoBlob
        );
        
        videoUrl = response.data.videoUrl;
        uploadedToCloudinary = false;
        console.log('Direct upload successful:', videoUrl);
      }

      setProcessingStage('analyzing');

      // If we haven't submitted yet (Cloudinary path), submit now
      if (uploadedToCloudinary && videoUrl) {
        await aiInterviewService.submitVideoResponse(
          interviewId,
          questionId,
          videoUrl
        );
      }

      // Get AI analysis
      try {
        const analysis = await aiInterviewService.analyzeVideoResponse(interviewId, questionId);
        setAiAnalysis(analysis.data);
      } catch (analysisError) {
        console.warn('AI analysis failed:', analysisError);
        // Continue even if analysis fails
      }

      setProcessingStage('complete');
      
      setTimeout(() => {
        setShowProcessing(false);
        toast.success('Response submitted successfully');
        onComplete(videoBlob);
      }, 1500);
    } catch (error) {
      console.error('Error submitting response:', error);
      setShowProcessing(false);
      
      // Provide specific error messages
      if (error instanceof Error) {
        if (error.message.includes('File too large')) {
          toast.error('Video file is too large (max 100MB)');
        } else if (error.message.includes('Invalid file type')) {
          toast.error('Invalid video format. Use WebM, MP4, MOV, or AVI');
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
      } else {
        toast.error('Failed to submit response. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Question Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Brain size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interview Question</h3>
            <p className="text-slate-700 text-lg leading-relaxed">{question}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Clock size={16} /> Max 2 minutes
              </span>
              <span className="flex items-center gap-1">
                <Eye size={16} /> AI Proctored
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video border-2 border-slate-700">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
        
        {!isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur">
            <div className="text-center">
              <VideoOff size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 font-semibold">Camera is off</p>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-bold">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* AI Analysis Overlay */}
        {aiAnalysis && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex items-end p-6">
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={20} />
                <span className="font-semibold">AI Analysis Complete</span>
              </div>
              <div className="bg-slate-800/90 rounded-lg p-4 space-y-2">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Score:</span> {aiAnalysis.score}/100
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Feedback:</span> {aiAnalysis.feedback}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!isCameraOn ? (
          <button
            onClick={startCamera}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            <Video size={20} /> Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                isCameraOn
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
              {isCameraOn ? 'Camera On' : 'Camera Off'}
            </button>

            <button
              onClick={toggleMic}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                isMicOn
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              {isMicOn ? 'Mic On' : 'Mic Off'}
            </button>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
              >
                <Play size={20} /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
              >
                <Square size={20} /> Stop Recording
              </button>
            )}

            {onSkip && (
              <button
                onClick={onSkip}
                className="flex items-center gap-2 bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all"
              >
                Skip Question
              </button>
            )}

            <button
              onClick={stopCamera}
              className="flex items-center gap-2 bg-slate-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all"
            >
              <VideoOff size={20} /> Stop Camera
            </button>
          </>
        )}
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-amber-900">
          <p className="font-semibold mb-1">Interview Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Look directly at the camera</li>
            <li>• Speak clearly and at a natural pace</li>
            <li>• Take a moment to think before answering</li>
            <li>• Avoid distractions in the background</li>
          </ul>
        </div>
      </div>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={showPreview}
        videoUrl={previewUrl || ''}
        onClose={handleRetake}
        onConfirm={handleConfirmSubmit}
        onRetake={handleRetake}
        isLoading={isSubmitting}
      />

      {/* Processing Overlay */}
      <VideoProcessingOverlay
        isVisible={showProcessing}
        stage={processingStage}
        uploadProgress={uploadProgress}
        message={
          processingStage === 'uploading'
            ? 'Uploading your video to secure storage...'
            : processingStage === 'analyzing'
            ? 'AI is analyzing your response...'
            : 'Processing complete!'
        }
      />
    </div>
  );
};

export default AIVideoInterview;
