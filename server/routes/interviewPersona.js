const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const interviewController = require('../controllers/interviewController');

// Get interview personas
router.get('/personas', interviewController.getInterviewPersonas);

// Get persona details
router.get('/personas/:personaId', interviewController.getPersonaDetails);

// All other routes require authentication
router.use(authenticateToken);

// Create interview with persona
router.post('/personas/:personaId/interview', interviewController.createInterviewWithPersona);

module.exports = router;
