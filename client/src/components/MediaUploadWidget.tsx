import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadInterviewVideo, uploadResume, uploadProfilePicture } from '../services/mediaUploadService';

interface MediaUploadWidgetProps {
  type: 'video' | 'resume' | 'profile-picture';
  interviewId?: number;
  onSuccess: (data: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  className?: string;
}

export const MediaUploadWidget: React.FC<MediaUploadWidgetProps> = ({
  type,
  interviewId,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptTypes = () => {
    switch (type) {
      case 'video':
        return 'video/mp4,video/webm,video/quicktime,video/x-msvideo';
      case 'resume':
        return '.pdf,.doc,.docx,.txt,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'profile-picture':
        return 'image/jpeg,image/png,image/webp,image/gif';
      default:
        return '*/*';
    }
  };

  const getMaxSize = () => {
    switch (type) {
      case 'video':
        return 104857600; // 100MB
      case 'resume':
        return 52428800; // 50MB
      case 'profile-picture':
        return 10485760; // 10MB
      default:
        return 52428800;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'video':
        return 'Upload Interview Video';
      case 'resume':
        return 'Upload Resume';
      case 'profile-picture':
        return 'Upload Profile Picture';
      default:
        return 'Upload File';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setProgress(0);
    setUploadStatus('uploading');
    setIsUploading(true);
    setErrorMessage('');

    // Log token status before upload
    const token = localStorage.getItem('token');
    console.log('[MediaUploadWidget] Upload starting');
    console.log('[MediaUploadWidget] Token in localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('[MediaUploadWidget] File:', file.name, 'Type:', file.type, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');

    try {
      let result;

      switch (type) {
        case 'video':
          if (!interviewId) {
            throw new Error('Interview ID is required for video upload');
          }
          console.log('[MediaUploadWidget] Uploading video for interview:', interviewId);
          result = await uploadInterviewVideo(interviewId, file, (progress) => {
            setProgress(progress.progress);
          });
          break;

        case 'resume':
          console.log('[MediaUploadWidget] Uploading resume');
          result = await uploadResume(file, (progress) => {
            setProgress(progress.progress);
          });
          break;

        case 'profile-picture':
          console.log('[MediaUploadWidget] Uploading profile picture');
          result = await uploadProfilePicture(file, (progress) => {
            setProgress(progress.progress);
          });
          break;

        default:
          throw new Error('Unknown upload type');
      }

      console.log('[MediaUploadWidget] Upload completed successfully');
      setProgress(100);
      setUploadStatus('success');
      setIsUploading(false);

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setProgress(0);
        setFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error: any) {
      const errorMsg = error.message || 'Upload failed. Please try again.';
      console.error('[MediaUploadWidget] Upload error:', errorMsg);
      setErrorMessage(errorMsg);
      setUploadStatus('error');
      setIsUploading(false);

      if (onError) {
        onError(error);
      }

      // Reset after 5 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setProgress(0);
        setErrorMessage('');
        setFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 5000);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;

      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          disabled || isUploading
            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-300'
            : uploadStatus === 'success'
            ? 'border-green-300 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {uploadStatus === 'idle' && (
          <>
            <Upload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <p className="text-lg font-semibold text-gray-800 mb-1">{getLabel()}</p>
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your file here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Maximum file size: {(getMaxSize() / 1024 / 1024).toFixed(0)}MB
            </p>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <>
            <Loader className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-spin" />
            <p className="text-lg font-semibold text-gray-800 mb-3">Uploading...</p>
            <p className="text-sm text-gray-600 mb-4">{fileName}</p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-gray-700">{progress}%</p>
          </>
        )}

        {uploadStatus === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-semibold text-green-800 mb-1">Upload Successful!</p>
            <p className="text-sm text-green-700">{fileName}</p>
          </>
        )}

        {uploadStatus === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-lg font-semibold text-red-800 mb-2">Upload Failed</p>
            <p className="text-sm text-red-700 mb-2">{errorMessage}</p>
            <p className="text-xs text-red-600">Click to try again</p>
          </>
        )}
      </div>

      {/* File Size Warning */}
      {uploadStatus === 'idle' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Tip:</strong> For faster uploads, ensure your file is under{' '}
            {(getMaxSize() / 1024 / 1024 / 2).toFixed(0)}MB
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaUploadWidget;
