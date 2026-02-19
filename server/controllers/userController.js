const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { uploadToCloud } = require('../utils/cloudStorage');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: true,
        companies: true
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, skills, experience, education, ...otherFields } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone }
    });

    if (user.role === 'CANDIDATE') {
      // Prepare candidate profile data
      const candidateData = { ...otherFields };
      
      // Handle skills - convert to array if string
      if (skills) {
        candidateData.skills = Array.isArray(skills) 
          ? skills 
          : skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      // Handle experience_level
      if (experience) {
        candidateData.experienceLevel = experience;
      }
      
      // Handle education - convert to JSON if string
      if (education) {
        candidateData.education = typeof education === 'string' 
          ? { description: education }
          : education;
      }

      await prisma.candidateProfile.update({
        where: { userId: user.id },
        data: candidateData
      });
    } else if (user.role === 'EMPLOYER') {
      // Find the company created by this user
      const company = await prisma.company.findFirst({
        where: { createdById: user.id }
      });
      
      if (company) {
        await prisma.company.update({
          where: { id: company.id },
          data: otherFields
        });
      }
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
      where: { id: req.user.id },
      select: { passwordHash: true }
    });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hashedPassword }
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

    const avatarUrl = await uploadToCloud(req.file, 'avatars');

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