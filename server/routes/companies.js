const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes (no auth required) - MUST come first
router.get('/', companyController.getAllCompanies);

// Protected routes (auth + employer role required) - MUST come before /:id
router.use(authenticateToken, authorizeRoles('EMPLOYER'));

router.get('/profile', companyController.getMyCompany);
router.put('/profile', companyController.updateCompany);
router.post('/logo', upload.single('logo'), companyController.uploadLogo);

// Dynamic ID route - MUST come last
router.get('/:id', companyController.getCompany);

module.exports = router;
