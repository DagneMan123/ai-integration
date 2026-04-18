const { logger } = require('./logger');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload file to local storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path
 * @returns {Promise<Object>} - Upload result with URL
 */
const uploadToCloud = async (fileBuffer, fileName, folder = 'uploads') => {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('No file buffer provided');
    }

    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(fileName);
    const filename = `${timestamp}-${randomStr}${ext}`;

    const filepath = path.join(folderPath, filename);
    
    // Write file using stream for memory efficiency
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filepath);
      
      writeStream.on('error', (err) => {
        logger.error('Stream write error:', err);
        reject(err);
      });
      
      writeStream.on('finish', () => {
        logger.debug(`File written successfully: ${filename}`);
        resolve();
      });
      
      writeStream.write(fileBuffer);
      writeStream.end();
    });

    const fileUrl = `/uploads/${folder}/${filename}`;
    logger.info(`File uploaded successfully: ${fileUrl}`, {
      fileSize: fileBuffer.length,
      fileName: filename
    });

    return {
      success: true,
      secure_url: fileUrl,
      url: fileUrl,
      public_id: filename,
      size: fileBuffer.length,
      local: true
    };
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from storage
 * @param {string} fileUrl - File URL
 * @returns {Promise<void>}
 */
const deleteFromCloud = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    const filename = fileUrl.split('/').pop();
    const folder = fileUrl.split('/')[2];
    const filepath = path.join(uploadsDir, folder, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      logger.info(`File deleted successfully: ${fileUrl}`);
    }
  } catch (error) {
    logger.error('Error deleting file:', error);
  }
};

/**
 * Get file from storage
 * @param {string} fileUrl - File URL
 * @returns {Promise<Buffer|null>}
 */
const getFromCloud = async (fileUrl) => {
  try {
    if (!fileUrl) return null;

    const filename = fileUrl.split('/').pop();
    const folder = fileUrl.split('/')[2];
    const filepath = path.join(uploadsDir, folder, filename);

    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath);
    }

    return null;
  } catch (error) {
    logger.error('Error reading file:', error);
    return null;
  }
};

/**
 * Upload video with optimization
 * @param {Buffer} videoBuffer - Video buffer
 * @param {string} fileName - File name
 * @param {string} folder - Folder path
 * @returns {Promise<Object>} - Upload result
 */
const uploadVideo = async (videoBuffer, fileName, folder = 'videos') => {
  try {
    logger.info(`Uploading video: ${fileName}`, {
      size: videoBuffer.length
    });

    const result = await uploadToCloud(videoBuffer, fileName, folder);
    
    return {
      ...result,
      type: 'video',
      duration: null // Can be calculated from video metadata if needed
    };
  } catch (error) {
    logger.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Upload document
 * @param {Buffer} docBuffer - Document buffer
 * @param {string} fileName - File name
 * @param {string} folder - Folder path
 * @returns {Promise<Object>} - Upload result
 */
const uploadDocument = async (docBuffer, fileName, folder = 'documents') => {
  try {
    logger.info(`Uploading document: ${fileName}`, {
      size: docBuffer.length
    });

    const result = await uploadToCloud(docBuffer, fileName, folder);
    
    return {
      ...result,
      type: 'document'
    };
  } catch (error) {
    logger.error('Error uploading document:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloud,
  uploadVideo,
  uploadDocument,
  deleteFromCloud,
  getFromCloud
};
