const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { logger } = require('../utils/logger');

// Get employer applications (for tracking view)
exports.getEmployerApplications = async (req, res, next) => {
  try {
    // Get all jobs created by this employer
    const jobs = await prisma.job.findMany({
      where: { createdById: req.user.id },
      select: { id: true }
    });

    const jobIds = jobs.map(job => job.id);

    // Get all applications for these jobs
    const applications = await prisma.application.findMany({
      where: {
        jobId: { in: jobIds }
      },
      include: {
        candidate: {
          select: { firstName: true, lastName: true, email: true, phone: true }
        },
        job: {
          select: { title: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    // Transform for frontend
    const transformedApplications = applications.map(app => ({
      id: app.id,
      firstName: app.candidate.firstName,
      lastName: app.candidate.lastName,
      email: app.candidate.email,
      phone: app.candidate.phone || '',
      position: app.job.title,
      status: app.status.toLowerCase(),
      appliedDate: app.appliedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      rating: 0
    }));

    res.json({
      success: true,
      data: transformedApplications
    });
  } catch (error) {
    next(error);
  }
};

// Create application
exports.createApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Convert jobId to integer
    const jobIdInt = parseInt(jobId, 10);
    if (isNaN(jobIdInt)) {
      return next(new AppError('Invalid job ID', 400));
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobIdInt }
    });

    if (!job || job.status !== 'ACTIVE') {
      return next(new AppError('Job not available', 404));
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: jobIdInt,
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
        jobId: jobIdInt,
        candidateId: req.user.id,
        coverLetter,
        resumeUrl: profile?.resumeUrl || null,
        status: 'PENDING'
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

    logger.info(`Application created: ${application.id} for job ${jobIdInt}`);

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
      orderBy: { appliedAt: 'desc' }
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
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return next(new AppError('Invalid application ID', 400));
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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
    const isEmployer = application.job.createdById === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

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
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return next(new AppError('Invalid application ID', 400));
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    if (application.candidateId !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (['ACCEPTED', 'REJECTED'].includes(application.status)) {
      return next(new AppError('Cannot withdraw application at this stage', 400));
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' }
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
    const { status, sort = 'appliedAt' } = req.query;

    // Convert jobId to integer
    const jobIdInt = parseInt(jobId, 10);
    if (isNaN(jobIdInt)) {
      return next(new AppError('Invalid job ID', 400));
    }

    const job = await prisma.job.findUnique({
      where: { id: jobIdInt }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check ownership
    if (job.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized', 403));
    }

    const where = { jobId: jobIdInt };
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
          select: { firstName: true, lastName: true, email: true, profilePicture: true }
        }
      },
      orderBy: Object.keys(orderBy).length ? orderBy : { appliedAt: 'desc' }
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
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return next(new AppError('Invalid application ID', 400));
    }

    const { status } = req.body;
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Check authorization
    if (application.job.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized', 403));
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
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
    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return next(new AppError('Invalid application ID', 400));
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    // Check authorization
    if (application.job.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized', 403));
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'SHORTLISTED'
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