const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Get all saved jobs for a candidate
exports.getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Use raw SQL query as fallback if SavedJob model is not available
    const savedJobs = await prisma.$queryRaw`
      SELECT 
        sj.id,
        sj.user_id as "userId",
        sj.job_id as "jobId",
        sj.saved_at as "savedAt",
        json_build_object(
          'id', j.id,
          'title', j.title,
          'location', j.location,
          'company', json_build_object(
            'id', c.id,
            'name', c.name
          )
        ) as job
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE sj.user_id = ${userId}
      ORDER BY sj.saved_at DESC
    `;

    res.json({ success: true, data: savedJobs, message: 'Saved jobs retrieved successfully' });
  } catch (error) {
    logger.error('Error in getSavedJobs:', error.message);
    next(error);
  }
};

// Save a job
exports.saveJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;

    if (!jobId) {
      return next(new AppError('Job ID is required', 400));
    }

    // Check if job exists
    const job = await prisma.$queryRaw`SELECT id FROM jobs WHERE id = ${parseInt(jobId)}`;

    if (!job || job.length === 0) {
      return next(new AppError('Job not found', 404));
    }

    // Check if already saved
    const existing = await prisma.$queryRaw`
      SELECT id FROM saved_jobs 
      WHERE user_id = ${userId} AND job_id = ${parseInt(jobId)}
    `;

    if (existing && existing.length > 0) {
      return next(new AppError('Job already saved', 409));
    }

    // Insert the saved job
    await prisma.$executeRaw`
      INSERT INTO saved_jobs (user_id, job_id, saved_at)
      VALUES (${userId}, ${parseInt(jobId)}, NOW())
    `;

    // Fetch the newly saved job with details
    const savedJob = await prisma.$queryRaw`
      SELECT 
        sj.id,
        sj.user_id as "userId",
        sj.job_id as "jobId",
        sj.saved_at as "savedAt",
        json_build_object(
          'id', j.id,
          'title', j.title,
          'location', j.location,
          'company', json_build_object(
            'id', c.id,
            'name', c.name
          )
        ) as job
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE sj.user_id = ${userId} AND sj.job_id = ${parseInt(jobId)}
      LIMIT 1
    `;

    res.status(201).json({ success: true, data: savedJob[0], message: 'Job saved successfully' });
  } catch (error) {
    logger.error('Error in saveJob:', error.message);
    next(error);
  }
};

// Remove a saved job
exports.removeSavedJob = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    // Check if saved job exists
    const savedJob = await prisma.$queryRaw`
      SELECT id FROM saved_jobs 
      WHERE user_id = ${userId} AND job_id = ${parseInt(jobId)}
    `;

    if (!savedJob || savedJob.length === 0) {
      return next(new AppError('Saved job not found', 404));
    }

    // Delete the saved job
    await prisma.$executeRaw`
      DELETE FROM saved_jobs 
      WHERE user_id = ${userId} AND job_id = ${parseInt(jobId)}
    `;

    res.json({ success: true, message: 'Job removed from saved' });
  } catch (error) {
    logger.error('Error in removeSavedJob:', error.message);
    next(error);
  }
};

// Check if a job is saved
exports.isJobSaved = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const savedJob = await prisma.$queryRaw`
      SELECT id FROM saved_jobs 
      WHERE user_id = ${userId} AND job_id = ${parseInt(jobId)}
    `;

    res.json({ success: true, data: { isSaved: savedJob && savedJob.length > 0 }, message: 'Check completed' });
  } catch (error) {
    logger.error('Error in isJobSaved:', error.message);
    next(error);
  }
};
