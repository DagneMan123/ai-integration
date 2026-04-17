import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

interface InterviewProcessingProps {
  responseId: number;
  onComplete: (feedback: any) => void;
  onError: (error: string) => void;
}

const InterviewProcessing: React.FC<InterviewProcessingProps> = ({
  responseId,
  onComplete,
  onError
}) => {
  const [status, setStatus] = useState<'uploading' | 'transcribing' | 'analyzing' | 'complete' | 'error'>('uploading');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Uploading your video...');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/video-analysis/responses/${responseId}/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const data = await response.json();

        if (data.data.status === 'processing') {
          // Still processing, update UI based on progress
          updateProcessingState();
          // Check again in 2 seconds
          setTimeout(checkStatus, 2000);
        } else if (data.data.status === 'completed') {
          // Processing complete, fetch detailed feedback
          setStatus('complete');
          setProgress(100);
          setMessage('Analysis complete!');
          
          const feedbackResponse = await fetch(`/api/video-analysis/responses/${responseId}/feedback`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!feedbackResponse.ok) {
            throw new Error('Failed to fetch feedback');
          }

          const feedbackData = await feedbackResponse.json();
          
          setTimeout(() => {
            onComplete(feedbackData.data);
          }, 1500);
        } else if (data.data.status === 'error') {
          setStatus('error');
          setErrorMessage('Analysis failed. Please try again.');
          onError('Analysis failed');
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        onError(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    checkStatus();
  }, [responseId, onComplete, onError]);

  const updateProcessingState = () => {
    const stages = [
      { status: 'uploading' as const, progress: 20, message: 'Uploading your video...' },
      { status: 'transcribing' as const, progress: 40, message: 'Transcribing your response...' },
      { status: 'analyzing' as const, progress: 70, message: 'Analyzing your performance...' }
    ];

    const currentStage = stages[Math.floor(Math.random() * stages.length)];
    setStatus(currentStage.status);
    setProgress(currentStage.progress);
    setMessage(currentStage.message);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Processing Your Response</h1>
          <p className="text-gray-600">Our AI is analyzing your interview...</p>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-8">
          {status === 'error' ? (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          ) : status === 'complete' ? (
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <Loader className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          )}
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <p className="text-lg font-bold text-gray-900 mb-2">{message}</p>
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
        </div>

        {/* Progress Bar */}
        {status !== 'error' && (
          <div className="mb-8">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  status === 'complete' ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">{progress}% complete</p>
          </div>
        )}

        {/* Processing Steps */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              progress >= 20 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {progress >= 20 ? '✓' : '1'}
            </div>
            <span className={progress >= 20 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              Uploading video
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              progress >= 40 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {progress >= 40 ? '✓' : '2'}
            </div>
            <span className={progress >= 40 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              Transcribing audio
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              progress >= 70 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {progress >= 70 ? '✓' : '3'}
            </div>
            <span className={progress >= 70 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              Analyzing performance
            </span>
          </div>
        </div>

        {/* Tips */}
        {status !== 'error' && status !== 'complete' && (
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-900">Pro Tip</p>
              <p className="text-xs text-blue-800 mt-1">
                This usually takes 30-60 seconds. Feel free to grab a coffee!
              </p>
            </div>
          </div>
        )}

        {/* Error Action */}
        {status === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewProcessing;
