const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { logger } = require('../utils/logger');

// Create application
exports.createApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job || job.status !== 'active') {
      return next(new AppError('Job not available', 404));
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        candidateId: req.user.id
      }
    });

    if (existingApplication) {
      return next(new AppError('You have already applied for this job', 400));
    }

    // Get candidate profile
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id }
    });

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: req.user.id,
        coverLetter,
        resume: profile?.resume || null,
        status: 'pending'
      }
    });

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: 'Application Submitted - SimuAI',
      html: `
        <h1>Application Submitted Successfully</h1>
        <p>Your application for <strong>${job.title}</strong> has been submitted.</p>
        <p>You will be notified once the employer reviews your application.</p>
      `
    });

    logger.info(`Application created: ${application.id} for job ${jobId}`);

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
    const applications = await prisma.application.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: {
          select: {
            title: true,
            status: true,
            company: { select: { name: true, logo: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        job: true,
        candidate: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Check authorization
    const isOwner = application.candidateId === req.user.id;
    const isEmployer = application.job.createdBy === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isEmployer && !isAdmin) {
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
    const application = await prisma.application.findUnique({
      where: { id: req.params.id }
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    if (application.candidateId !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (['accepted', 'rejected'].includes(application.status)) {
      return next(new AppError('Cannot withdraw application at this stage', 400));
    }

    await prisma.application.update({
      where: { id: req.params.id },
      data: { status: 'withdrawn' }
    });

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
    const { status, sort = 'createdAt' } = req.query;

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check ownership
    if (job.createdBy !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const where = { jobId };
    if (status) where.status = status;

    // Build sorting
    const orderBy = {};
    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        candidate: {
          select: { firstName: true, lastName: true, email: true, avatar: true }
        }
      },
      orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' }
    });

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
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true }
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Check authorization
    if (application.job.createdBy !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const updatedApplication = await prisma.application.update({
      where: { id: req.params.id },
      data: { status }
    });

    // Send notification email
    const candidate = await prisma.user.findUnique({
      where: { id: application.candidateId }
    });

    if (candidate) {
      await sendEmail({
        to: candidate.email,
        subject: `Application Status Update - SimuAI`,
        html: `
          <h1>Application Status Updated</h1>
          <p>Your application for <strong>${application.job.title}</strong> has been ${status}.</p>
        `
      });
    }

    res.json({
      success: true,
      message: 'Application status updated',
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

// Shortlist candidate
exports.shortlistCandidate = async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true }
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Check authorization
    if (application.job.createdBy !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const updatedApplication = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        isShortlisted: true,
        shortlistedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Candidate shortlisted successfully',
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};