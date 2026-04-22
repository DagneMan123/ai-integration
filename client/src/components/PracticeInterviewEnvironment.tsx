import React, { useState, useRef, useEffect } from 'react';
import { Clock, Mic, Square, Send, ChevronRight, AlertCircle, CheckCircle2, Volume2, Zap, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Question {
  id: number;
  text: string;
  type: string;
  difficulty: string;
}

interface PracticeInterviewEnvironmentProps {
  sessionType: string;
  questions: Question[];
  duration: number;
  onComplete: (responses: any[]) => void;
  onCancel: () => void;
  demoMode?: boolean;
  onProcessing?: (responseId: number) => void;
}

// STATE MACHINE: Recording states
type RecordingState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'READY_TO_UPLOAD';

const PracticeInterviewEnvironment: React.FC<PracticeInterviewEnvironmentProps> = ({
  sessionType,
  questions,
  duration,
  onComplete,
  onCancel,
  demoMode = false,
  onProcessing
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [recordingTime, setRecordingTime] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [recordingMimeType, setRecordingMimeType] = useState<string>('video/webm');
  
  // STATE MACHINE: Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('IDLE');
  
  // UPLOAD STATE: Track upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordingPromiseRef = useRef<Promise<Blob> | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isRecording = recordingState === 'RECORDING';

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      if (demoMode) {
        // Demo mode: simulate microphone volume
        const simulateVolume = () => {
          setMicVolume(Math.floor(Math.random() * 60 + 20));
          requestAnimationFrame(simulateVolume);
        };
        simulateVolume();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup audio analysis
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyserRef.current = analyser;

        // Monitor volume
        const monitorVolume = () => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setMicVolume(Math.round(average));
          requestAnimationFrame(monitorVolume);
        };
        monitorVolume();
      } catch (error) {
        console.error('Camera initialization failed:', error);
        toast.error('Failed to access camera');
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [demoMode]);

  const handleEndSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onComplete(responses);
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleEndSession();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleEndSession]);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;

    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording]);

  // AUTO-UPLOAD TRIGGER: When blob is ready, automatically upload
  useEffect(() => {
    if (recordingState === 'READY_TO_UPLOAD' && recordedVideo && !isUploading) {
      console.log('[Practice Interview] Blob ready - triggering auto-upload');
      uploadToCloudinaryAndSync();
    }
  }, [recordingState, recordedVideo, isUploading]);

  const startRecording = () => {
    if (demoMode) {
      setRecordingState('RECORDING');
      setRecordingTime(0);
      toast.success('Demo recording started');
      return;
    }

    if (!streamRef.current) {
      toast.error('Camera not initialized');
      return;
    }

    // CLEANUP: Clear chunks array before starting new recording
    chunksRef.current = [];
    setRecordedVideo(null);
    setUploadError(null);
    
    console.log('[Practice Interview] Starting recording - chunks cleared');

    // EXPLICIT MIME TYPE: Check for supported types
    let mimeType = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      mimeType = 'video/webm;codecs=vp8';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    }

    console.log('[Practice Interview] MediaRecorder MIME type selected:', mimeType);

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    setRecordingMimeType(mimeType);

    // CREATE PROMISE: Wrap onstop in a Promise
    const recordingPromise = new Promise<Blob>((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('[Practice Interview] Chunk added:', {
            chunkSize: `${(event.data.size / 1024).toFixed(2)}KB`,
            totalChunks: chunksRef.current.length
          });
        }
      };

      // BLOB CREATION: In onstop event, create final Blob
      mediaRecorder.onstop = () => {
        console.log('[Practice Interview] MediaRecorder stopped - creating blob', {
          chunksCount: chunksRef.current.length,
          totalSize: `${(chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0) / 1024 / 1024).toFixed(2)}MB`
        });

        if (chunksRef.current.length === 0) {
          console.error('[Practice Interview] No chunks available');
          setRecordingState('IDLE');
          reject(new Error('Recording failed: No chunks collected'));
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });
        
        console.log('[Practice Interview] Blob created successfully', {
          blobSize: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
          blobType: blob.type
        });

        if (blob.size === 0) {
          console.error('[Practice Interview] Blob is empty');
          setRecordingState('IDLE');
          reject(new Error('Recording failed: Blob is empty'));
          return;
        }

        // CRITICAL: Set blob and mark as ready
        setRecordedVideo(blob);
        console.log('[Practice Interview] Blob ready for upload');
        setRecordingState('READY_TO_UPLOAD');
        resolve(blob);
      };

      mediaRecorder.onerror = (event: Event) => {
        const errorEvent = event as any;
        console.error('[Practice Interview] MediaRecorder error:', errorEvent.error);
        setRecordingState('IDLE');
        reject(new Error(`Recording error: ${errorEvent.error}`));
      };
    });

    recordingPromiseRef.current = recordingPromise;
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecordingState('RECORDING');
    setRecordingTime(0);
    console.log('[Practice Interview] Recording started');
    toast.success('Recording started');
  };

  const stopRecording = () => {
    if (demoMode) {
      setRecordingState('PROCESSING');
      setTimeout(() => {
        setRecordedVideo(new Blob(['demo'], { type: 'video/webm' }));
        setRecordingState('READY_TO_UPLOAD');
      }, 500);
      toast.success('Demo recording stopped');
      return;
    }

    if (mediaRecorderRef.current && recordingState === 'RECORDING') {
      console.log('[Practice Interview] Stopping recording');
      setRecordingState('PROCESSING');
      
      if (mediaRecorderRef.current.state === 'recording') {
        console.log('[Practice Interview] Flushing buffer with requestData()');
        mediaRecorderRef.current.requestData();
      }
      
      mediaRecorderRef.current.stop();
      console.log('[Practice Interview] Recording stopped - waiting for onstop event');
    }
  };

  // DIRECT CLOUDINARY UPLOAD: Upload blob directly to Cloudinary, then sync with backend
  const uploadToCloudinaryAndSync = async () => {
    if (!recordedVideo) {
      console.error('[Practice Interview] No blob available');
      setRecordingState('IDLE');
      toast.error('No recording available. Please try again.');
      return;
    }

    if (demoMode) {
      // Demo mode: simulate upload
      const newResponse = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        videoUrl: 'https://demo.cloudinary.com/video.webm',
        recordingTime,
        timestamp: new Date()
      };
      setResponses([...responses, newResponse]);
      setRecordingTime(0);
      setRecordedVideo(null);
      setRecordingState('IDLE');
      
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleEndSession();
      }
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      console.log('[Practice Interview] Starting Cloudinary upload');

      // STEP 1: Upload to Cloudinary directly
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dm5rf4yzc';
      const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET_VIDEO || 'simuai_video_preset';

      // Determine file extension
      let fileExtension = '.webm';
      if (recordingMimeType.includes('mp4')) {
        fileExtension = '.mp4';
      } else if (recordingMimeType.includes('ogg')) {
        fileExtension = '.ogg';
      }

      const formData = new FormData();
      formData.append('file', recordedVideo, `response_${Date.now()}${fileExtension}`);
      formData.append('upload_preset', uploadPreset);
      formData.append('resource_type', 'video');
      formData.append('folder', 'simuai/videos');

      console.log('[Practice Interview] Uploading to Cloudinary', {
        cloudName,
        uploadPreset,
        fileSize: `${(recordedVideo.size / 1024 / 1024).toFixed(2)}MB`
      });

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
              console.log(`[Practice Interview] Upload progress: ${percentCompleted}%`);
            }
          },
          timeout: 600000
        }
      );

      const videoUrl = uploadResponse.data.secure_url;
      console.log('[Practice Interview] Cloudinary upload complete:', videoUrl);

      // STEP 2: Sync with backend - send only URL and token
      console.log('[Practice Interview] Syncing with backend');
      
      // TOKEN INJECTION: Get token from localStorage at exact moment of upload
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('[Practice Interview] Calling backend endpoint:', {
        endpoint: '/api/interviews/save-recording',
        videoUrl: videoUrl ? 'provided' : 'missing',
        questionId: currentQuestion.id,
        recordingTime,
        hasToken: !!token
      });

      const backendResponse = await axios.post(
        '/api/interviews/save-recording',
        {
          videoUrl,
          questionId: currentQuestion.id,
          recordingTime
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[Practice Interview] Backend sync complete:', backendResponse.data);
      console.log('[Practice Interview] Response status:', backendResponse.status);
      console.log('[Practice Interview] Response headers:', backendResponse.headers);

      // STEP 3: Update UI and move to next question
      const newResponse = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        videoUrl,
        recordingTime,
        timestamp: new Date()
      };

      setResponses([...responses, newResponse]);
      setRecordingTime(0);
      setRecordedVideo(null);
      setRecordingState('IDLE');
      setUploadProgress(0);
      setIsUploading(false);

      toast.success('Response saved!');

      // Move to next question or complete
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        console.log('[Practice Interview] All questions completed');
        handleEndSession();
      }
    } catch (error) {
      console.error('[Practice Interview] Upload error:', error);
      const err = error as any;
      console.error('[Practice Interview] Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.config?.url,
        method: err.config?.method,
        data: err.response?.data,
        headers: err.response?.headers
      });
      setIsUploading(false);
      setRecordingState('READY_TO_UPLOAD');

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setUploadError('Authentication failed. Please log in again.');
          toast.error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          setUploadError('Backend endpoint not found. Please check server is running.');
          toast.error('Backend endpoint not found. Please check server is running.');
          console.error('[Practice Interview] 404 Error - Backend endpoint not found at:', error.config?.url);
        } else if (error.response?.status === 413) {
          setUploadError('Video file too large (max 100MB)');
          toast.error('Video file too large (max 100MB)');
        } else if (error.response?.status === 400) {
          const errorMsg = error.response.data?.error?.message || 'Invalid video format';
          setUploadError(errorMsg);
          toast.error(`Upload failed: ${errorMsg}`);
        } else {
          setUploadError(error.message);
          toast.error(`Upload failed: ${error.message}`);
        }
      } else {
        setUploadError('Upload failed. Please try again.');
        toast.error('Upload failed. Please try again.');
      }
    }
  };

  // MANUAL SUBMIT: For manual submission or retry
  const handleSubmit = async () => {
    if (recordingState !== 'READY_TO_UPLOAD') {
      toast.error('Video is not ready. Please wait...');
      return;
    }
    await uploadToCloudinaryAndSync();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timeWarning = timeLeft < 300; // Less than 5 minutes

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                {sessionType} Interview
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-400">
                  Q{currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border-2 transition-all ${
            timeWarning ? 'bg-red-900/20 border-red-500 animate-pulse' : 'bg-gray-800 border-gray-700'
          }`}>
            <Clock className={`w-5 h-5 ${timeWarning ? 'text-red-500' : 'text-blue-400'}`} />
            <span className={`text-lg font-black tabular-nums ${timeWarning ? 'text-red-500' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-6 p-6">
        {/* Video Feed - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">
                {currentQuestion.type}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase">
                {currentQuestion.difficulty}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Video Preview */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border-2 border-gray-700">
            {demoMode ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold">Demo Mode</p>
                  <p className="text-purple-200 text-sm">Camera simulation active</p>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-bold">{formatTime(recordingTime)}</span>
              </div>
            )}

            {/* Microphone Volume Indicator */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-gray-900/80 text-white px-4 py-2 rounded-full">
              <Volume2 className="w-4 h-4" />
              <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ width: `${Math.min(micVolume, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-4">
                <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white mb-2">Uploading to Cloudinary...</p>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{uploadProgress}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-3 justify-center">
            {recordingState === 'IDLE' ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </button>
            ) : recordingState === 'RECORDING' ? (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
              >
                <Square className="w-5 h-5" />
                Stop Recording
              </button>
            ) : recordingState === 'PROCESSING' ? (
              <button
                disabled
                className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl font-bold cursor-not-allowed"
              >
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Processing Video...
              </button>
            ) : recordingState === 'READY_TO_UPLOAD' && recordedVideo ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    isUploading
                      ? 'bg-blue-500 text-white cursor-wait'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Submit Response'}
                  {isUploading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {uploadError && (
                  <button
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Retry Upload
                  </button>
                )}
              </>
            ) : null}

            <button
              onClick={onCancel}
              disabled={isUploading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                isUploading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              End Session
            </button>
          </div>
        </div>

        {/* Sidebar - Tips & Guidelines */}
        <div className="space-y-6">
          {/* Tips Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Interview Tips
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-600 font-bold">•</span>
                Look directly at the camera
              </li>
              <li className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-600 font-bold">•</span>
                Speak clearly and at a natural pace
              </li>
              <li className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-600 font-bold">•</span>
                Take a moment to think before answering
              </li>
              <li className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-600 font-bold">•</span>
                Avoid distractions in the background
              </li>
            </ul>
          </div>

          {/* Session Info */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">Session Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Total Questions</p>
                <p className="text-lg font-bold text-blue-600">{questions.length}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Time Remaining</p>
                <p className="text-lg font-bold text-blue-600">{formatTime(timeLeft)}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Responses Saved</p>
                <p className="text-lg font-bold text-blue-600">{responses.length}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          {timeWarning && (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900 text-sm">Time Running Out</p>
                <p className="text-xs text-red-800 mt-1">Less than 5 minutes remaining. Hurry up!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeInterviewEnvironment;
