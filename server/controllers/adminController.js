const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { logger } = require('../utils/logger');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const where = {};
    
    if (role) {
      where.role = role.toUpperCase();
    }
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, count] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

// Get single user
exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        profilePicture: true,
        linkedinUrl: true,
        githubUrl: true,
        bio: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        candidateProfile: {
          select: {
            skills: true,
            experienceLevel: true,
            education: true,
            workExperience: true
          }
        }
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_STATUS_UPDATED',
        description: `Updated user ${user.email} status to ${isActive ? 'active' : 'inactive'}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Update user status error:', error);
    next(error);
  }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['CANDIDATE', 'EMPLOYER', 'ADMIN'].includes(role.toUpperCase())) {
      return next(new AppError('Invalid role', 400));
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: role.toUpperCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_ROLE_UPDATED',
        description: `Updated user ${user.email} role to ${role}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Update user role error:', error);
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { email: true }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_DELETED',
        description: `Deleted user ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

// Get pending companies
exports.getPendingCompanies = async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({
      where: { isVerified: false },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    logger.error('Get pending companies error:', error);
    next(error);
  }
};

// Verify company
exports.verifyCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.update({
      where: { id: parseInt(id) },
      data: { isVerified: true },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true
          }
        }
      }
    });

    // Send email notification
    await sendEmail({
      to: company.createdBy.email,
      subject: 'Company Verified - SimuAI',
      html: `
        <h1>Company Verified!</h1>
        <p>Hi ${company.createdBy.firstName},</p>
        <p>Your company "${company.name}" has been verified and approved.</p>
        <p>You can now post jobs and access all employer features.</p>
      `
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'COMPANY_VERIFIED',
        description: `Verified company ${company.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Company verified successfully',
      data: company
    });
  } catch (error) {
    logger.error('Verify company error:', error);
    next(error);
  }
};

// Reject company
exports.rejectCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true
          }
        }
      }
    });

    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    // Send rejection email
    await sendEmail({
      to: company.createdBy.email,
      subject: 'Company Verification - SimuAI',
      html: `
        <h1>Company Verification Update</h1>
        <p>Hi ${company.createdBy.firstName},</p>
        <p>Unfortunately, your company "${company.name}" verification was not approved.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>Please contact support for more information.</p>
      `
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'COMPANY_REJECTED',
        description: `Rejected company ${company.name}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Company rejected'
    });
  } catch (error) {
    logger.error('Reject company error:', error);
    next(error);
  }
};

// Get pending jobs
exports.getPendingJobs = async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'DRAFT' },
      include: {
        company: {
          select: {
            name: true
          }
        },
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    logger.error('Get pending jobs error:', error);
    next(error);
  }
};

// Approve job
exports.approveJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { status: 'ACTIVE' },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true
          }
        }
      }
    });

    // Send email notification
    await sendEmail({
      to: job.createdBy.email,
      subject: 'Job Approved - SimuAI',
      html: `
        <h1>Job Approved!</h1>
        <p>Hi ${job.createdBy.firstName},</p>
        <p>Your job posting "${job.title}" has been approved and is now live.</p>
      `
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'JOB_APPROVED',
        description: `Approved job ${job.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Job approved successfully',
      data: job
    });
  } catch (error) {
    logger.error('Approve job error:', error);
    next(error);
  }
};

// Reject job
exports.rejectJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: { status: 'CLOSED' },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true
          }
        }
      }
    });

    // Send rejection email
    await sendEmail({
      to: job.createdBy.email,
      subject: 'Job Posting Update - SimuAI',
      html: `
        <h1>Job Posting Update</h1>
        <p>Hi ${job.createdBy.firstName},</p>
        <p>Your job posting "${job.title}" was not approved.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
      `
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'JOB_REJECTED',
        description: `Rejected job ${job.title}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Job rejected'
    });
  } catch (error) {
    logger.error('Reject job error:', error);
    next(error);
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;

    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = parseInt(userId);

    const [logs, count] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      }),
      prisma.activityLog.count({ where })
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get activity logs error:', error);
    next(error);
  }
};

// Get suspicious activity
exports.getSuspiciousActivity = async (req, res, next) => {
  try {
    // Get failed login attempts
    const suspiciousLogs = await prisma.activityLog.findMany({
      where: {
        action: {
          in: ['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_ACTIVITY']
        }
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({
      success: true,
      data: suspiciousLogs
    });
  } catch (error) {
    logger.error('Get suspicious activity error:', error);
    next(error);
  }
};

// Get settings (placeholder)
exports.getSettings = async (req, res, next) => {
  try {
    // This would typically fetch from a settings table
    const settings = {
      siteName: 'SimuAI',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Get settings error:', error);
    next(error);
  }
};

// Update settings (placeholder)
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;

    // This would typically update a settings table
    // For now, just return success

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    logger.error('Update settings error:', error);
    next(error);
  }
};
