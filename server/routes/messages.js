const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all messages for the user
router.get('/', messageController.getMessages);

// Get a specific message
router.get('/:id', messageController.getMessage);

// Send a new message
router.post('/', messageController.sendMessage);

// Mark message as read
router.patch('/:id/read', messageController.markAsRead);

// Toggle archive status
router.patch('/:id/archive', messageController.toggleArchive);

// Delete a message
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
