const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { getCandidateDashboard, getEmployerDashboard, getAdminDashboard } = require('../controllers/dashboardController');

// Middleware to ensure user is authenticated
router.use(authenticateToken);

// Get candidate dashboard data
router.get('/candidate', authorizeRoles('candidate'), asyncHandler(async (req, res) => {
  const data = await getCandidateDashboard(req.user.id);
  res.json({
    success: true,
    data
  });
}));

// Get employer dashboard data
router.get('/employer', authorizeRoles('employer'), asyncHandler(async (req, res) => {
  const data = await getEmployerDashboard(req.user.id);
  res.json({
    success: true,
    data
  });
}));

// Get admin dashboard data
router.get('/admin', authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const data = await getAdminDashboard(req.user.id);
  res.json({
    success: true,
    data
  });
}));

module.exports = router;
