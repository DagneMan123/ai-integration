import { AxiosProgressEvent } from 'axios';
import { apiService } from './apiService';

interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    [key: string]: any;
  };
}

/**
 * Upload interview video with progress tracking
 * @param interviewId - Interview ID
 * @param file - Video file to upload
 * @param onProgress - Callback for progress updates
 * @returns Upload response with video URL
 */
export const uploadInterviewVideo = async (
  interviewId: number,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  try {
    // CRITICAL: Fetch token directly from localStorage at request time
    const token = localStorage.getItem('token');
    console.log('[uploadInterviewVideo] Starting upload with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('[uploadInterviewVideo] File:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');

    const formData = new FormData();
    formData.append('video', file);

    const result = await apiService.post<UploadResponse>(
      `/media/interview-video/${interviewId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Token will be injected by the Axios interceptor
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / (progressEvent.total || 1)) * 100
          );

          onProgress?.({
            progress,
            loaded: progressEvent.loaded,
            total: progressEvent.total || 0,
            status: 'uploading'
          });
        },
        timeout: 600000 // 10 minutes for large videos
      }
    );

    console.log('[uploadInterviewVideo] Upload successful:', result);

    onProgress?.({
      progress: 100,
      loaded: file.size,
      total: file.size,
      status: 'completed'
    });

    return result;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error);
    console.error('[uploadInterviewVideo] Upload failed:', errorMessage);

    onProgress?.({
      progress: 0,
      loaded: 0,
      total: 0,
      status: 'error',
      error: errorMessage
    });

    throw new Error(errorMessage);
  }
};

/**
 * Upload resume/document with progress tracking
 * @param file - Document file to upload
 * @param onProgress - Callback for progress updates
 * @returns Upload response with document URL
 */
export const uploadResume = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  try {
    // CRITICAL: Fetch token directly from localStorage at request time
    const token = localStorage.getItem('token');
    console.log('[uploadResume] Starting upload with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('[uploadResume] File:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF and Word documents are allowed.');
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is 50MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
    }

    const formData = new FormData();
    formData.append('video', file); // Note: backend expects 'video' field name

    const result = await apiService.post<UploadResponse>(
      '/media/resume',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Token will be injected by the Axios interceptor
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / (progressEvent.total || 1)) * 100
          );

          onProgress?.({
            progress,
            loaded: progressEvent.loaded,
            total: progressEvent.total || 0,
            status: 'uploading'
          });
        },
        timeout: 300000 // 5 minutes for documents
      }
    );

    console.log('[uploadResume] Upload successful:', result);

    onProgress?.({
      progress: 100,
      loaded: file.size,
      total: file.size,
      status: 'completed'
    });

    return result;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error);
    console.error('[uploadResume] Upload failed:', errorMessage);

    onProgress?.({
      progress: 0,
      loaded: 0,
      total: 0,
      status: 'error',
      error: errorMessage
    });

    throw new Error(errorMessage);
  }
};

/**
 * Upload profile picture with progress tracking
 * @param file - Image file to upload
 * @param onProgress - Callback for progress updates
 * @returns Upload response with image URL
 */
export const uploadProfilePicture = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  try {
    // CRITICAL: Fetch token directly from localStorage at request time
    const token = localStorage.getItem('token');
    console.log('[uploadProfilePicture] Starting upload with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    console.log('[uploadProfilePicture] File:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`Image too large. Maximum size is 10MB. Your image is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
    }

    const formData = new FormData();
    formData.append('video', file); // Note: backend expects 'video' field name

    const result = await apiService.post<UploadResponse>(
      '/media/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Token will be injected by the Axios interceptor
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / (progressEvent.total || 1)) * 100
          );

          onProgress?.({
            progress,
            loaded: progressEvent.loaded,
            total: progressEvent.total || 0,
            status: 'uploading'
          });
        },
        timeout: 60000 // 1 minute for images
      }
    );

    console.log('[uploadProfilePicture] Upload successful:', result);

    onProgress?.({
      progress: 100,
      loaded: file.size,
      total: file.size,
      status: 'completed'
    });

    return result;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error);
    console.error('[uploadProfilePicture] Upload failed:', errorMessage);

    onProgress?.({
      progress: 0,
      loaded: 0,
      total: 0,
      status: 'error',
      error: errorMessage
    });

    throw new Error(errorMessage);
  }
};

/**
 * Extract specific error message from various error types
 */
function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status === 413) {
    return 'File too large. Please check the size limits.';
  }

  if (error.response?.status === 503) {
    return 'Server temporarily unavailable. Please try again later.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'Upload timeout. Please check your connection and try again.';
  }

  if (error.message === 'Network Error') {
    return 'Network error. Please check your internet connection.';
  }

  if (error.message.includes('too large')) {
    return error.message;
  }

  if (error.message.includes('Invalid')) {
    return error.message;
  }

  return error.message || 'Upload failed. Please try again.';
}

export default {
  uploadInterviewVideo,
  uploadResume,
  uploadProfilePicture
};
