import React, { useState } from 'react';
import axios from 'axios';
import {
  uploadVideoDirectToCloudinary,
  uploadDocumentDirectToCloudinary,
  uploadImageDirectToCloudinary
} from '../services/directCloudinaryUpload';
import { apiService } from '../services/apiService';

interface DirectUploadProps {
  interviewId?: number;
  uploadType: 'video' | 'document' | 'image';
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

/**
 * Direct Cloudinary Upload Component
 * Uploads directly to Cloudinary, bypassing backend
 * Then saves URL to backend database
 */
export const DirectCloudinaryUpload: React.FC<DirectUploadProps> = ({
  interviewId,
  uploadType,
  onSuccess,
  onError
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);
    setUploading(true);

    try {
      console.log('[DirectUpload] File selected:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        type: file.type,
        uploadType
      });

      let uploadResult;

      // Step A: Upload directly to Cloudinary
      if (uploadType === 'video') {
        uploadResult = await uploadVideoDirectToCloudinary(file, (prog) => {
          setProgress(prog.progress);
        });
      } else if (uploadType === 'document') {
        uploadResult = await uploadDocumentDirectToCloudinary(file, (prog) => {
          setProgress(prog.progress);
        });
      } else if (uploadType === 'image') {
        uploadResult = await uploadImageDirectToCloudinary(file, (prog) => {
          setProgress(prog.progress);
        });
      }

      if (!uploadResult) {
        throw new Error('Upload failed');
      }

      console.log('[DirectUpload] File uploaded to Cloudinary:', {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        size: uploadResult.size
      });

      setProgress(100);
      setUploadedUrl(uploadResult.secure_url);

      // Step B: Send URL to backend for database storage
      console.log('[DirectUpload] Saving URL to backend database...');

      if (uploadType === 'video' && interviewId) {
        await apiService.post(`/media-link/interview-video/${interviewId}`, {
          videoUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          duration: uploadResult.duration
        });
        console.log('[DirectUpload] Video URL saved to database');
      } else if (uploadType === 'document') {
        await apiService.post('/media-link/resume', {
          resumeUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
        console.log('[DirectUpload] Resume URL saved to database');
      } else if (uploadType === 'image') {
        await apiService.post('/media-link/profile-picture', {
          profilePictureUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
        console.log('[DirectUpload] Profile picture URL saved to database');
      }

      console.log('[DirectUpload] Upload complete!');
      if (onSuccess) {
        onSuccess(uploadResult.secure_url);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      console.error('[DirectUpload] Error:', errorMessage);
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const getAcceptType = () => {
    switch (uploadType) {
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
      case 'image':
        return 'image/*';
      default:
        return '*/*';
    }
  };

  const getLabel = () => {
    switch (uploadType) {
      case 'video':
        return 'Upload Interview Video';
      case 'document':
        return 'Upload Resume';
      case 'image':
        return 'Upload Profile Picture';
      default:
        return 'Upload File';
    }
  };

  return (
    <div className="direct-upload-container" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '15px' }}>
        <label
          htmlFor={`file-input-${uploadType}`}
          style={{
            display: 'block',
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          {uploading ? `Uploading... ${progress}%` : getLabel()}
        </label>
        <input
          id={`file-input-${uploadType}`}
          type="file"
          accept={getAcceptType()}
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      {progress > 0 && progress < 100 && (
        <div style={{ marginBottom: '15px' }}>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#28a745',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            {progress}% uploaded
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '15px'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadedUrl && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            marginBottom: '15px'
          }}
        >
          <strong>Success!</strong> File uploaded and saved to database.
          <br />
          <small style={{ wordBreak: 'break-all' }}>{uploadedUrl}</small>
        </div>
      )}
    </div>
  );
};

export default DirectCloudinaryUpload;
