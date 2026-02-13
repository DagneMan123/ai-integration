const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

// Create application
exports.createApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return next(new AppError('Job not available', 404));
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user.id
    });

    if (existingApplication) {
      return next(new AppError('You have already applied for this job', 400));
    }

    // Get candidate profile
    const profile = await CandidateProfile.findOne({ userId: req.user.id });

    // Create application
    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      coverLetter,
      resume: profile?.resume,
      status: 'pending'
    });

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: 'Application Submitted - SimuAI',
      html: `
        <h1>Application Submitted Successfully</h1>
        <p>Your application for ${job.title} has been submitted.</p>
        <p>You will be notified once the employer reviews your application.</p>
      `
    });

    logger.info(`Application created: ${application._id} for job ${jobId}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Get candidate applications
exports.getCandidateApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user.id })
      .populate('jobId', 'title company location status')
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Get single application
exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId', 'firstName lastName email');

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Check authorization
    if (
      application.candidateId._id.toString() !== req.user.id &&
      req.user.role !== 'employer' &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Not authorized', 403));
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw application
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    if (application.candidateId.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (application.status === 'accepted' || application.status === 'rejected') {
      return next(new AppError('Cannot withdraw application at this stage', 400));
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get job applications (employer)
exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, sort = '-createdAt' } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check ownership
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const query = { jobId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('candidateId', 'firstName lastName email avatar')
      .sort(sort)
      .lean();

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Check authorization
    if (application.jobId.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    application.status = status;
    await application.save();

    // Send notification email
    const candidate = await User.findById(application.candidateId);
    if (candidate) {
      await sendEmail({
        to: candidate.email,
        subject: `Application Status Update - SimuAI`,
        html: `
          <h1>Application Status Updated</h1>
          <p>Your application for ${application.jobId.title} has been ${status}.</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Shortlist candidate
exports.shortlistCandidate = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Check authorization
    if (application.jobId.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    application.isShortlisted = true;
    application.shortlistedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: 'Candidate shortlisted successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};
