const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');

/**
 * Dashboard Controller - Handles all dashboard data fetching based on user role
 */

// CANDIDATE DASHBOARD
const getCandidateDashboard = async (userId) => {
  try {
    // Get candidate user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true }
    });

    if (!user) throw new Error('User not found');

    // Get candidate applications
    const applications = await prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: { company: true }
        }
      },
      orderBy: { appliedAt: 'desc' },
      take: 10
    });

    // Get candidate interviews
    const interviews = await prisma.interview.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: { company: true }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    });

    // Calculate average score
    const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
    const averageScore = completedInterviews.length > 0
      ? completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedInterviews.length
      : 0;

    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      },
      applications: applications.map(app => ({
        id: app.id,
        jobTitle: app.job?.title,
        companyName: app.job?.company?.name,
        status: app.status,
        appliedAt: app.appliedAt
      })),
      interviews: interviews.map(int => ({
        id: int.id,
        jobTitle: int.job?.title,
        companyName: int.job?.company?.name,
        status: int.status,
        score: int.overallScore,
        date: int.startedAt
      })),
      recentInterviews: interviews.slice(0, 5).map(int => ({
        id: int.id,
        jobTitle: int.job?.title,
        companyName: int.job?.company?.name,
        status: int.status,
        score: int.overallScore,
        date: int.startedAt
      })),
      stats: {
        totalApplications: applications.length,
        totalInterviews: interviews.length,
        completedInterviews: completedInterviews.length,
        averageScore: Math.round(averageScore)
      }
    };
  } catch (error) {
    logger.error('Error in getCandidateDashboard:', error);
    throw error;
  }
};

// EMPLOYER DASHBOARD
const getEmployerDashboard = async (userId) => {
  try {
    // Get employer user data
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new Error('User not found');

    // Get employer jobs
    const jobs = await prisma.job.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' }
    });

    // Get applications for employer's jobs
    const applications = await prisma.application.findMany({
      where: {
        job: {
          createdById: userId
        }
      },
      include: {
        job: true,
        candidate: true
      },
      orderBy: { appliedAt: 'desc' },
      take: 10
    });

    // Get interviews for employer's jobs
    const interviews = await prisma.interview.findMany({
      where: {
        job: {
          createdById: userId
        }
      },
      include: {
        job: true,
        candidate: true
      },
      orderBy: { startedAt: 'desc' }
    });

    // Calculate stats
    const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
    const totalApplications = applications.length;
    const totalInterviews = interviews.length;

    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      },
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.createdAt
      })),
      recentApplications: applications.slice(0, 5).map(app => ({
        id: app.id,
        candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
        candidateEmail: app.candidate?.email,
        jobTitle: app.job?.title,
        status: app.status,
        appliedAt: app.appliedAt
      })),
      stats: {
        jobs: jobs.length,
        activeJobs,
        applications: totalApplications,
        interviews: totalInterviews
      }
    };
  } catch (error) {
    logger.error('Error in getEmployerDashboard:', error);
    throw error;
  }
};

// ADMIN DASHBOARD
const getAdminDashboard = async (userId) => {
  try {
    // Get admin user data
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      logger.error('User not found for admin dashboard', { userId });
      throw new Error('Unauthorized');
    }
    
    // Check if user is admin - handle both uppercase and lowercase
    const userRole = String(user.role).toUpperCase();
    logger.info('Admin dashboard access attempt', { userId, userRole, rawRole: user.role });
    
    if (userRole !== 'ADMIN') {
      logger.error('Non-admin user attempted to access admin dashboard', { userId, userRole });
      throw new Error('Unauthorized');
    }

    // Get all users count by role
    const totalUsers = await prisma.user.count();
    const candidateCount = await prisma.user.count({ where: { role: 'CANDIDATE' } });
    const employerCount = await prisma.user.count({ where: { role: 'EMPLOYER' } });
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

    // Get all jobs
    const totalJobs = await prisma.job.count();
    const activeJobs = await prisma.job.count({ where: { status: 'ACTIVE' } });

    // Get all interviews
    const totalInterviews = await prisma.interview.count();
    const completedInterviews = await prisma.interview.count({ where: { status: 'COMPLETED' } });

    // Get all companies
    const totalCompanies = await prisma.company.count();

    // Get recent activity
    const recentActivity = await prisma.interview.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: {
        candidate: true,
        job: true
      }
    });

    // Get pending items
    const pendingCompanies = await prisma.company.count({ where: { isVerified: false } });
    const pendingJobs = await prisma.job.count({ where: { status: 'DRAFT' } });

    // Calculate total revenue (from payments)
    const payments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' }
    });
    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      },
      totalUsers,
      candidateCount,
      employerCount,
      adminCount,
      totalJobs,
      activeJobs,
      totalInterviews,
      completedInterviews,
      totalCompanies,
      totalRevenue,
      pendingCompanies,
      pendingJobs,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        action: `Interview with ${activity.candidate?.firstName} ${activity.candidate?.lastName}`,
        description: `${activity.candidate?.firstName} ${activity.candidate?.lastName} completed interview for ${activity.job?.title}`,
        timestamp: activity.startedAt,
        type: 'interview'
      }))
    };
  } catch (error) {
    logger.error('Error in getAdminDashboard:', error);
    throw error;
  }
};

module.exports = {
  getCandidateDashboard,
  getEmployerDashboard,
  getAdminDashboard
};
