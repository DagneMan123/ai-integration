const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Get all job alerts for a candidate
exports.getJobAlerts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const alerts = await prisma.$queryRaw`
      SELECT 
        id,
        user_id as "userId",
        job_id as "jobId",
        keyword,
        location,
        experience_level as "experienceLevel",
        job_type as "jobType",
        is_active as "isActive",
        last_triggered as "lastTriggered",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM job_alerts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json({ success: true, data: alerts, message: 'Job alerts retrieved successfully' });
  } catch (error) {
    logger.error('Error in getJobAlerts:', error.message);
    next(error);
  }
};

// Create a job alert
exports.createJobAlert = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { keyword, location, experienceLevel, jobType } = req.body;

    if (!keyword) {
      return next(new AppError('Keyword is required', 400));
    }

    const result = await prisma.$queryRaw`
      INSERT INTO job_alerts (user_id, keyword, location, experience_level, job_type, is_active, created_at, updated_at)
      VALUES (${userId}, ${keyword}, ${location || null}, ${experienceLevel || null}, ${jobType || null}, true, NOW(), NOW())
      RETURNING id, user_id as "userId", job_id as "jobId", keyword, location, experience_level as "experienceLevel", job_type as "jobType", is_active as "isActive", last_triggered as "lastTriggered", created_at as "createdAt", updated_at as "updatedAt"
    `;

    res.status(201).json({ success: true, data: result[0], message: 'Job alert created successfully' });
  } catch (error) {
    logger.error('Error in createJobAlert:', error.message);
    next(error);
  }
};

// Update a job alert
exports.updateJobAlert = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { keyword, location, experienceLevel, jobType, isActive } = req.body;

    const alert = await prisma.$queryRaw`
      SELECT * FROM job_alerts WHERE id = ${parseInt(id)}
    `;

    if (!alert || alert.length === 0) {
      return next(new AppError('Job alert not found', 404));
    }

    if (alert[0].user_id !== userId) {
      return next(new AppError('Unauthorized', 403));
    }

    const updated = await prisma.$queryRaw`
      UPDATE job_alerts
      SET 
        keyword = ${keyword || alert[0].keyword},
        location = ${location !== undefined ? location : alert[0].location},
        experience_level = ${experienceLevel !== undefined ? experienceLevel : alert[0].experience_level},
        job_type = ${jobType !== undefined ? jobType : alert[0].job_type},
        is_active = ${isActive !== undefined ? isActive : alert[0].is_active},
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING id, user_id as "userId", job_id as "jobId", keyword, location, experience_level as "experienceLevel", job_type as "jobType", is_active as "isActive", last_triggered as "lastTriggered", created_at as "createdAt", updated_at as "updatedAt"
    `;

    res.json({ success: true, data: updated[0], message: 'Job alert updated successfully' });
  } catch (error) {
    logger.error('Error in updateJobAlert:', error.message);
    next(error);
  }
};

// Delete a job alert
exports.deleteJobAlert = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const alert = await prisma.$queryRaw`
      SELECT * FROM job_alerts WHERE id = ${parseInt(id)}
    `;

    if (!alert || alert.length === 0) {
      return next(new AppError('Job alert not found', 404));
    }

    if (alert[0].user_id !== userId) {
      return next(new AppError('Unauthorized', 403));
    }

    await prisma.$executeRaw`
      DELETE FROM job_alerts WHERE id = ${parseInt(id)}
    `;

    res.json({ success: true, message: 'Job alert deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteJobAlert:', error.message);
    next(error);
  }
};

// Get matching jobs for an alert
exports.getMatchingJobs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await prisma.$queryRaw`
      SELECT * FROM job_alerts WHERE id = ${parseInt(id)}
    `;

    if (!alert || alert.length === 0) {
      return next(new AppError('Job alert not found', 404));
    }

    if (alert[0].user_id !== userId) {
      return next(new AppError('Unauthorized', 403));
    }

    const alertData = alert[0];

    // Build dynamic SQL query based on alert criteria
    let whereClause = "j.status = 'ACTIVE'";
    const params = [];

    if (alertData.keyword) {
      whereClause += ` AND (j.title ILIKE $${params.length + 1} OR j.description ILIKE $${params.length + 1})`;
      params.push(`%${alertData.keyword}%`);
    }

    if (alertData.location) {
      whereClause += ` AND j.location ILIKE $${params.length + 1}`;
      params.push(`%${alertData.location}%`);
    }

    if (alertData.experience_level) {
      whereClause += ` AND j.experience_level = $${params.length + 1}`;
      params.push(alertData.experience_level);
    }

    if (alertData.job_type) {
      whereClause += ` AND j.job_type = $${params.length + 1}`;
      params.push(alertData.job_type);
    }

    const matchingJobs = await prisma.$queryRawUnsafe(`
      SELECT 
        j.id,
        j.title,
        j.description,
        j.location,
        j.experience_level as "experienceLevel",
        j.job_type as "jobType",
        j.status,
        json_build_object(
          'id', c.id,
          'name', c.name
        ) as company
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE ${whereClause}
      LIMIT 20
    `, ...params);

    res.json({ success: true, data: matchingJobs, message: 'Matching jobs retrieved successfully' });
  } catch (error) {
    logger.error('Error in getMatchingJobs:', error.message);
    next(error);
  }
};
