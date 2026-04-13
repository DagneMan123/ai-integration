const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { logger } = require('../utils/logger');

const execAsync = promisify(exec);

/**
 * Video Processing Service
 * Handles video upload, storage, and processing
 */

// Save video file to disk
exports.saveVideoFile = async (videoBuffer, sessionId) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads/videos');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `interview_${sessionId}_${Date.now()}.webm`;
    const filepath = path.join(uploadsDir, filename);

    // Write video file
    fs.writeFileSync(filepath, videoBuffer);
    
    logger.info(`Video saved: ${filename}`);
    
    return {
      filename,
      filepath,
      url: `/uploads/videos/${filename}`,
      size: videoBuffer.length,
      savedAt: new Date()
    };
  } catch (error) {
    logger.error('Error saving video file:', error);
    throw new Error('Failed to save video file');
  }
};

// Get video file info
exports.getVideoInfo = async (filepath) => {
  try {
    if (!fs.existsSync(filepath)) {
      throw new Error('Video file not found');
    }

    const stats = fs.statSync(filepath);
    
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      exists: true
    };
  } catch (error) {
    logger.error('Error getting video info:', error);
    throw error;
  }
};

// Delete video file
exports.deleteVideoFile = async (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      logger.info(`Video deleted: ${filepath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting video file:', error);
    throw error;
  }
};

// Extract audio from video
exports.extractAudio = async (videoPath) => {
  try {
    const audioPath = videoPath.replace('.webm', '.wav');
    
    // Use ffmpeg to extract audio
    const command = `ffmpeg -i "${videoPath}" -q:a 9 -n "${audioPath}" 2>&1`;
    
    await execAsync(command);
    
    logger.info(`Audio extracted: ${audioPath}`);
    
    return audioPath;
  } catch (error) {
    logger.error('Error extracting audio:', error);
    throw new Error('Failed to extract audio from video');
  }
};

// Get video duration
exports.getVideoDuration = async (videoPath) => {
  try {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_wrappers=1 "${videoPath}"`;
    
    const { stdout } = await execAsync(command);
    const duration = parseFloat(stdout.trim());
    
    return Math.round(duration);
  } catch (error) {
    logger.error('Error getting video duration:', error);
    return 0;
  }
};

// Validate video file
exports.validateVideoFile = (buffer) => {
  try {
    // Check if buffer is valid
    if (!buffer || buffer.length === 0) {
      throw new Error('Video buffer is empty');
    }

    // Check WebM signature (0x1A 0x45 0xDF 0xA3)
    const webmSignature = Buffer.from([0x1A, 0x45, 0xDF, 0xA3]);
    const bufferStart = buffer.slice(0, 4);
    
    if (!bufferStart.equals(webmSignature)) {
      logger.warn('Warning: Video may not be valid WebM format');
    }

    // Check minimum size (at least 1KB)
    if (buffer.length < 1024) {
      throw new Error('Video file is too small');
    }

    // Check maximum size (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new Error('Video file is too large (max 100MB)');
    }

    return {
      valid: true,
      size: buffer.length,
      format: 'webm'
    };
  } catch (error) {
    logger.error('Video validation error:', error);
    throw error;
  }
};

// Stream video file
exports.streamVideoFile = (filepath) => {
  try {
    if (!fs.existsSync(filepath)) {
      throw new Error('Video file not found');
    }

    return fs.createReadStream(filepath);
  } catch (error) {
    logger.error('Error streaming video file:', error);
    throw error;
  }
};
