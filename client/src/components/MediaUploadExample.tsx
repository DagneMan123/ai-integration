import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { useMediaUpload } from '../hooks/useMediaUpload';
import { UploadProgressBar } from './UploadProgressBar';

interface MediaUploadExampleProps {
  interviewId?: number;
  onVideoUploadSuccess?: (url: string) => void;
  onResumeUploadSuccess?: (url: string) => void;
  onImageUploadSuccess?: (url: string) => void;
}

/**
 * Example component demonstrating media upload functionality
 * Shows how to use the upload hooks and progress tracking
 */
export const MediaUploadExample: React.FC<MediaUploadExampleProps> = ({
  interviewId,
  onVideoUploadSuccess,
  onResumeUploadSuccess,
  onImageUploadSuccess
}) => {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { progress, isUploading, uploadVideo, uploadDoc, uploadImage, reset } = useMediaUpload();
  const [uploadType, setUploadType] = useState<'video' | 'resume' | 'image' | null>(null);

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !interviewId) return;

    setUploadType('video');
    try {
      const result = await uploadVideo(interviewId, file);
      onVideoUploadSuccess?.(result.data.videoUrl);
    } catch (error) {
      console.error('Video upload failed:', error);
    }
  };

  const handleResumeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadType('resume');
    try {
      const result = await uploadDoc(file);
      onResumeUploadSuccess?.(result.data.resumeUrl);
    } catch (error) {
      console.error('Resume upload failed:', error);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadType('image');
    try {
      const result = await uploadImage(file);
      onImageUploadSuccess?.(result.data.profilePictureUrl);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Upload */}
      {interviewId && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Upload Interview Video
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Maximum file size: 100MB. Supported formats: MP4, WebM, MOV, AVI
          </p>
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading && uploadType === 'video'}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isUploading && uploadType === 'video' ? 'Uploading...' : 'Select Video'}
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Resume Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" />
          Upload Resume
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Maximum file size: 50MB. Supported formats: PDF, DOC, DOCX
        </p>
        <button
          onClick={() => resumeInputRef.current?.click()}
          disabled={isUploading && uploadType === 'resume'}
          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isUploading && uploadType === 'resume' ? 'Uploading...' : 'Select Resume'}
        </button>
        <input
          ref={resumeInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeSelect}
          className="hidden"
        />
      </div>

      {/* Profile Picture Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-500" />
          Upload Profile Picture
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Maximum file size: 10MB. Supported formats: JPEG, PNG, GIF, WebP
        </p>
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={isUploading && uploadType === 'image'}
          className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isUploading && uploadType === 'image' ? 'Uploading...' : 'Select Image'}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress Bar */}
      {uploadType && (
        <UploadProgressBar
          progress={progress.progress}
          status={progress.status}
          error={progress.error}
          fileName={`${uploadType} upload`}
          onDismiss={() => {
            setUploadType(null);
            reset();
          }}
        />
      )}

      {/* Upload Stats */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Uploaded:</strong> {(progress.loaded / 1024 / 1024).toFixed(2)}MB / {(progress.total / 1024 / 1024).toFixed(2)}MB
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaUploadExample;
