const prisma = require('../lib/prisma');
const { uploadVideo, uploadDocument } = require('../services/cloudinaryService');
const { logger } = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Upload interview video
 * Stores video URL in Interview.videoUrl
 */
const uploadInterviewVideo = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user?.id;

    if (!req.file) {
      return next(new AppError('No video file provided', 400));
    }

    if (!interviewId) {
      return next(new AppError('Interview ID is required', 400));
    }

    // Verify interview exists and belongs to user
    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(interviewId) },
      include: { candidate: true }
    });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    if (interview.candidateId !== userId) {
      return next(new AppError('Unauthorized to upload video for this interview', 403));
    }

    logger.info('Starting interview video upload', {
      interviewId,
      userId,
      fileSize: req.file.size,
      fileName: req.file.originalname
    });

    // Upload to Cloudinary using stream
    const uploadResult = await uploadVideo(
      req.file.buffer,
      req.file.originalname,
      {
        tags: ['interview', `interview_${interviewId}`, `user_${userId}`],
        context: {
          interviewId: interviewId.toString(),
          userId: userId.toString()
        }
      }
    );

    // Update database with video URL
    const updatedInterview = await prisma.interview.update({
      where: { id: parseInt(interviewId) },
      data: {
        videoUrl: uploadResult.secure_url,
        videoPublicId: uploadResult.public_id,
        videoDuration: uploadResult.duration || null,
        updatedAt: new Date()
      }
    });

    logger.info('Interview video uploaded and database updated', {
      interviewId,
      videoUrl: uploadResult.secure_url,
      duration: uploadResult.duration
    });

    return res.status(200).json({
      success: true,
      message: 'Interview video uploaded successfully',
      data: {
        interviewId: updatedInterview.id,
        videoUrl: updatedInterview.videoUrl,
        duration: updatedInterview.videoDuration,
        uploadedAt: updatedInterview.updatedAt
      }
    });

  } catch (error) {
    logger.error('Interview video upload error:', error);

    // Provide specific error messages
    if (error.message.includes('too large')) {
      return next(new AppError(error.message, 413));
    }
    if (error.message.includes('Stream error')) {
      return next(new AppError('Network error during upload. Please try again.', 503));
    }
    if (error.message.includes('upload failed')) {
      return next(new AppError('Failed to upload video to cloud storage', 500));
    }

    next(error);
  }
};

/**
 * Upload resume/document
 * Stores document URL in User.resumeUrl
 */
const uploadResume = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!req.file) {
      return next(new AppError('No document file provided', 400));
    }

    if (!userId) {
      return next(new AppError('User ID is required', 401));
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    logger.info('Starting resume upload', {
      userId,
      fileSize: req.file.size,
      fileName: req.file.originalname
    });

    // Upload to Cloudinary using stream with resource_type: 'raw'
    const uploadResult = await uploadDocument(
      req.file.buffer,
      req.file.originalname,
      {
        tags: ['resume', `user_${userId}`],
        context: {
          userId: userId.toString(),
          type: 'resume'
        }
      }
    );

    // Update user with resume URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        resumeUrl: uploadResult.secure_url,
        resumePublicId: uploadResult.public_id,
        updatedAt: new Date()
      }
    });

    logger.info('Resume uploaded and database updated', {
      userId,
      resumeUrl: uploadResult.secure_url,
      fileName: uploadResult.fileName
    });

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        userId: updatedUser.id,
        resumeUrl: updatedUser.resumeUrl,
        fileName: uploadResult.fileName,
        uploadedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    logger.error('Resume upload error:', error);

    // Provide specific error messages
    if (error.message.includes('too large')) {
      return next(new AppError(error.message, 413));
    }
    if (error.message.includes('Invalid document type')) {
      return next(new AppError(error.message, 400));
    }
    if (error.message.includes('Stream error')) {
      return next(new AppError('Network error during upload. Please try again.', 503));
    }
    if (error.message.includes('upload failed')) {
      return next(new AppError('Failed to upload document to cloud storage', 500));
    }

    next(error);
  }
};

/**
 * Upload profile picture
 * Stores image URL in User.profilePicture
 */
const uploadProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!req.file) {
      return next(new AppError('No image file provided', 400));
    }

    if (!userId) {
      return next(new AppError('User ID is required', 401));
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    logger.info('Starting profile picture upload', {
      userId,
      fileSize: req.file.size,
      fileName: req.file.originalname
    });

    // Upload to Cloudinary with image optimization
    const uploadResult = await uploadDocument(
      req.file.buffer,
      req.file.originalname,
      {
        resource_type: 'image',
        tags: ['profile', `user_${userId}`],
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      }
    );

    // Update user with profile picture URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: uploadResult.secure_url,
        profilePicturePublicId: uploadResult.public_id,
        updatedAt: new Date()
      }
    });

    logger.info('Profile picture uploaded and database updated', {
      userId,
      profilePictureUrl: uploadResult.secure_url
    });

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        userId: updatedUser.id,
        profilePictureUrl: updatedUser.profilePicture,
        uploadedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    logger.error('Profile picture upload error:', error);

    if (error.message.includes('too large')) {
      return next(new AppError(error.message, 413));
    }
    if (error.message.includes('Stream error')) {
      return next(new AppError('Network error during upload. Please try again.', 503));
    }

    next(error);
  }
};

/**
 * Get upload progress (for frontend polling)
 */
const getUploadProgress = async (req, res, next) => {
  try {
    const { uploadId } = req.params;

    // This would typically be stored in Redis or in-memory cache
    // For now, return a placeholder
    return res.status(200).json({
      success: true,
      uploadId,
      progress: 100,
      status: 'completed'
    });

  } catch (error) {
    logger.error('Error getting upload progress:', error);
    next(error);
  }
};

module.exports = {
  uploadInterviewVideo,
  uploadResume,
  uploadProfilePicture,
  getUploadProgress
};
