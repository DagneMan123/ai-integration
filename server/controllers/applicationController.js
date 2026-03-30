const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * POST /api/applications
 * logic: Create application and automatically create a linked Interview record.
 */
exports.createApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return next(new AppError('Job ID is required', 400));
    }

    const jobIdInt = parseInt(jobId, 10);
    const job = await prisma.job.findUnique({ where: { id: jobIdInt } });
    
    if (!job) {
      return next(new AppError('Target job not found', 404));
    }

    // Check if user already applied for this job
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: jobIdInt,
          candidateId: userId
        }
      }
    });

    if (existingApplication) {
      return next(new AppError('You have already applied for this job', 400));
    }

    // Transaction: Both records must be created together or not at all
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Application record
      const application = await tx.application.create({
        data: {
          jobId: jobIdInt,
          candidateId: userId,
          coverLetter: coverLetter || "",
          status: 'PENDING',
          appliedAt: new Date()
        }
      });

      // 2. Create the Interview record (Status: IN_PROGRESS so it's ready to use)
      const interview = await tx.interview.create({
        data: {
          jobId: jobIdInt,
          candidateId: userId,
          applicationId: application.id,
          status: 'IN_PROGRESS',
          interviewMode: 'text',
          questions: null,
          startedAt: new Date()
        }
      });

      return { application, interview };
    });

    logger.info(`Auto-Flow Success: App ${result.application.id} and Interview ${result.interview.id} created for User ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted and interview scheduled.',
      data: result.application
    });
  } catch (error) {
    logger.error('Error in createApplication:', error.message);
    next(error);
  }
};

/**
 * GET /api/applications/candidate/my-applications
 */
exports.getCandidateApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const applications = await prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: { company: { select: { name: true } } }
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

/**
 * GET /api/applications/employer/tracking
 */
exports.getEmployerApplications = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    
    const jobs = await prisma.job.findMany({
      where: { createdById: employerId },
      select: { id: true }
    });

    const jobIds = jobs.map(j => j.id);

    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } },
        job: { select: { title: true } }
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

/**
 * GET /api/applications/:id
 */
exports.getApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    if (!application) return next(new AppError('Application not found', 404));
    
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/applications/:id/status
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const updated = await prisma.application.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/applications/:id
 */
exports.withdrawApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application || application.candidateId !== req.user.id) {
      return next(new AppError('Unauthorized to withdraw this application', 403));
    }

    await prisma.application.delete({ where: { id } });
    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/applications/job/:jobId
 */
exports.getJobApplications = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.jobId, 10);
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } }
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

/**
 * POST /api/applications/:id/shortlist
 */
exports.shortlistCandidate = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'SHORTLISTED' }
    });

    res.json({
      success: true,
      message: 'Candidate shortlisted successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
