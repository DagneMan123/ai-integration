const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { logger } = require('../utils/logger');

/**
 * Initialize Cloudinary with environment variables
 */
const initializeCloudinary = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    logger.warn('Cloudinary credentials not fully configured. Some features may not work.');
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  logger.info('Cloudinary initialized successfully');
  return true;
};

/**
 * Upload video using stream to prevent RAM overload
 * @param {Buffer} videoBuffer - Video file buffer
 * @param {string} fileName - Original file name
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Cloudinary response with secure_url
 */
const uploadVideo = async (videoBuffer, fileName, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!videoBuffer || videoBuffer.length === 0) {
        return reject(new Error('Video buffer is empty'));
      }

      // Validate file size
      const maxSize = parseInt(process.env.CLOUDINARY_MAX_VIDEO_SIZE) || 104857600; // 100MB default
      if (videoBuffer.length > maxSize) {
        return reject(new Error(`Video file too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(2)}MB`));
      }

      // Create readable stream from buffer
      const stream = Readable.from(videoBuffer);

      // Configure upload options
      const uploadOptions = {
        resource_type: 'video',
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET_VIDEO || 'simuai_video_preset',
        public_id: `simuai_video_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        folder: 'simuai/videos',
        overwrite: false,
        quality: 'auto',
        fetch_format: 'auto',
        flags: 'progressive',
        timeout: 60000,
        ...options
      };

      // Use upload_stream for memory-efficient streaming
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          logger.error('Cloudinary video upload error:', {
            error: error.message,
            fileName,
            statusCode: error.http_code
          });
          return reject(new Error(`Video upload failed: ${error.message}`));
        }

        logger.info('Video uploaded successfully to Cloudinary', {
          publicId: result.public_id,
          url: result.secure_url,
          size: result.bytes,
          duration: result.duration
        });

        resolve({
          success: true,
          secure_url: result.secure_url,
          url: result.secure_url,
          public_id: result.public_id,
          size: result.bytes,
          duration: result.duration,
          format: result.format,
          resource_type: result.resource_type
        });
      });

      // Handle stream errors
      uploadStream.on('error', (error) => {
        logger.error('Upload stream error:', error);
        reject(new Error(`Stream error: ${error.message}`));
      });

      // Pipe buffer to upload stream
      stream.pipe(uploadStream);

    } catch (error) {
      logger.error('Video upload exception:', error);
      reject(error);
    }
  });
};

/**
 * Upload document (PDF, Word, etc.) with raw resource type
 * @param {Buffer} docBuffer - Document file buffer
 * @param {string} fileName - Original file name
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Cloudinary response with secure_url
 */
const uploadDocument = async (docBuffer, fileName, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!docBuffer || docBuffer.length === 0) {
        return reject(new Error('Document buffer is empty'));
      }

      // Validate file size
      const maxSize = parseInt(process.env.CLOUDINARY_MAX_DOCUMENT_SIZE) || 52428800; // 50MB default
      if (docBuffer.length > maxSize) {
        return reject(new Error(`Document file too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(2)}MB`));
      }

      // Extract file extension
      const fileExt = fileName.split('.').pop().toLowerCase();
      const validExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
      
      if (!validExtensions.includes(fileExt)) {
        return reject(new Error(`Invalid document type. Allowed: ${validExtensions.join(', ')}`));
      }

      // Create readable stream from buffer
      const stream = Readable.from(docBuffer);

      // Configure upload options - CRITICAL: resource_type: 'raw' for documents
      const uploadOptions = {
        resource_type: 'raw', // CRUCIAL: Stores as document, not image
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET_DOCUMENT || 'simuai_document_preset',
        public_id: `simuai_doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        folder: 'simuai/documents',
        overwrite: false,
        timeout: 60000,
        ...options
      };

      // Use upload_stream for memory-efficient streaming
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          logger.error('Cloudinary document upload error:', {
            error: error.message,
            fileName,
            statusCode: error.http_code
          });
          return reject(new Error(`Document upload failed: ${error.message}`));
        }

        logger.info('Document uploaded successfully to Cloudinary', {
          publicId: result.public_id,
          url: result.secure_url,
          size: result.bytes,
          format: result.format
        });

        resolve({
          success: true,
          secure_url: result.secure_url,
          url: result.secure_url,
          public_id: result.public_id,
          size: result.bytes,
          format: result.format,
          resource_type: result.resource_type,
          fileName: fileName // Preserve original file name
        });
      });

      // Handle stream errors
      uploadStream.on('error', (error) => {
        logger.error('Upload stream error:', error);
        reject(new Error(`Stream error: ${error.message}`));
      });

      // Pipe buffer to upload stream
      stream.pipe(uploadStream);

    } catch (error) {
      logger.error('Document upload exception:', error);
      reject(error);
    }
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (video, raw, image, etc.)
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFile = async (publicId, resourceType = 'video') => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });

    logger.info('File deleted from Cloudinary', {
      publicId,
      result: result.result
    });

    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    logger.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

/**
 * Get file info from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type
 * @returns {Promise<Object>} - File metadata
 */
const getFileInfo = async (publicId, resourceType = 'video') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType
    });

    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      size: result.bytes,
      format: result.format,
      createdAt: result.created_at,
      duration: result.duration || null
    };
  } catch (error) {
    logger.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate signed URL for secure access
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {string} - Signed URL
 */
const generateSignedUrl = (publicId, resourceType = 'video', expiresIn = 3600) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
    
    const url = cloudinary.url(publicId, {
      resource_type: resourceType,
      sign_url: true,
      secure: true,
      expires_at: timestamp
    });

    return url;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    throw error;
  }
};

module.exports = {
  initializeCloudinary,
  uploadVideo,
  uploadDocument,
  deleteFile,
  getFileInfo,
  generateSignedUrl
};
