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

    const result = await prisma.$transaction(
      async (tx) => {
        const existingApplication = await tx.application.findUnique({
          where: {
            jobId_candidateId: {
              jobId: jobIdInt,
              candidateId: userId
            }
          }
        });

        if (existingApplication) {
          throw new AppError('You have already applied for this job', 400);
        }

        const application = await tx.application.create({
          data: {
            jobId: jobIdInt,
            candidateId: userId,
            coverLetter: coverLetter || "",
            status: 'PENDING',
            appliedAt: new Date()
          }
        });

        const interview = await tx.interview.create({
          data: {
            jobId: jobIdInt,
            candidateId: userId,
            applicationId: application.id,
            status: 'PENDING',
            interviewMode: 'text',
            questions: null
          }
        });

        return { application, interview };
      },
      {
        timeout: 30000,
        isolationLevel: 'Serializable'
      }
    );

    logger.info(`Application created: App ${result.application.id} for User ${userId} on Job ${jobIdInt}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: result.application
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new AppError('You have already applied for this job', 400));
    }
    logger.error('Error in createApplication:', error.message);
    next(error);
  }
};

/**
 * POST /api/applications/deduplicate
 * Admin endpoint to remove duplicate applications
 */
exports.deduplicateApplications = async (req, res, next) => {
  try {
    const duplicates = await prisma.$queryRaw`
      SELECT jobId, candidateId, COUNT(*) as count
      FROM applications
      GROUP BY jobId, candidateId
      HAVING COUNT(*) > 1
    `;

    let removedCount = 0;

    for (const dup of duplicates) {
      const apps = await prisma.application.findMany({
        where: {
          jobId: dup.jobId,
          candidateId: dup.candidateId
        },
        orderBy: { appliedAt: 'desc' }
      });

      if (apps.length > 1) {
        const toKeep = apps[0];
        const toDelete = apps.slice(1);

        for (const app of toDelete) {
          await prisma.application.delete({ where: { id: app.id } });
          removedCount++;
        }
      }
    }

    logger.info(`Deduplicated applications: removed ${removedCount} duplicates`);

    res.json({
      success: true,
      message: `Removed ${removedCount} duplicate applications`,
      data: { removedCount }
    });
  } catch (error) {
    logger.error('Error in deduplicateApplications:', error.message);
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
