import React from 'react';
import { Upload, Zap } from 'lucide-react';

interface VideoProcessingOverlayProps {
  isVisible: boolean;
  stage: 'uploading' | 'analyzing' | 'complete';
  uploadProgress: number;
  message?: string;
}

const VideoProcessingOverlay: React.FC<VideoProcessingOverlayProps> = ({
  isVisible,
  stage,
  uploadProgress,
  message,
}) => {
  if (!isVisible) return null;

  const stageMessages = {
    uploading: 'Uploading your video...',
    analyzing: 'AI is analyzing your response...',
    complete: 'Processing complete!',
  };

  const stageIcons = {
    uploading: <Upload className="w-12 h-12 text-blue-500" />,
    analyzing: <Zap className="w-12 h-12 text-purple-500" />,
    complete: <div className="w-12 h-12 text-green-500">✓</div>,
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-12 max-w-md w-full mx-4 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {stage !== 'complete' && (
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"></div>
            )}
            <div className="relative">{stageIcons[stage]}</div>
          </div>
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          {message || stageMessages[stage]}
        </h3>

        {/* Progress Bar */}
        {stage === 'uploading' && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center mt-3">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}

        {/* Analyzing Animation */}
        {stage === 'analyzing' && (
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}

        {/* Status Text */}
        <p className="text-sm text-gray-500 text-center mt-4">
          {stage === 'uploading' && 'Please keep this window open'}
          {stage === 'analyzing' && 'This may take a few moments'}
          {stage === 'complete' && 'Ready to continue'}
        </p>
      </div>
    </div>
  );
};

export default VideoProcessingOverlay;
