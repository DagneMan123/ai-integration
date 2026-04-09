const { logger } = require('./logger');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadToCloud = async (file, folder = 'uploads') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomStr}${ext}`;

    const filepath = path.join(folderPath, filename);
    fs.writeFileSync(filepath, file.buffer);

    const fileUrl = `/uploads/${folder}/${filename}`;
    logger.info(`File uploaded successfully: ${fileUrl}`);

    return fileUrl;
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw error;
  }
};

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

module.exports = {
  uploadToCloud,
  deleteFromCloud,
  getFromCloud
};
