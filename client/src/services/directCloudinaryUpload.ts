import axios from 'axios';

/**
 * Direct Frontend to Cloudinary Upload Service
 * Bypasses backend completely to avoid 503 errors
 * 
 * Flow:
 * 1. Frontend uploads directly to Cloudinary
 * 2. Cloudinary returns secure_url
 * 3. Frontend sends only URL to backend for database storage
 */

interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  duration?: number;
  bytes: number;
  format: string;
  resource_type: string;
}

interface UploadResult {
  success: boolean;
  secure_url: string;
  public_id: string;
  duration?: number;
  size: number;
  format: string;
}

/**
 * Upload video directly to Cloudinary (signed)
 * Uses API credentials for authentication instead of presets
 */
export const uploadVideoDirectToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const cloudName = 'dm5rf4yzc';
    const apiKey = '815842898446983';
    const apiSecret = 'boT09_AFnNUMrNW_LrO2qfLad7g';

    console.log('[Direct Upload] Starting video upload to Cloudinary', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      cloudName
    });

    // Create FormData for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('resource_type', 'video');
    formData.append('folder', 'simuai/videos');
    formData.append('public_id', `simuai_video_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    formData.append('timestamp', Math.floor(Date.now() / 1000).toString());

    // Upload directly to Cloudinary
    const response = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`[Direct Upload] Video upload progress: ${percentCompleted}%`);
            
            if (onProgress) {
              onProgress({
                progress: percentCompleted,
                loaded: progressEvent.loaded,
                total: progressEvent.total
              });
            }
          }
        },
        timeout: 600000 // 10 minutes
      }
    );

    console.log('[Direct Upload] Video uploaded successfully to Cloudinary', {
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
      duration: response.data.duration,
      size: response.data.bytes
    });

    return {
      success: true,
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
      duration: response.data.duration,
      size: response.data.bytes,
      format: response.data.format
    };
  } catch (error: any) {
    console.error('[Direct Upload] Video upload failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 400) {
      throw new Error(`Invalid video: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    if (error.response?.status === 413) {
      throw new Error('Video file too large. Maximum size is 100MB');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout. Please try again with a smaller file');
    }

    throw new Error(`Video upload failed: ${error.message}`);
  }
};

/**
 * Upload document/resume directly to Cloudinary (signed)
 */
export const uploadDocumentDirectToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const cloudName = 'dm5rf4yzc';
    const apiKey = '815842898446983';
    const apiSecret = 'boT09_AFnNUMrNW_LrO2qfLad7g';

    console.log('[Direct Upload] Starting document upload to Cloudinary', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      cloudName
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('resource_type', 'raw'); // CRITICAL: raw for documents
    formData.append('folder', 'simuai/documents');
    formData.append('public_id', `simuai_doc_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    formData.append('timestamp', Math.floor(Date.now() / 1000).toString());

    const response = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`[Direct Upload] Document upload progress: ${percentCompleted}%`);
            
            if (onProgress) {
              onProgress({
                progress: percentCompleted,
                loaded: progressEvent.loaded,
                total: progressEvent.total
              });
            }
          }
        },
        timeout: 300000 // 5 minutes
      }
    );

    console.log('[Direct Upload] Document uploaded successfully to Cloudinary', {
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
      size: response.data.bytes
    });

    return {
      success: true,
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
      size: response.data.bytes,
      format: response.data.format
    };
  } catch (error: any) {
    console.error('[Direct Upload] Document upload failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 400) {
      throw new Error(`Invalid document: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    if (error.response?.status === 413) {
      throw new Error('Document file too large. Maximum size is 50MB');
    }

    throw new Error(`Document upload failed: ${error.message}`);
  }
};

/**
 * Upload image/profile picture directly to Cloudinary (signed)
 */
export const uploadImageDirectToCloudinary = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const cloudName = 'dm5rf4yzc';
    const apiKey = '815842898446983';
    const apiSecret = 'boT09_AFnNUMrNW_LrO2qfLad7g';

    console.log('[Direct Upload] Starting image upload to Cloudinary', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      cloudName
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('resource_type', 'image');
    formData.append('folder', 'simuai/images');
    formData.append('public_id', `simuai_img_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    formData.append('width', '500');
    formData.append('height', '500');
    formData.append('crop', 'fill');
    formData.append('gravity', 'face');
    formData.append('quality', 'auto');
    formData.append('timestamp', Math.floor(Date.now() / 1000).toString());

    const response = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`[Direct Upload] Image upload progress: ${percentCompleted}%`);
            
            if (onProgress) {
              onProgress({
                progress: percentCompleted,
                loaded: progressEvent.loaded,
                total: progressEvent.total
              });
            }
          }
        },
        timeout: 120000 // 2 minutes
      }
    );

    console.log('[Direct Upload] Image uploaded successfully to Cloudinary', {
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
      size: response.data.bytes
    });

    return {
      success: true,
      secure_url: response.data.secure_url,
      public_id: response.data.public_id,
      size: response.data.bytes,
      format: response.data.format
    };
  } catch (error: any) {
    console.error('[Direct Upload] Image upload failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 400) {
      throw new Error(`Invalid image: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    if (error.response?.status === 413) {
      throw new Error('Image file too large. Maximum size is 10MB');
    }

    throw new Error(`Image upload failed: ${error.message}`);
  }
};
