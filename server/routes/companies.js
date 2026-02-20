const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes (no auth required)
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompany);

// Protected routes (auth + employer role required)
router.use(authenticateToken, authorizeRoles('EMPLOYER'));

router.get('/my/profile', companyController.getMyCompany);
router.put('/my/profile', companyController.updateCompany);
router.post('/my/logo', upload.single('logo'), companyController.uploadLogo);

module.exports = router;
