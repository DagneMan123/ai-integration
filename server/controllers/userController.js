const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { uploadToCloud } = require('../utils/cloudStorage');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    // Prisma uses findUnique and 'include' for relations
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: true,
        company: true
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Don't send password back
    delete user.password;

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, ...otherFields } = req.body;

    // 1. Update basic user info
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone }
    });

    // 2. Update role-specific profile
    if (user.role === 'candidate') {
      await prisma.candidateProfile.update({
        where: { userId: user.id },
        data: otherFields
      });
    } else if (user.role === 'employer') {
      await prisma.company.update({
        where: { userId: user.id },
        data: otherFields
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    // Upload to cloud storage
    const avatarUrl = await uploadToCloud(req.file, 'avatars');

    // Update user
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl }
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl }
    });
  } catch (error) {
    next(error);
  }
};

// Delete account (Soft delete)
exports.deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};