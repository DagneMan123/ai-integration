import React, { useState, useRef, useEffect } from 'react';
import { Clock, Mic, Square, Send, ChevronRight, AlertCircle, CheckCircle2, Volume2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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

  const startRecording = () => {
    if (demoMode) {
      setIsRecording(true);
      setRecordingTime(0);
      toast.success('Demo recording started');
      return;
    }

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

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    toast.success('Recording started');
  };

  const stopRecording = () => {
    if (demoMode) {
      setIsRecording(false);
      toast.success('Demo recording stopped');
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitResponse = async () => {
    if (demoMode) {
      // In demo mode, create a mock response
      const newResponse = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        videoBlob: new Blob(['demo'], { type: 'video/webm' }),
        recordingTime,
        timestamp: new Date()
      };

      setResponses([...responses, newResponse]);
      setRecordingTime(0);

      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        toast.success('Response saved. Moving to next question.');
      } else {
        handleEndSession();
      }
      return;
    }

    if (chunksRef.current.length === 0) {
      toast.error('Please record an answer first');
      return;
    }

    try {
      setIsRecording(false);
      toast.loading('Uploading video...');

      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      
      // Convert blob to base64 for transmission
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Video = reader.result as string;

        try {
          // Submit video to backend
          const response = await fetch(`/api/video-analysis/responses/1/${currentQuestion.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              videoBlob: base64Video,
              recordingTime
            })
          });

          if (!response.ok) {
            throw new Error('Failed to upload video');
          }

          const data = await response.json();
          const responseId = data.data.responseId;

          toast.dismiss();
          toast.success('Video uploaded! Processing started...');

          // Notify parent about processing
          onProcessing?.(responseId);

          // Store response locally
          const newResponse = {
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            videoBlob,
            recordingTime,
            responseId,
            timestamp: new Date()
          };

          setResponses([...responses, newResponse]);
          chunksRef.current = [];
          setRecordingTime(0);

          if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            toast.success('Response saved. Moving to next question.');
          } else {
            handleEndSession();
          }
        } catch (error) {
          toast.dismiss();
          console.error('Upload error:', error);
          toast.error('Failed to upload video. Please try again.');
        }
      };
      reader.readAsDataURL(videoBlob);
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    }
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
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
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

          {/* Controls */}
          <div className="flex flex-wrap gap-3 justify-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
              >
                <Square className="w-5 h-5" />
                Stop Recording
              </button>
            )}

            {!isRecording && chunksRef.current.length > 0 && (
              <button
                onClick={submitResponse}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                <Send className="w-5 h-5" />
                Submit & Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onCancel}
              className="flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-all"
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
