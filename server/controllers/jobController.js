const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Get all jobs (public)
exports.getAllJobs = async (req, res, next) => {
  try {
    const { 
      search, 
      category, 
      experienceLevel, 
      location, 
      page = 1, 
      limit = 10,
      sort = 'createdAt' // Prisma sorting uses field name
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter object
    const where = {
      status: 'active',
      isApproved: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        // skills String[] ከሆነ:
        // { skills: { hasSome: [search] } } 
      ];
    }

    if (category) where.category = category;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    // Sorting logic (Mongoose '-createdAt' to Prisma object)
    const orderBy = {};
    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }

    // Execute query with transaction for count and data
    const [jobs, count] = await prisma.$transaction([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: { name: true, logo: true, industry: true, isVerified: true }
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

// Get single job & Increment views
exports.getJob = async (req, res, next) => {
  try {
    // Prisma can update and return in one go
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
      include: {
        company: {
          select: { name: true, logo: true, industry: true, description: true, website: true, isVerified: true }
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
        createdBy: req.user.id
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
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check ownership
    if (job.createdBy !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this job', 403));
    }

    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
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
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.createdBy !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this job', 403));
    }

    await prisma.job.delete({
      where: { id: req.params.id }
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
    const { status } = req.body;
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.createdBy !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
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