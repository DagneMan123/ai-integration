import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

interface UploadProgressBarProps {
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'idle';
  error?: string;
  fileName?: string;
  onDismiss?: () => void;
}

/**
 * Professional upload progress bar component
 * Shows real-time upload progress with status indicators
 */
export const UploadProgressBar: React.FC<UploadProgressBarProps> = ({
  progress,
  status,
  error,
  fileName,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  if (!isVisible) return null;

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="w-5 h-5 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${progress}%`;
      case 'completed':
        return 'Upload completed successfully';
      case 'error':
        return error || 'Upload failed';
      default:
        return 'Ready to upload';
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 w-96 rounded-lg shadow-lg p-4 ${
      status === 'error' ? 'bg-red-50 border border-red-200' :
      status === 'completed' ? 'bg-green-50 border border-green-200' :
      'bg-white border border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex-shrink-0 text-${
          status === 'error' ? 'red' :
          status === 'completed' ? 'green' :
          'blue'
        }-500`}>
          {getStatusIcon()}
        </div>

        <div className="flex-1 min-w-0">
          {fileName && (
            <p className="text-sm font-medium text-gray-900 truncate mb-1">
              {fileName}
            </p>
          )}

          <p className={`text-sm font-medium ${
            status === 'error' ? 'text-red-700' :
            status === 'completed' ? 'text-green-700' :
            'text-gray-700'
          }`}>
            {getStatusText()}
          </p>

          {status === 'uploading' && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getStatusColor()} transition-all duration-300 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {status === 'error' && error && (
            <p className="text-xs text-red-600 mt-1">
              {error}
            </p>
          )}
        </div>

        {(status === 'completed' || status === 'error') && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadProgressBar;
