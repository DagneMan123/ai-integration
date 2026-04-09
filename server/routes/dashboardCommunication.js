const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const dashboardCommService = require('../services/dashboardCommunicationService');
const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');

/**
 * Dashboard Communication Routes
 * Handles real-time communication between all 3 dashboards
 */

// Get message history for current dashboard
router.get('/messages/:dashboard', authenticateToken, async (req, res) => {
  try {
    const { dashboard } = req.params;
    const { limit = 50 } = req.query;

    // Validate dashboard
    if (!['candidate', 'employer', 'admin'].includes(dashboard)) {
      return res.status(400).json({ message: 'Invalid dashboard' });
    }

    const messages = await dashboardCommService.getMessageHistory(dashboard, parseInt(limit));
    res.json({ success: true, data: messages });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Get real-time stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await dashboardCommService.getRealTimeStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Candidate: Notify application update
router.post('/notify/application-update', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { applicationId, status } = req.body;

    const data = await dashboardCommService.notifyApplicationUpdate(
      req.user.id,
      applicationId,
      status
    );

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error notifying application update:', error);
    res.status(500).json({ message: 'Failed to notify application update' });
  }
});

// Employer: Notify interview update
router.post('/notify/interview-update', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { interviewId, status } = req.body;

    const data = await dashboardCommService.notifyInterviewUpdate(
      req.user.id,
      interviewId,
      status
    );

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error notifying interview update:', error);
    res.status(500).json({ message: 'Failed to notify interview update' });
  }
});

// Admin: Notify system update
router.post('/notify/system-update', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { updateType, data } = req.body;

    const result = await dashboardCommService.notifySystemUpdate(
      req.user.id,
      updateType,
      data
    );

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error notifying system update:', error);
    res.status(500).json({ message: 'Failed to notify system update' });
  }
});

// Get notifications for dashboard
router.get('/notifications/:dashboard', authenticateToken, async (req, res) => {
  try {
    const { dashboard } = req.params;
    const { unreadOnly = false } = req.query;

    // Check if table exists
    if (!prisma.dashboardNotification) {
      return res.json({ success: true, data: [] });
    }

    const notifications = await prisma.dashboardNotification.findMany({
      where: {
        dashboard,
        ...(unreadOnly === 'true' && { read: false })
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    }).catch(err => {
      logger.warn('Failed to fetch notifications:', err.message);
      return [];
    });

    res.json({ success: true, data: notifications || [] });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.json({ success: true, data: [] });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.dashboardNotification.update({
      where: { id: parseInt(notificationId) },
      data: { read: true }
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Get activity log for application
router.get('/activity/application/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Check if table exists
    if (!prisma.applicationActivity) {
      return res.json({ success: true, data: [] });
    }

    const activities = await prisma.applicationActivity.findMany({
      where: { applicationId: parseInt(applicationId) },
      orderBy: { timestamp: 'desc' }
    }).catch(err => {
      logger.warn('Failed to fetch activity log:', err.message);
      return [];
    });

    const formattedActivities = (activities || []).map(activity => ({
      ...activity,
      details: JSON.parse(activity.details)
    }));

    res.json({ success: true, data: formattedActivities });
  } catch (error) {
    logger.error('Error fetching activity log:', error);
    res.json({ success: true, data: [] });
  }
});

// Get activity log for interview
router.get('/activity/interview/:interviewId', authenticateToken, async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Check if table exists
    if (!prisma.interviewActivity) {
      return res.json({ success: true, data: [] });
    }

    const activities = await prisma.interviewActivity.findMany({
      where: { interviewId: parseInt(interviewId) },
      orderBy: { timestamp: 'desc' }
    }).catch(err => {
      logger.warn('Failed to fetch activity log:', err.message);
      return [];
    });

    const formattedActivities = (activities || []).map(activity => ({
      ...activity,
      details: JSON.parse(activity.details)
    }));

    res.json({ success: true, data: formattedActivities });
  } catch (error) {
    logger.error('Error fetching activity log:', error);
    res.json({ success: true, data: [] });
  }
});

// Get system updates
router.get('/system-updates', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if table exists
    if (!prisma.systemUpdate) {
      return res.json({ success: true, data: [] });
    }

    const updates = await prisma.systemUpdate.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    }).catch(err => {
      logger.warn('Failed to fetch system updates:', err.message);
      return [];
    });

    const formattedUpdates = (updates || []).map(update => ({
      ...update,
      details: JSON.parse(update.details)
    }));

    res.json({ success: true, data: formattedUpdates });
  } catch (error) {
    logger.error('Error fetching system updates:', error);
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
