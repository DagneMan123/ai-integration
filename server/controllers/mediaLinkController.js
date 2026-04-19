const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Save interview video URL to database
 * Frontend uploads directly to Cloudinary, then sends URL here
 * This is a lightweight endpoint - just saves the URL
 */
const saveInterviewVideoUrl = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { videoUrl, publicId, duration } = req.body;
    const userId = req.user?.id;

    // Validate inputs
    if (!interviewId) {
      return next(new AppError('Interview ID is required', 400));
    }

    if (!videoUrl) {
      return next(new AppError('Video URL is required', 400));
    }

    if (!userId) {
      return next(new AppError('User ID is required', 401));
    }

    logger.info('Saving interview video URL to database', {
      interviewId,
      userId,
      videoUrl: videoUrl.substring(0, 50) + '...',
      publicId
    });

    // Verify interview exists and belongs to user
    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(interviewId) }
    });

    if (!interview) {
      return next(new AppError('Interview not found', 404));
    }

    if (interview.candidateId !== userId) {
      return next(new AppError('Unauthorized to update this interview', 403));
    }

    // Update interview with video URL
    const updatedInterview = await prisma.interview.update({
      where: { id: parseInt(interviewId) },
      data: {
        videoUrl,
        videoPublicId: publicId || null,
        videoDuration: duration || null,
        updatedAt: new Date()
      }
    });

    logger.info('Interview video URL saved successfully', {
      interviewId,
      videoUrl: videoUrl.substring(0, 50) + '...'
    });

    return res.status(200).json({
      success: true,
      message: 'Interview video URL saved successfully',
      data: {
        interviewId: updatedInterview.id,
        videoUrl: updatedInterview.videoUrl,
        duration: updatedInterview.videoDuration,
        updatedAt: updatedInterview.updatedAt
      }
    });

  } catch (error) {
    logger.error('Error saving interview video URL:', error);
    next(error);
  }
};

/**
 * Save resume/document URL to database
 * Frontend uploads directly to Cloudinary, then sends URL here
 */
const saveResumeUrl = async (req, res, next) => {
  try {
    const { resumeUrl, publicId } = req.body;
    const userId = req.user?.id;

    // Validate inputs
    if (!resumeUrl) {
      return next(new AppError('Resume URL is required', 400));
    }

    if (!userId) {
      return next(new AppError('User ID is required', 401));
    }

    logger.info('Saving resume URL to database', {
      userId,
      resumeUrl: resumeUrl.substring(0, 50) + '...',
      publicId
    });

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update user with resume URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        resumeUrl,
        resumePublicId: publicId || null,
        updatedAt: new Date()
      }
    });

    logger.info('Resume URL saved successfully', {
      userId,
      resumeUrl: resumeUrl.substring(0, 50) + '...'
    });

    return res.status(200).json({
      success: true,
      message: 'Resume URL saved successfully',
      data: {
        userId: updatedUser.id,
        resumeUrl: updatedUser.resumeUrl,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    logger.error('Error saving resume URL:', error);
    next(error);
  }
};

/**
 * Save profile picture URL to database
 * Frontend uploads directly to Cloudinary, then sends URL here
 */
const saveProfilePictureUrl = async (req, res, next) => {
  try {
    const { profilePictureUrl, publicId } = req.body;
    const userId = req.user?.id;

    // Validate inputs
    if (!profilePictureUrl) {
      return next(new AppError('Profile picture URL is required', 400));
    }

    if (!userId) {
      return next(new AppError('User ID is required', 401));
    }

    logger.info('Saving profile picture URL to database', {
      userId,
      profilePictureUrl: profilePictureUrl.substring(0, 50) + '...',
      publicId
    });

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update user with profile picture URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: profilePictureUrl,
        profilePicturePublicId: publicId || null,
        updatedAt: new Date()
      }
    });

    logger.info('Profile picture URL saved successfully', {
      userId,
      profilePictureUrl: profilePictureUrl.substring(0, 50) + '...'
    });

    return res.status(200).json({
      success: true,
      message: 'Profile picture URL saved successfully',
      data: {
        userId: updatedUser.id,
        profilePictureUrl: updatedUser.profilePicture,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    logger.error('Error saving profile picture URL:', error);
    next(error);
  }
};

module.exports = {
  saveInterviewVideoUrl,
  saveResumeUrl,
  saveProfilePictureUrl
};
