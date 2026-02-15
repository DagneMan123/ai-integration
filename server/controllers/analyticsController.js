const User = require('../models/User');
const Job = require('../models/Job');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const Company = require('../models/Company');
const { AppError } = require('../middleware/errorHandler');

// Candidate dashboard analytics
exports.getCandidateDashboard = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const [applications, interviews, avgScore] = await Promise.all([
      Application.countDocuments({ candidateId }),
      Interview.countDocuments({ candidateId }),
      Interview.aggregate([
        { $match: { candidateId: candidateId, status: 'completed' } },
        { $group: { _id: null, avgScore: { $avg: '$aiEvaluation.overallScore' } } }
      ])
    ]);

    const recentInterviews = await Interview.find({ candidateId })
      .populate('jobId', 'title')
      .sort('-createdAt')
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        totalApplications: applications,
        totalInterviews: interviews,
        averageScore: avgScore[0]?.avgScore || 0,
        recentInterviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// Candidate performance analytics
exports.getCandidatePerformance = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const interviews = await Interview.find({
      candidateId,
      status: 'completed'
    }).sort('completedAt').lean();

    const performanceData = interviews.map(interview => ({
      date: interview.completedAt,
      score: interview.aiEvaluation?.overallScore || 0,
      jobTitle: interview.jobId?.title
    }));

    const skillsAnalysis = await Interview.aggregate([
      { $match: { candidateId: candidateId, status: 'completed' } },
      { $unwind: '$aiEvaluation.skillScores' },
      {
        $group: {
          _id: '$aiEvaluation.skillScores.skill',
          avgScore: { $avg: '$aiEvaluation.skillScores.score' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        performanceTrend: performanceData,
        skillsAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};

// Employer dashboard analytics
exports.getEmployerDashboard = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    const jobs = await Job.find({ companyId: company._id });
    const jobIds = jobs.map(j => j._id);

    const [totalJobs, activeJobs, totalApplications, totalInterviews] = await Promise.all([
      Job.countDocuments({ companyId: company._id }),
      Job.countDocuments({ companyId: company._id, status: 'active' }),
      Application.countDocuments({ jobId: { $in: jobIds } }),
      Interview.countDocuments({ jobId: { $in: jobIds } })
    ]);

    const applicationsByStatus = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topJobs = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', applications: { $sum: 1 } } },
      { $sort: { applications: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        totalInterviews,
        applicationsByStatus,
        topJobs,
        subscription: company.subscription,
        aiCredits: company.aiCredits
      }
    });
  } catch (error) {
    next(error);
  }
};

// Job analytics
exports.getJobAnalytics = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    const company = await Company.findOne({ userId: req.user.id });
    if (!company || job.companyId.toString() !== company._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    const [applications, interviews, avgScore] = await Promise.all([
      Application.countDocuments({ jobId }),
      Interview.countDocuments({ jobId }),
      Interview.aggregate([
        { $match: { jobId: jobId, status: 'completed' } },
        { $group: { _id: null, avgScore: { $avg: '$aiEvaluation.overallScore' } } }
      ])
    ]);

    const applicationTrend = await Application.aggregate([
      { $match: { jobId: jobId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topCandidates = await Interview.find({ jobId, status: 'completed' })
      .populate('candidateId', 'firstName lastName email')
      .sort('-aiEvaluation.overallScore')
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        job,
        totalApplications: applications,
        totalInterviews: interviews,
        averageScore: avgScore[0]?.avgScore || 0,
        applicationTrend,
        topCandidates
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin dashboard analytics
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalJobs, totalInterviews, totalRevenue] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Job.countDocuments(),
      Interview.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalInterviews,
        totalRevenue: totalRevenue[0]?.total || 0,
        usersByRole,
        userGrowth,
        revenueByMonth
      }
    });
  } catch (error) {
    next(error);
  }
};

// Revenue analytics
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { status: 'completed' };
    if (Object.keys(dateFilter).length > 0) {
      query.paidAt = dateFilter;
    }

    const [totalRevenue, revenueByType, recentPayments] = await Promise.all([
      Payment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: query },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Payment.find(query)
        .populate('userId', 'firstName lastName email')
        .sort('-paidAt')
        .limit(20)
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueByType,
        recentPayments
      }
    });
  } catch (error) {
    next(error);
  }
};

// User analytics
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    const userActivity = await User.aggregate([
      {
        $project: {
          role: 1,
          lastLogin: 1,
          daysSinceLogin: {
            $divide: [
              { $subtract: [new Date(), '$lastLogin'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: '$role',
          avgDaysSinceLogin: { $avg: '$daysSinceLogin' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        userActivity
      }
    });
  } catch (error) {
    next(error);
  }
};
