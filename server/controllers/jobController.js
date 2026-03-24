const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * GET /api/jobs
 * Public: Get all active jobs with filters
 */
exports.getAllJobs = async (req, res, next) => {
  try {
    const { search, experienceLevel, location, page = 1, limit = 10, sort = 'createdAt' } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = { status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    const orderBy = sort.startsWith('-') 
      ? { [sort.substring(1)]: 'desc' } 
      : { [sort]: 'asc' };

    const [jobs, count] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logo: true, isVerified: true } }
        },
        orderBy,
        skip,
        take
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: { total: count, page: parseInt(page, 10), pages: Math.ceil(count / take) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/jobs
 * Employer Only: Create a job
 */
exports.createJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'EMPLOYER' && req.user.role !== 'ADMIN') {
      return next(new AppError('Unauthorized: Only employers can create jobs.', 403));
    }

    const company = await prisma.company.findFirst({
      where: { createdById: req.user.id }
    });

    if (!company) {
      return next(new AppError('Company profile not found. Please complete it first.', 404));
    }

    const { title, description, location, requiredSkills, experienceLevel, jobType, interviewType } = req.body;
    
    if (!title || !description || !location) {
      return next(new AppError('Missing required fields: Title, Description, or Location', 400));
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        requiredSkills: requiredSkills || [],
        experienceLevel: experienceLevel || 'entry',
        jobType: jobType || 'full-time',
        interviewType: interviewType || 'technical',
        status: 'ACTIVE',
        companyId: company.id,
        createdById: req.user.id
      }
    });

    logger.info(`Job Created: ${job.title} by Employer ID: ${req.user.id}`);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/jobs/:id
 * Employer Only: Update job details
 */
exports.updateJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) return next(new AppError('Job not found', 404));
    if (job.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Unauthorized access', 403));
    }

    // Protection: Destructure only allowed fields
    const { title, description, location, status, experienceLevel, requiredSkills } = req.body;

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { title, description, location, status, experienceLevel, requiredSkills }
    });

    res.json({ success: true, message: 'Job updated successfully', data: updatedJob });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/jobs/:id
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) return next(new AppError('Job not found', 404));
    if (job.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Unauthorized', 403));
    }

    await prisma.job.delete({ where: { id: jobId } });
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/jobs/:id
 * Get single job by ID
 */
exports.getJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: { select: { id: true, name: true, logo: true, isVerified: true } },
        _count: { select: { applications: true, interviews: true } }
      }
    });

    if (!job) return next(new AppError('Job not found', 404));
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/jobs/employer/my-jobs
 */
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { createdById: req.user.id },
      include: {
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/jobs/:id/status
 * Update job status
 */
exports.updateJobStatus = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['ACTIVE', 'CLOSED', 'DRAFT'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return next(new AppError('Job not found', 404));
    if (job.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Unauthorized', 403));
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status }
    });

    res.json({ success: true, message: 'Job status updated', data: updated });
  } catch (error) {
    next(error);
  }
};