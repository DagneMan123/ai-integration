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
 * Uses upload_preset for authentication instead of API credentials
 */
export const uploadVideoDirectToCloudinary = async (
  file: File | Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dm5rf4yzc';
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET_VIDEO || 'simuai_video_preset';

    console.log('[Direct Upload] Starting video upload to Cloudinary', {
      fileName: file instanceof File ? file.name : 'blob',
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type,
      cloudName,
      uploadPreset,
      isFile: file instanceof File,
      isBlob: file instanceof Blob
    });

    // VALIDATION: Check if file exists and has content
    if (!file || file.size === 0) {
      console.error('[Direct Upload] File is missing or empty!', {
        file: file ? 'exists' : 'missing',
        size: file?.size,
        type: file?.type
      });
      throw new Error('Video file is missing or empty');
    }

    // CRITICAL: Ensure file is a proper File object with correct extension
    let uploadFile: File;
    
    if (file instanceof File) {
      uploadFile = file;
      console.log('[Direct Upload] File is already a File instance');
    } else if (file instanceof Blob) {
      console.warn('[Direct Upload] File is a Blob, converting to File');
      uploadFile = new File([file], `video_${Date.now()}.webm`, { type: file.type || 'video/webm' });
    } else {
      throw new Error('Invalid file type - must be File or Blob');
    }

    // Ensure filename has proper extension matching MIME type
    let fileName = uploadFile.name;
    if (!fileName.includes('.')) {
      if (uploadFile.type.includes('mp4')) {
        fileName = `${fileName}.mp4`;
      } else if (uploadFile.type.includes('webm')) {
        fileName = `${fileName}.webm`;
      } else {
        fileName = `${fileName}.webm`;
      }
      console.log('[Direct Upload] Added file extension:', fileName);
      uploadFile = new File([uploadFile], fileName, { type: uploadFile.type });
    }

    console.log('[Direct Upload] File validation passed', {
      fileName: uploadFile.name,
      fileSize: uploadFile.size,
      fileType: uploadFile.type,
      isFile: uploadFile instanceof File,
      isBlob: uploadFile instanceof Blob
    });

    // Create FormData for Cloudinary
    const formData = new FormData();
    
    // CRITICAL: Append file first, before other fields
    formData.append('file', uploadFile);
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', 'video');
    formData.append('folder', 'simuai/videos');
    formData.append('public_id', `simuai_video_${Date.now()}_${Math.random().toString(36).substring(7)}`);

    console.log('[Direct Upload] FormData prepared', {
      hasFile: formData.has('file'),
      hasPreset: formData.has('upload_preset'),
      hasResourceType: formData.has('resource_type'),
      hasFolder: formData.has('folder'),
      hasPublicId: formData.has('public_id'),
      fileDetails: {
        name: uploadFile.name,
        size: uploadFile.size,
        type: uploadFile.type,
        isFile: uploadFile instanceof File,
        isBlob: uploadFile instanceof Blob
      }
    });

    // Upload directly to Cloudinary with retry logic
    let lastError: any = null;
    let uploadResponse: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Direct Upload] Upload attempt ${attempt}/3`);
        
        uploadResponse = await axios.post<CloudinaryResponse>(
          `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
          formData,
          {
            // CRITICAL: Do NOT set Content-Type header manually
            // Axios will automatically set it with the correct boundary
            // headers: { 'Content-Type': 'multipart/form-data' } // REMOVED
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
          secure_url: uploadResponse.data.secure_url,
          public_id: uploadResponse.data.public_id,
          duration: uploadResponse.data.duration,
          size: uploadResponse.data.bytes,
          format: uploadResponse.data.format
        });

        return {
          success: true,
          secure_url: uploadResponse.data.secure_url,
          public_id: uploadResponse.data.public_id,
          duration: uploadResponse.data.duration,
          size: uploadResponse.data.bytes,
          format: uploadResponse.data.format
        };
      } catch (error: any) {
        lastError = error;
        console.error(`[Direct Upload] Upload attempt ${attempt} failed:`, {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          code: error.code,
          headers: error.response?.headers,
          requestData: {
            url: error.config?.url,
            method: error.config?.method,
            hasData: !!error.config?.data
          }
        });

        // Don't retry on auth errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw error;
        }

        // Wait before retrying
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All retries failed
    if (lastError) {
      if (lastError.response?.status === 400) {
        const errorMsg = lastError.response.data?.error?.message || lastError.response.data?.message || 'Unknown error';
        console.error('[Direct Upload] 400 Bad Request details:', {
          errorMessage: errorMsg,
          fullError: lastError.response.data,
          fileName: uploadFile.name,
          fileSize: uploadFile.size,
          fileType: uploadFile.type,
          uploadPreset: uploadPreset
        });
        throw new Error(`Invalid video: ${errorMsg}`);
      }
      if (lastError.response?.status === 413) {
        throw new Error('Video file too large. Maximum size is 100MB');
      }
      if (lastError.response?.status === 401 || lastError.response?.status === 403) {
        throw new Error('Upload preset authentication failed. Check your Cloudinary configuration.');
      }
      if (lastError.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again with a smaller file');
      }

      throw new Error(`Video upload failed: ${lastError.message}`);
    }

    throw new Error('Video upload failed after 3 attempts');
  } catch (error: any) {
    console.error('[Direct Upload] Video upload failed:', error.message);
    throw error;
  }
};

/**
 * Upload document/resume directly to Cloudinary (signed)
 */
export const uploadDocumentDirectToCloudinary = async (
  file: File | Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dm5rf4yzc';
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET_DOCUMENT || 'simuai_document_preset';

    console.log('[Direct Upload] Starting document upload to Cloudinary', {
      fileName: file instanceof File ? file.name : 'blob',
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      cloudName,
      uploadPreset
    });

    // VALIDATION: Check if file exists and has content
    if (!file || file.size === 0) {
      console.error('[Direct Upload] File is missing or empty!', {
        file: file ? 'exists' : 'missing',
        size: file?.size
      });
      throw new Error('Document file is missing or empty');
    }

    const formData = new FormData();
    
    // FORMDATA KEY: Cloudinary expects 'file' key
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset); // CRITICAL: upload_preset parameter
    formData.append('resource_type', 'raw'); // CRITICAL: raw for documents
    formData.append('folder', 'simuai/documents');
    formData.append('public_id', `simuai_doc_${Date.now()}_${Math.random().toString(36).substring(7)}`);

    console.log('[Direct Upload] FormData prepared with file key', {
      hasFile: formData.has('file'),
      hasPreset: formData.has('upload_preset'),
      hasResourceType: formData.has('resource_type')
    });

    const response = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      formData,
      {
        // CRITICAL: Do NOT set Content-Type header manually
        // Axios will automatically set it with the correct boundary
        // headers: { 'Content-Type': 'multipart/form-data' } // REMOVED
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
  file: File | Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dm5rf4yzc';
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET_IMAGE || 'simuai_image_preset';

    console.log('[Direct Upload] Starting image upload to Cloudinary', {
      fileName: file instanceof File ? file.name : 'blob',
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      cloudName,
      uploadPreset
    });

    // VALIDATION: Check if file exists and has content
    if (!file || file.size === 0) {
      console.error('[Direct Upload] File is missing or empty!', {
        file: file ? 'exists' : 'missing',
        size: file?.size
      });
      throw new Error('Image file is missing or empty');
    }

    const formData = new FormData();
    
    // FORMDATA KEY: Cloudinary expects 'file' key
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset); // CRITICAL: upload_preset parameter
    formData.append('resource_type', 'image'); // CRITICAL: resource_type for image
    formData.append('folder', 'simuai/images');
    formData.append('public_id', `simuai_img_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    formData.append('width', '500');
    formData.append('height', '500');
    formData.append('crop', 'fill');
    formData.append('gravity', 'face');
    formData.append('quality', 'auto');

    console.log('[Direct Upload] FormData prepared with file key', {
      hasFile: formData.has('file'),
      hasPreset: formData.has('upload_preset'),
      hasResourceType: formData.has('resource_type')
    });

    const response = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        // CRITICAL: Do NOT set Content-Type header manually
        // Axios will automatically set it with the correct boundary
        // headers: { 'Content-Type': 'multipart/form-data' } // REMOVED
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
