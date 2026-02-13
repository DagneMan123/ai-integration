const Job = require('../models/Job');
const Company = require('../models/Company');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

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
      sort = '-createdAt'
    } = req.query;

    const query = { status: 'active', isApproved: true };

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) query.category = category;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = { $regex: location, $options: 'i' };

    const jobs = await Job.find(query)
      .populate('companyId', 'name logo industry isVerified')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single job
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId', 'name logo industry description website isVerified');

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Increment view count
    job.views += 1;
    await job.save();

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
    // Get company
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    // Create job
    const job = await Job.create({
      ...req.body,
      companyId: company._id,
      createdBy: req.user.id
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
    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check ownership
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this job', 403));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Delete job
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check ownership
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this job', 403));
    }

    await job.remove();

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
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    const jobs = await Job.find({ companyId: company._id })
      .sort('-createdAt')
      .lean();

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
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check ownership
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    job.status = status;
    await job.save();

    res.json({
      success: true,
      message: 'Job status updated',
      data: job
    });
  } catch (error) {
    next(error);
  }
};
