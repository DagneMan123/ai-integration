const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Get all jobs (public)
exports.getAllJobs = async (req, res, next) => {
  try {
    const { 
      search, 
      experienceLevel, 
      location, 
      page = 1, 
      limit = 10,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      status: 'ACTIVE'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    const orderBy = {};
    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }

    const [jobs, count] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: { 
              id: true, 
              name: true, 
              logoUrl: true, 
              industry: true, 
              isVerified: true 
            }
          }
        },
        orderBy: Object.keys(orderBy).length ? orderBy : { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / take)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single job
exports.getJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined' || id.trim() === '') {
      return next(new AppError('Invalid job ID', 400));
    }
    
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return next(new AppError('Invalid job ID', 400));
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: { 
            id: true, 
            name: true, 
            logoUrl: true, 
            industry: true, 
            description: true, 
            website: true, 
            isVerified: true 
          }
        }
      }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Create job (employer only)
exports.createJob = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user.id }
    });

    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    const job = await prisma.job.create({
      data: {
        ...req.body,
        companyId: company.id,
        createdById: req.user.id
      }
    });

    logger.info(`Job created: ${job.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Update job
exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined' || id.trim() === '') {
      return next(new AppError('Invalid job ID', 400));
    }
    
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return next(new AppError('Invalid job ID', 400));
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.createdById !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this job', 403));
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

// Delete job
exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined' || id.trim() === '') {
      return next(new AppError('Invalid job ID', 400));
    }
    
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return next(new AppError('Invalid job ID', 400));
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.createdById !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this job', 403));
    }

    await prisma.job.delete({
      where: { id: jobId }
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get employer jobs
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user.id }
    });

    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// Update job status
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || id === 'undefined' || id.trim() === '') {
      return next(new AppError('Invalid job ID', 400));
    }
    
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return next(new AppError('Invalid job ID', 400));
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.createdById !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Job status updated',
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};