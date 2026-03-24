const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { logger } = require('../utils/logger');

exports.createApplication = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const candidateId = req.user.id;

    if (!jobId) return next(new AppError('Job ID is required', 400));

    const jobIdInt = parseInt(jobId, 10);
    const job = await prisma.job.findUnique({ where: { id: jobIdInt } });
    if (!job) return next(new AppError('Job not found', 404));

    const existing = await prisma.application.findFirst({
      where: { jobId: jobIdInt, candidateId }
    });
    if (existing) return next(new AppError('You have already applied for this job', 400));

    const application = await prisma.application.create({
      data: {
        jobId: jobIdInt,
        candidateId,
        status: 'PENDING',
        appliedAt: new Date()
      }
    });

    logger.info(`Application created: ${application.id} for Job: ${jobId}`);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

exports.getCandidateApplications = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const applications = await prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          select: { id: true, title: true, company: { select: { name: true } } }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

exports.getApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    });

    if (!application) return next(new AppError('Application not found', 404));
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

exports.getEmployerApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jobs = await prisma.job.findMany({
      where: { createdById: userId },
      select: { id: true }
    });

    const jobIds = jobs.map(job => job.id);
    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } },
        job: { select: { title: true } }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

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

    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['PENDING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return next(new AppError('Application not found', 404));

    const updated = await prisma.application.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.shortlistCandidate = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: true }
    });

    if (!application) return next(new AppError('Application not found', 404));

    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'SHORTLISTED' }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.withdrawApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const candidateId = req.user.id;

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) return next(new AppError('Application not found', 404));
    if (application.candidateId !== candidateId) {
      return next(new AppError('Unauthorized', 403));
    }

    await prisma.application.delete({ where: { id } });
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    next(error);
  }
};
