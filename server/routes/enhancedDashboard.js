const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { checkDashboardAccess } = require('../middleware/rbac');
const { logger } = require('../utils/logger');
const {
  getCandidateDashboardEnhanced,
  getEmployerDashboardEnhanced,
  getAdminDashboardEnhanced
} = require('../controllers/enhancedDashboardController');

// Middleware to ensure user is authenticated
router.use(authenticateToken);

/**
 * CANDIDATE DASHBOARD - Application Tracking & AI Score Visualization
 */
router.get('/candidate', 
  authorizeRoles('candidate'),
  checkDashboardAccess('candidate'),
  async (req, res, next) => {
    try {
      const data = await getCandidateDashboardEnhanced(req.user.id);
      
      logger.info('Candidate dashboard accessed', {
        userId: req.user.id,
        email: req.user.email
      });

      res.json({
        success: true,
        data,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Candidate dashboard error:', error);
      next(error);
    }
  }
);

/**
 * EMPLOYER DASHBOARD - Talent Discovery
 */
router.get('/employer',
  authorizeRoles('employer'),
  checkDashboardAccess('employer'),
  async (req, res, next) => {
    try {
      const data = await getEmployerDashboardEnhanced(req.user.id);
      
      logger.info('Employer dashboard accessed', {
        userId: req.user.id,
        email: req.user.email
      });

      res.json({
        success: true,
        data,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Employer dashboard error:', error);
      next(error);
    }
  }
);

/**
 * ADMIN DASHBOARD - System Health Monitoring
 */
router.get('/admin',
  authorizeRoles('admin'),
  checkDashboardAccess('admin'),
  async (req, res, next) => {
    try {
      const data = await getAdminDashboardEnhanced(req.user.id);
      
      logger.info('Admin dashboard accessed', {
        userId: req.user.id,
        email: req.user.email
      });

      res.json({
        success: true,
        data,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Admin dashboard error:', error);
      next(error);
    }
  }
);

/**
 * Get applicants for a specific job (Employer only)
 */
router.get('/employer/job/:jobId/applicants',
  authorizeRoles('employer'),
  async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const prisma = require('../lib/prisma');

      // Verify job belongs to employer
      const job = await prisma.job.findUnique({
        where: { id: parseInt(jobId) }
      });

      if (!job || job.createdById !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this job'
        });
      }

      // Get applicants sorted by AI score
      const applicants = await prisma.application.findMany({
        where: { jobId: parseInt(jobId) },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true
            }
          },
          interview: {
            select: {
              overallScore: true,
              technicalScore: true,
              communicationScore: true,
              status: true
            }
          }
        },
        orderBy: {
          interview: {
            overallScore: 'desc'
          }
        }
      });

      res.json({
        success: true,
        data: applicants.map(app => ({
          id: app.candidate.id,
          name: `${app.candidate.firstName} ${app.candidate.lastName}`,
          email: app.candidate.email,
          profilePicture: app.candidate.profilePicture,
          aiScore: app.interview?.overallScore || null,
          technicalScore: app.interview?.technicalScore || null,
          communicationScore: app.interview?.communicationScore || null,
          interviewStatus: app.interview?.status || 'PENDING',
          applicationStatus: app.status
        }))
      });
    } catch (error) {
      logger.error('Get applicants error:', error);
      next(error);
    }
  }
);

/**
 * Get video and resume for applicant (Employer only)
 */
router.get('/employer/applicant/:applicantId/video-resume',
  authorizeRoles('employer'),
  async (req, res, next) => {
    try {
      const { applicantId } = req.params;
      const prisma = require('../lib/prisma');

      // Get applicant's interview video and resume
      const applicant = await prisma.user.findUnique({
        where: { id: parseInt(applicantId) },
        include: {
          candidateProfile: {
            select: { resumeUrl: true }
          },
          interviews: {
            where: {
              job: { createdById: req.user.id }
            },
            select: {
              id: true,
              responses: true,
              overallScore: true
            },
            take: 1
          }
        }
      });

      if (!applicant) {
        return res.status(404).json({
          success: false,
          message: 'Applicant not found'
        });
      }

      const videoUrl = applicant.interviews[0]?.responses?.question_1?.videoUrl || null;
      const resumeUrl = applicant.candidateProfile?.resumeUrl || null;

      res.json({
        success: true,
        data: {
          applicantId: applicant.id,
          name: `${applicant.firstName} ${applicant.lastName}`,
          videoUrl,
          resumeUrl,
          interviewScore: applicant.interviews[0]?.overallScore || null
        }
      });
    } catch (error) {
      logger.error('Get video resume error:', error);
      next(error);
    }
  }
);

/**
 * Get system health metrics (Admin only)
 */
router.get('/admin/system-health',
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const prisma = require('../lib/prisma');

      // Check database connection
      const dbHealth = await prisma.checkConnectionHealth();

      res.json({
        success: true,
        data: {
          status: dbHealth ? 'HEALTHY' : 'UNHEALTHY',
          database: dbHealth ? 'connected' : 'disconnected',
          timestamp: new Date(),
          uptime: process.uptime(),
          memory: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
          }
        }
      });
    } catch (error) {
      logger.error('System health check error:', error);
      next(error);
    }
  }
);

module.exports = router;
