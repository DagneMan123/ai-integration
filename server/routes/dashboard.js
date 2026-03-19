const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Middleware to ensure user is authenticated
router.use(authenticateToken);

// Get dashboard statistics (accessible to all authenticated users)
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, activeInterviews, pendingApplications, completedInterviews, totalJobs, totalCompanies] = await Promise.all([
      prisma.user.count(),
      prisma.interview.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.interview.count({ where: { status: 'COMPLETED' } }),
      prisma.job.count(),
      prisma.company.count(),
    ]);

    const stats = {
      totalUsers,
      activeInterviews,
      pendingApplications,
      completedInterviews,
      totalJobs,
      totalCompanies,
      systemHealth: 'healthy',
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activities across all dashboards
router.get('/activities', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Fetch recent interviews
    const recentInterviews = await prisma.interview.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        job: { select: { title: true } },
      },
    });

    // Fetch recent applications
    const recentApplications = await prisma.application.findMany({
      take: limit,
      orderBy: { appliedAt: 'desc' },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        job: { select: { title: true } },
      },
    });

    // Combine and sort by date
    const activities = [
      ...recentInterviews.map(i => ({
        type: 'interview',
        id: i.id,
        title: `Interview: ${i.candidate.firstName} ${i.candidate.lastName} - ${i.job.title}`,
        status: i.status,
        timestamp: i.createdAt,
      })),
      ...recentApplications.map(a => ({
        type: 'application',
        id: a.id,
        title: `Application: ${a.candidate.firstName} ${a.candidate.lastName} - ${a.job.title}`,
        status: a.status,
        timestamp: a.appliedAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

// Get system notifications
router.get('/notifications', async (req, res, next) => {
  try {
    // Get pending applications count
    const pendingApplications = await prisma.application.count({ where: { status: 'PENDING' } });
    
    // Get active interviews count
    const activeInterviews = await prisma.interview.count({ where: { status: 'IN_PROGRESS' } });

    const notifications = [];

    if (pendingApplications > 0) {
      notifications.push({
        id: 'pending-apps',
        type: 'info',
        title: 'Pending Applications',
        message: `${pendingApplications} applications awaiting review`,
        timestamp: new Date(),
      });
    }

    if (activeInterviews > 0) {
      notifications.push({
        id: 'active-interviews',
        type: 'info',
        title: 'Active Interviews',
        message: `${activeInterviews} interviews in progress`,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
});

// Get candidate-specific shared data
router.get('/candidate/shared', authorizeRoles('candidate'), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [myApplications, myInterviews, myResults] = await Promise.all([
      prisma.application.count({ where: { candidateId: userId } }),
      prisma.interview.count({ where: { candidateId: userId } }),
      prisma.interview.count({ where: { candidateId: userId, status: 'COMPLETED' } }),
    ]);

    res.json({
      success: true,
      data: {
        myApplications,
        myInterviews,
        myResults,
        role: 'candidate',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get employer-specific shared data
router.get('/employer/shared', authorizeRoles('employer'), async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get employer's jobs
    const jobs = await prisma.job.findMany({
      where: { createdById: userId },
      select: { id: true },
    });

    const jobIds = jobs.map(j => j.id);

    const [totalJobs, totalApplications, activeInterviews] = await Promise.all([
      prisma.job.count({ where: { createdById: userId } }),
      prisma.application.count({ where: { jobId: { in: jobIds } } }),
      prisma.interview.count({ where: { jobId: { in: jobIds }, status: 'IN_PROGRESS' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        totalApplications,
        activeInterviews,
        role: 'employer',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get admin-specific shared data
router.get('/admin/shared', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const [totalUsers, totalCompanies, totalJobs, activeInterviews, pendingApplications] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.job.count(),
      prisma.interview.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.application.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCompanies,
        totalJobs,
        activeInterviews,
        pendingApplications,
        role: 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Broadcast event to all dashboards
router.post('/broadcast', async (req, res, next) => {
  try {
    const { eventType, data } = req.body;

    logger.info(`Broadcasting event: ${eventType}`, { data });

    // Log the broadcast event
    // This can be extended to store events in database for real-time updates

    res.json({
      success: true,
      message: 'Event broadcasted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
