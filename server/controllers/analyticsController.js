const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Candidate dashboard analytics
exports.getCandidateDashboard = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const [applicationsCount, interviewsCount, completedInterviews] = await Promise.all([
      prisma.application.count({
        where: { candidateId }
      }),
      prisma.interview.count({
        where: { candidateId }
      }),
      prisma.interview.findMany({
        where: {
          candidateId,
          status: 'COMPLETED'
        },
        select: {
          overallScore: true
        }
      })
    ]);

    // Calculate average score
    const avgScore = completedInterviews.length > 0
      ? completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedInterviews.length
      : 0;

    // Get recent interviews
    const recentInterviews = await prisma.interview.findMany({
      where: { candidateId },
      include: {
        job: {
          select: {
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        applications: applicationsCount,
        interviews: interviewsCount,
        averageScore: Math.round(avgScore),
        recentInterviews: recentInterviews.map(interview => ({
          id: interview.id,
          jobTitle: interview.job.title,
          companyName: interview.job.company.name,
          status: interview.status,
          score: interview.overallScore,
          date: interview.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('Get candidate dashboard error:', error);
    next(error);
  }
};

// Candidate performance analytics
exports.getCandidatePerformance = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const interviews = await prisma.interview.findMany({
      where: {
        candidateId,
        status: 'COMPLETED'
      },
      select: {
        overallScore: true,
        technicalScore: true,
        communicationScore: true,
        problemSolvingScore: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: {
        totalInterviews: interviews.length,
        scores: interviews.map(i => ({
          date: i.createdAt,
          overall: i.overallScore,
          technical: i.technicalScore,
          communication: i.communicationScore,
          problemSolving: i.problemSolvingScore
        }))
      }
    });
  } catch (error) {
    logger.error('Get candidate performance error:', error);
    next(error);
  }
};

// Employer dashboard analytics
exports.getEmployerDashboard = async (req, res, next) => {
  try {
    const employerId = req.user.id;

    const [jobsCount, applicationsCount, interviewsCount] = await Promise.all([
      prisma.job.count({
        where: { createdById: employerId }
      }),
      prisma.application.count({
        where: {
          job: {
            createdById: employerId
          }
        }
      }),
      prisma.interview.count({
        where: {
          job: {
            createdById: employerId
          }
        }
      })
    ]);

    // Get recent applications
    const recentApplications = await prisma.application.findMany({
      where: {
        job: {
          createdById: employerId
        }
      },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        job: {
          select: {
            title: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: {
        jobs: jobsCount,
        applications: applicationsCount,
        interviews: interviewsCount,
        recentApplications: recentApplications.map(app => ({
          id: app.id,
          candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          candidateEmail: app.candidate.email,
          jobTitle: app.job.title,
          status: app.status,
          appliedAt: app.appliedAt
        }))
      }
    });
  } catch (error) {
    logger.error('Get employer dashboard error:', error);
    next(error);
  }
};

// Job analytics for employer
exports.getJobAnalytics = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const employerId = req.user.id;

    // Verify job belongs to employer
    const job = await prisma.job.findFirst({
      where: {
        id: parseInt(jobId),
        createdById: employerId
      }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    const [applicationsCount, interviewsCount, applications] = await Promise.all([
      prisma.application.count({
        where: { jobId: parseInt(jobId) }
      }),
      prisma.interview.count({
        where: { jobId: parseInt(jobId) }
      }),
      prisma.application.groupBy({
        by: ['status'],
        where: { jobId: parseInt(jobId) },
        _count: true
      })
    ]);

    const statusBreakdown = applications.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        jobTitle: job.title,
        totalApplications: applicationsCount,
        totalInterviews: interviewsCount,
        statusBreakdown
      }
    });
  } catch (error) {
    logger.error('Get job analytics error:', error);
    next(error);
  }
};

// Admin dashboard analytics
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [usersCount, jobsCount, applicationsCount, interviewsCount, paymentsCount] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.payment.count()
    ]);

    // Get user breakdown by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    const roleBreakdown = usersByRole.reduce((acc, item) => {
      acc[item.role.toLowerCase()] = item._count;
      return acc;
    }, {});

    // Get recent activity
    const recentActivity = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      success: true,
      data: {
        users: usersCount,
        jobs: jobsCount,
        applications: applicationsCount,
        interviews: interviewsCount,
        payments: paymentsCount,
        usersByRole: roleBreakdown,
        recentActivity: recentActivity.map(log => ({
          id: log.id,
          action: log.action,
          description: log.description,
          userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
          timestamp: log.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('Get admin dashboard error:', error);
    next(error);
  }
};

// Revenue analytics for admin
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED'
      },
      select: {
        amount: true,
        createdAt: true,
        currency: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Group by month
    const monthlyRevenue = payments.reduce((acc, payment) => {
      const month = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += parseFloat(payment.amount);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalRevenue,
        currency: payments[0]?.currency || 'ETB',
        monthlyRevenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({
          month,
          amount
        }))
      }
    });
  } catch (error) {
    logger.error('Get revenue analytics error:', error);
    next(error);
  }
};

// User analytics for admin
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        createdAt: true,
        role: true,
        isActive: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by month
    const userGrowth = users.reduce((acc, user) => {
      const month = user.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, candidate: 0, employer: 0, admin: 0 };
      }
      acc[month].total++;
      acc[month][user.role.toLowerCase()]++;
      return acc;
    }, {});

    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.length - activeUsers;

    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
        userGrowth: Object.entries(userGrowth).map(([month, data]) => ({
          month,
          ...data
        }))
      }
    });
  } catch (error) {
    logger.error('Get user analytics error:', error);
    next(error);
  }
};
