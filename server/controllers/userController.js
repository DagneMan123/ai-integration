const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const Company = require('../models/Company');
const { AppError } = require('../middleware/errorHandler');
const { uploadToCloud } = require('../utils/cloudStorage');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    let profile = { user };

    if (user.role === 'candidate') {
      const candidateProfile = await CandidateProfile.findOne({ userId: user._id });
      profile.candidateProfile = candidateProfile;
    } else if (user.role === 'employer') {
      const company = await Company.findOne({ userId: user._id });
      profile.company = company;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, ...otherFields } = req.body;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    );

    // Update role-specific profile
    if (user.role === 'candidate') {
      await CandidateProfile.findOneAndUpdate(
        { userId: user._id },
        otherFields,
        { new: true, runValidators: true }
      );
    } else if (user.role === 'employer') {
      await Company.findOneAndUpdate(
        { userId: user._id },
        otherFields,
        { new: true, runValidators: true }
      );
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

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

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
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl }
    });
  } catch (error) {
    next(error);
  }
};

// Delete account
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Soft delete
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
