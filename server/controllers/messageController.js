const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// Get all messages for the authenticated user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if message model exists in prisma
    if (!prisma.message) {
      return res.status(503).json({
        success: false,
        message: 'Message service is not available. Please run database migration.'
      });
    }
    
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { recipientId: userId },
          { senderId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get a single message
exports.getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has access to this message
    if (message.senderId !== userId && message.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to message'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, body } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipientId, subject, body'
      });
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId }
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        subject,
        body,
        read: false,
        archived: false
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { read: true },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    logger.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

// Archive/Unarchive message
exports.toggleArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.senderId !== userId && message.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { archived: !message.archived },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        recipient: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    logger.error('Error toggling archive:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle archive'
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.senderId !== userId && message.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await prisma.message.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};
