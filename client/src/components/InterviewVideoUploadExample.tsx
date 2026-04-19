import React, { useState } from 'react';
import { MediaUploadWidget } from './MediaUploadWidget';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InterviewVideoUploadExampleProps {
  interviewId: number;
  onVideoUploaded?: (videoUrl: string) => void;
}

/**
 * Example component showing how to use MediaUploadWidget for interview videos
 * This can be integrated into InterviewSession or similar components
 */
export const InterviewVideoUploadExample: React.FC<InterviewVideoUploadExampleProps> = ({
  interviewId,
  onVideoUploaded
}) => {
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadSuccess = (data: any) => {
    setUploadedVideoUrl(data.videoUrl);
    setUploadError(null);

    if (onVideoUploaded) {
      onVideoUploaded(data.videoUrl);
    }
  };

  const handleUploadError = (error: any) => {
    setUploadError(error.message || 'Upload failed');
    setUploadedVideoUrl(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Interview Video</h2>
        <p className="text-gray-600">
          Record and upload your interview response. Maximum file size: 100MB
        </p>
      </div>

      {/* Upload Widget */}
      <MediaUploadWidget
        type="video"
        interviewId={interviewId}
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
        className="mb-6"
      />

      {/* Success Message */}
      {uploadedVideoUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800 mb-1">Video Uploaded Successfully</h3>
            <p className="text-sm text-green-700 mb-3">
              Your interview video has been uploaded and is being processed.
            </p>
            <a
              href={uploadedVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              View uploaded video
            </a>
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">Upload Failed</h3>
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Upload Tips</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>✓ Supported formats: MP4, WebM, MOV, AVI</li>
          <li>✓ Maximum file size: 100MB</li>
          <li>✓ Recommended: MP4 format for best compatibility</li>
          <li>✓ Ensure good lighting and clear audio</li>
          <li>✓ Test your camera and microphone before recording</li>
        </ul>
      </div>
    </div>
  );
};

export default InterviewVideoUploadExample;
