const prisma = require('../lib/prisma');
const { uploadVideo, uploadDocument, uploadImage } = require('../services/cloudinaryService');
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
    
    // Log memory before upload
    const memBefore = process.memoryUsage();
    logger.info('📊 Memory before video upload:', {
      heapUsed: `${Math.round(memBefore.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memBefore.heapTotal / 1024 / 1024)}MB`
    });

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

    logger.info('🎥 Starting interview video upload', {
      interviewId,
      userId,
      fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype
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

    // Log memory after upload
    const memAfter = process.memoryUsage();
    logger.info('✅ Interview video uploaded successfully', {
      interviewId,
      videoUrl: uploadResult.secure_url,
      duration: uploadResult.duration,
      memoryAfter: {
        heapUsed: `${Math.round(memAfter.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memAfter.heapTotal / 1024 / 1024)}MB`,
        delta: `${Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024)}MB`
      }
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
    logger.error('❌ Interview video upload error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

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
    
    // Log memory before upload
    const memBefore = process.memoryUsage();
    logger.info('📊 Memory before resume upload:', {
      heapUsed: `${Math.round(memBefore.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memBefore.heapTotal / 1024 / 1024)}MB`
    });

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

    logger.info('📄 Starting resume upload', {
      userId,
      fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype
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

    // Log memory after upload
    const memAfter = process.memoryUsage();
    logger.info('✅ Resume uploaded successfully', {
      userId,
      resumeUrl: uploadResult.secure_url,
      fileName: uploadResult.fileName,
      memoryAfter: {
        heapUsed: `${Math.round(memAfter.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memAfter.heapTotal / 1024 / 1024)}MB`,
        delta: `${Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024)}MB`
      }
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
    logger.error('❌ Resume upload error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

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
    
    // Log memory before upload
    const memBefore = process.memoryUsage();
    logger.info('📊 Memory before profile picture upload:', {
      heapUsed: `${Math.round(memBefore.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memBefore.heapTotal / 1024 / 1024)}MB`
    });

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

    logger.info('🖼️ Starting profile picture upload', {
      userId,
      fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype
    });

    // Upload to Cloudinary with image optimization
    const uploadResult = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      {
        tags: ['profile', `user_${userId}`],
        width: 500,
        height: 500,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto'
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

    // Log memory after upload
    const memAfter = process.memoryUsage();
    logger.info('✅ Profile picture uploaded successfully', {
      userId,
      profilePictureUrl: uploadResult.secure_url,
      memoryAfter: {
        heapUsed: `${Math.round(memAfter.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memAfter.heapTotal / 1024 / 1024)}MB`,
        delta: `${Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024)}MB`
      }
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
    logger.error('❌ Profile picture upload error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

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
