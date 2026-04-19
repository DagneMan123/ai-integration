import { useState, useCallback } from 'react';
import {
  uploadInterviewVideo,
  uploadResume,
  uploadProfilePicture
} from '../services/mediaUploadService';

interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UseMediaUploadReturn {
  progress: UploadProgress;
  isUploading: boolean;
  uploadVideo: (interviewId: number, file: File) => Promise<any>;
  uploadDoc: (file: File) => Promise<any>;
  uploadImage: (file: File) => Promise<any>;
  reset: () => void;
}

/**
 * Custom hook for managing media uploads with progress tracking
 */
export const useMediaUpload = (): UseMediaUploadReturn => {
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    loaded: 0,
    total: 0,
    status: 'uploading'
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleProgress = useCallback((newProgress: UploadProgress) => {
    setProgress(newProgress);
  }, []);

  const uploadVideo = useCallback(
    async (interviewId: number, file: File) => {
      setIsUploading(true);
      setProgress({
        progress: 0,
        loaded: 0,
        total: file.size,
        status: 'uploading'
      });

      try {
        const result = await uploadInterviewVideo(interviewId, file, handleProgress);
        setProgress({
          progress: 100,
          loaded: file.size,
          total: file.size,
          status: 'completed'
        });
        return result;
      } catch (error) {
        setProgress({
          progress: 0,
          loaded: 0,
          total: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [handleProgress]
  );

  const uploadDoc = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setProgress({
        progress: 0,
        loaded: 0,
        total: file.size,
        status: 'uploading'
      });

      try {
        const result = await uploadResume(file, handleProgress);
        setProgress({
          progress: 100,
          loaded: file.size,
          total: file.size,
          status: 'completed'
        });
        return result;
      } catch (error) {
        setProgress({
          progress: 0,
          loaded: 0,
          total: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [handleProgress]
  );

  const uploadImage = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setProgress({
        progress: 0,
        loaded: 0,
        total: file.size,
        status: 'uploading'
      });

      try {
        const result = await uploadProfilePicture(file, handleProgress);
        setProgress({
          progress: 100,
          loaded: file.size,
          total: file.size,
          status: 'completed'
        });
        return result;
      } catch (error) {
        setProgress({
          progress: 0,
          loaded: 0,
          total: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [handleProgress]
  );

  const reset = useCallback(() => {
    setProgress({
      progress: 0,
      loaded: 0,
      total: 0,
      status: 'uploading'
    });
    setIsUploading(false);
  }, []);

  return {
    progress,
    isUploading,
    uploadVideo,
    uploadDoc,
    uploadImage,
    reset
  };
};

export default useMediaUpload;
