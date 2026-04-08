const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { prisma } = require('../lib/prisma');
const { sendResponse, sendError } = require('../utils/apiResponse');

// Get help center articles
router.get('/articles', authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const articles = await prisma.helpCenterArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    sendResponse(res, 200, articles, 'Articles fetched successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

// Get article by ID
router.get('/articles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.helpCenterArticle.findUnique({
      where: { id: parseInt(id) }
    });

    if (!article) {
      return sendError(res, 404, 'Article not found');
    }

    sendResponse(res, 200, article, 'Article fetched successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

// Mark article as helpful
router.post('/articles/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    const article = await prisma.helpCenterArticle.update({
      where: { id: parseInt(id) },
      data: {
        helpful: helpful ? { increment: 1 } : { decrement: 1 }
      }
    });

    sendResponse(res, 200, article, `Article marked as ${helpful ? 'helpful' : 'not helpful'}`);
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

// Get FAQ categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.helpCenterCategory.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      count: cat._count.articles
    }));

    sendResponse(res, 200, formatted, 'Categories fetched successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

// Submit support ticket
router.post('/support-ticket', authenticateToken, async (req, res) => {
  try {
    const { subject, message, category } = req.body;
    const userId = req.user.id;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        category,
        status: 'open'
      }
    });

    sendResponse(res, 201, ticket, 'Support ticket created successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
});

module.exports = router;
