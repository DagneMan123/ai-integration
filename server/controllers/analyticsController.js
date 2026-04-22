const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Candidate dashboard analytics - OPTIMIZED
exports.getCandidateDashboard = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    // Use single optimized query instead of multiple
    const [applicationsCount, interviewsCount, completedInterviewsCount, recentInterviews] = await Promise.all([
      prisma.application.count({
        where: { candidateId }
      }),
      prisma.interview.count({
        where: { candidateId }
      }),
      prisma.interview.count({
        where: { 
          candidateId,
          status: 'COMPLETED'
        }
      }),
      prisma.interview.findMany({
        where: { candidateId },
        select: {
          id: true,
          overallScore: true,
          status: true,
          createdAt: true,
          job: {
            select: {
              title: true,
              company: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate average score from recent interviews
    const completedInterviews = recentInterviews.filter(i => i.status === 'COMPLETED');
    const avgScore = completedInterviews.length > 0
      ? completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedInterviews.length
      : 0;

    res.json({
      success: true,
      data: {
        applications: applicationsCount,
        interviews: interviewsCount,
        completedInterviews: completedInterviewsCount,
        averageScore: Math.round(avgScore),
        recentInterviews: recentInterviews.map(interview => ({
          id: interview.id,
          jobTitle: interview.job?.title || 'N/A',
          companyName: interview.job?.company?.name || 'N/A',
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

// Employer dashboard analytics - OPTIMIZED
exports.getEmployerDashboard = async (req, res, next) => {
  try {
    const employerId = req.user.id;

    // Combine counts and recent applications in parallel
    const [jobsCount, activeJobsCount, applicationsCount, interviewsCount, recentApplications] = await Promise.all([
      prisma.job.count({
        where: { createdById: employerId }
      }),
      prisma.job.count({
        where: { 
          createdById: employerId,
          status: 'ACTIVE'
        }
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
      }),
      prisma.application.findMany({
        where: {
          job: {
            createdById: employerId
          }
        },
        select: {
          id: true,
          status: true,
          appliedAt: true,
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
      })
    ]);

    res.json({
      success: true,
      data: {
        jobs: jobsCount,
        activeJobs: activeJobsCount,
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

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [usersCount, jobsCount, applicationsCount, interviewsCount, completedInterviewsCount, paymentsCount, usersByRole, recentActivity] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.interview.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.payment.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.activityLog.findMany({
        select: {
          id: true,
          action: true,
          description: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    const roleBreakdown = usersByRole.reduce((acc, item) => {
      acc[item.role.toLowerCase()] = item._count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalUsers: usersCount,
        totalJobs: jobsCount,
        totalApplications: applicationsCount,
        totalInterviews: interviewsCount,
        completedInterviews: completedInterviewsCount,
        totalPayments: paymentsCount,
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
