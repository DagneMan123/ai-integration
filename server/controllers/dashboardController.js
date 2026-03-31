const prisma = require('../lib/prisma');

/**
 * Dashboard Controller - Handles all dashboard data fetching based on user role
 */

// CANDIDATE DASHBOARD
const getCandidateDashboard = async (userId) => {
  try {
    // Get candidate user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
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
      orderBy: { createdAt: 'desc' },
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
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate average score
    const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
    const averageScore = completedInterviews.length > 0
      ? completedInterviews.reduce((sum, i) => sum + (i.aiEvaluation?.overallScore || 0), 0) / completedInterviews.length
      : 0;

    // Get saved jobs count
    const savedJobs = await prisma.savedJob.count({
      where: { candidateId: userId }
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      applications: applications.map(app => ({
        id: app.id,
        jobTitle: app.job?.title,
        companyName: app.job?.company?.name,
        status: app.status,
        appliedAt: app.createdAt
      })),
      interviews: interviews.map(int => ({
        id: int.id,
        jobTitle: int.job?.title,
        companyName: int.job?.company?.name,
        status: int.status,
        score: int.aiEvaluation?.overallScore,
        date: int.createdAt
      })),
      recentInterviews: interviews.slice(0, 5),
      stats: {
        totalApplications: applications.length,
        totalInterviews: interviews.length,
        completedInterviews: completedInterviews.length,
        averageScore: Math.round(averageScore),
        savedJobs
      }
    };
  } catch (error) {
    console.error('Error in getCandidateDashboard:', error);
    throw error;
  }
};

// EMPLOYER DASHBOARD
const getEmployerDashboard = async (userId) => {
  try {
    // Get employer user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user) throw new Error('User not found');

    // Get employer jobs
    const jobs = await prisma.job.findMany({
      where: { createdById: userId },
      include: { applications: true },
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
      orderBy: { createdAt: 'desc' },
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
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
    const totalApplications = applications.length;
    const totalInterviews = interviews.length;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company?.name
      },
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        status: job.status,
        applicationsCount: job.applications?.length || 0,
        createdAt: job.createdAt
      })),
      recentApplications: applications.slice(0, 5).map(app => ({
        id: app.id,
        candidateName: app.candidate?.name,
        candidateEmail: app.candidate?.email,
        jobTitle: app.job?.title,
        status: app.status,
        appliedAt: app.createdAt
      })),
      stats: {
        jobs: jobs.length,
        activeJobs,
        applications: totalApplications,
        interviews: totalInterviews
      }
    };
  } catch (error) {
    console.error('Error in getEmployerDashboard:', error);
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

    if (!user || user.role !== 'admin') throw new Error('Unauthorized');

    // Get all users count by role
    const totalUsers = await prisma.user.count();
    const candidateCount = await prisma.user.count({ where: { role: 'candidate' } });
    const employerCount = await prisma.user.count({ where: { role: 'employer' } });
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });

    // Get all jobs
    const totalJobs = await prisma.job.count();
    const activeJobs = await prisma.job.count({ where: { status: 'ACTIVE' } });

    // Get all interviews
    const totalInterviews = await prisma.interview.count();
    const completedInterviews = await prisma.interview.count({ where: { status: 'COMPLETED' } });

    // Get all companies
    const totalCompanies = await prisma.company.count();
    const verifiedCompanies = await prisma.company.count({ where: { verified: true } });

    // Get recent activity
    const recentActivity = await prisma.interview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        candidate: true,
        job: true
      }
    });

    // Get pending items
    const pendingCompanies = await prisma.company.count({ where: { verified: false } });
    const pendingJobs = await prisma.job.count({ where: { status: 'PENDING' } });

    // Calculate total revenue (from payments)
    const payments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' }
    });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      stats: {
        totalUsers,
        candidateCount,
        employerCount,
        adminCount,
        totalJobs,
        activeJobs,
        totalInterviews,
        completedInterviews,
        totalCompanies,
        verifiedCompanies,
        totalRevenue,
        pendingCompanies,
        pendingJobs
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        action: `Interview with ${activity.candidate?.name}`,
        description: `${activity.candidate?.name} completed interview for ${activity.job?.title}`,
        timestamp: activity.createdAt,
        type: 'interview'
      })),
      systemHealth: {
        uptime: '99.9%',
        responseTime: '< 200ms',
        activeConnections: Math.floor(Math.random() * 100) + 50
      }
    };
  } catch (error) {
    console.error('Error in getAdminDashboard:', error);
    throw error;
  }
};

module.exports = {
  getCandidateDashboard,
  getEmployerDashboard,
  getAdminDashboard
};
