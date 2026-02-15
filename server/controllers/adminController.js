const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const ActivityLog = require('../models/ActivityLog');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { logger } = require('../utils/logger');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    let profile = {};
    if (user.role === 'employer') {
      profile = await Company.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: { user, profile }
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, isLocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (isLocked !== undefined) user.isLocked = isLocked;

    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_user_status',
      targetId: user._id,
      targetType: 'User',
      details: { isActive, isLocked }
    });

    logger.info(`User status updated: ${user.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User status updated',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.role = role;
    await user.save();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_user_role',
      targetId: user._id,
      targetType: 'User',
      details: { newRole: role }
    });

    res.json({
      success: true,
      message: 'User role updated',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await user.remove();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete_user',
      targetId: user._id,
      targetType: 'User'
    });

    logger.warn(`User deleted: ${user.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get pending companies
exports.getPendingCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({ isVerified: false })
      .populate('userId', 'email firstName lastName')
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

// Verify company
exports.verifyCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('userId');

    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    company.isVerified = true;
    company.verifiedAt = new Date();
    company.verifiedBy = req.user.id;
    await company.save();

    // Send email
    await sendEmail({
      to: company.userId.email,
      subject: 'Company Verified - SimuAI',
      html: `
        <h1>Company Verified!</h1>
        <p>Your company ${company.name} has been verified.</p>
        <p>You can now post jobs and access all employer features.</p>
      `
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'verify_company',
      targetId: company._id,
      targetType: 'Company'
    });

    res.json({
      success: true,
      message: 'Company verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Reject company
exports.rejectCompany = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const company = await Company.findById(req.params.id).populate('userId');

    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    // Send rejection email
    await sendEmail({
      to: company.userId.email,
      subject: 'Company Verification - SimuAI',
      html: `
        <h1>Company Verification Update</h1>
        <p>Unfortunately, we cannot verify your company at this time.</p>
        <p>Reason: ${reason}</p>
        <p>Please contact support for more information.</p>
      `
    });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'reject_company',
      targetId: company._id,
      targetType: 'Company',
      details: { reason }
    });

    res.json({
      success: true,
      message: 'Company rejected'
    });
  } catch (error) {
    next(error);
  }
};

// Get pending jobs
exports.getPendingJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ isApproved: false })
      .populate('companyId', 'name')
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// Approve job
exports.approveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    job.isApproved = true;
    job.approvedAt = new Date();
    job.approvedBy = req.user.id;
    await job.save();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'approve_job',
      targetId: job._id,
      targetType: 'Job'
    });

    res.json({
      success: true,
      message: 'Job approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Reject job
exports.rejectJob = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    job.status = 'rejected';
    job.rejectionReason = reason;
    await job.save();

    await ActivityLog.create({
      userId: req.user.id,
      action: 'reject_job',
      targetId: job._id,
      targetType: 'Job',
      details: { reason }
    });

    res.json({
      success: true,
      message: 'Job rejected'
    });
  } catch (error) {
    next(error);
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { action, userId, page = 1, limit = 50 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await ActivityLog.find(query)
      .populate('userId', 'email firstName lastName')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get suspicious activity
exports.getSuspiciousActivity = async (req, res, next) => {
  try {
    // Find users with high failed login attempts
    const suspiciousLogins = await User.find({
      loginAttempts: { $gte: 3 }
    }).select('email loginAttempts lastLogin').lean();

    // Find interviews with high cheating scores
    const suspiciousInterviews = await Interview.find({
      'antiCheatData.tabSwitches': { $gte: 5 }
    })
      .populate('candidateId', 'email firstName lastName')
      .populate('jobId', 'title')
      .lean();

    res.json({
      success: true,
      data: {
        suspiciousLogins,
        suspiciousInterviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get settings
exports.getSettings = async (req, res, next) => {
  try {
    // In production, store settings in database
    const settings = {
      platformName: 'SimuAI',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
      aiCostPerQuestion: 0.05,
      subscriptionPlans: {
        basic: { price: 99, credits: 100 },
        pro: { price: 299, credits: 500 },
        enterprise: { price: 999, credits: 2000 }
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// Update settings
exports.updateSettings = async (req, res, next) => {
  try {
    // In production, update settings in database
    const settings = req.body;

    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_settings',
      details: settings
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
