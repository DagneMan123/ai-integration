const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCandidateDashboard, getEmployerDashboard, getAdminDashboard } = require('../controllers/dashboardController');

// Candidate Dashboard
router.get('/candidate', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const data = await getCandidateDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching candidate dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Employer Dashboard
router.get('/employer', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const data = await getEmployerDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching employer dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Admin Dashboard
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const data = await getAdminDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Broadcast update to all dashboards
router.post('/broadcast', authenticateToken, async (req, res) => {
  try {
    const { dashboard, data } = req.body;
    
    // Log the broadcast event
    console.log(`Broadcast from ${dashboard}:`, data);
    
    // In production, this would emit to WebSocket connections
    // For now, we'll just acknowledge receipt
    res.json({ success: true, message: 'Broadcast sent' });
  } catch (error) {
    console.error('Error broadcasting update:', error);
    res.status(500).json({ message: 'Failed to broadcast update' });
  }
});

// Send notification to dashboards
router.post('/notify', authenticateToken, async (req, res) => {
  try {
    const { message, type } = req.body;
    
    // Log the notification
    console.log(`Notification (${type}):`, message);
    
    // In production, this would emit to WebSocket connections
    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notification' });
  }
});

module.exports = router;
