/**
 * Cloudinary Video Upload Service
 * Handles direct frontend uploads to Cloudinary without sending raw video to backend
 */

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'your-preset';

interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  duration: number;
  format: string;
  bytes: number;
  resource_type: string;
}


export const uploadVideoToCloudinary = async (
  videoBlob: Blob,
  onProgress?: (event: UploadProgressEvent) => void
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', videoBlob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'video');
    formData.append('folder', 'simuai-interviews');

    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage,
          });
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    // Send request
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`);
    xhr.send(formData);
  });
};

/**
 * Get video duration from blob
 * @param videoBlob - The video blob
 * @returns Promise with duration in seconds
 */
export const getVideoDuration = (videoBlob: Blob): Promise<number> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(videoBlob);
    const video = document.createElement('video');

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = url;
  });
};

/**
 * Create a preview URL from video blob
 * @param videoBlob - The video blob
 * @returns Object URL for preview
 */
export const createVideoPreviewUrl = (videoBlob: Blob): string => {
  return URL.createObjectURL(videoBlob);
};

/**
 * Revoke preview URL to free up memory
 * @param url - The object URL to revoke
 */
export const revokeVideoPreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};
