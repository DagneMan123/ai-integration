const { logger } = require('./logger');
const fs = require('fs');
const path = require('path');

/**
 * Cloud Storage Utility
 * Handles file uploads to local storage or cloud services
 */

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload file to cloud storage (local storage for now)
 * @param {Object} file - Express file object from multer
 * @param {String} folder - Folder name (e.g., 'avatars', 'documents')
 * @returns {String} - File URL
 */
const uploadToCloud = async (file, folder = 'uploads') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create folder if it doesn't exist
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomStr}${ext}`;

    // Save file to local storage
    const filepath = path.join(folderPath, filename);
    fs.writeFileSync(filepath, file.buffer);

    // Return file URL
    const fileUrl = `/uploads/${folder}/${filename}`;
    logger.info(`File uploaded successfully: ${fileUrl}`);

    return fileUrl;
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from cloud storage
 * @param {String} fileUrl - File URL to delete
 */
const deleteFromCloud = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    // Extract filename from URL
    const filename = fileUrl.split('/').pop();
    const folder = fileUrl.split('/')[2];
    const filepath = path.join(uploadsDir, folder, filename);

    // Delete file if it exists
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      logger.info(`File deleted successfully: ${fileUrl}`);
    }
  } catch (error) {
    logger.error('Error deleting file:', error);
    // Don't throw - allow app to continue
  }
};

/**
 * Get file from cloud storage
 * @param {String} fileUrl - File URL
 * @returns {Buffer} - File buffer
 */
const getFromCloud = async (fileUrl) => {
  try {
    if (!fileUrl) return null;

    // Extract filename from URL
    const filename = fileUrl.split('/').pop();
    const folder = fileUrl.split('/')[2];
    const filepath = path.join(uploadsDir, folder, filename);

    // Read file if it exists
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath);
    }

    return null;
  } catch (error) {
    logger.error('Error reading file:', error);
    return null;
  }
};

module.exports = {
  uploadToCloud,
  deleteFromCloud,
  getFromCloud
};
