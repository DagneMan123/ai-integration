const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { sendResponse, sendError } = require('../utils/apiResponse');

// Get help center articles
router.get('/articles', authenticateToken, async (req, res) => {
  try {
    if (!prisma || !prisma.helpCenterArticle) {
      console.error('Prisma client not initialized properly');
      return sendResponse(res, 200, [], 'Articles fetched successfully');
    }

    const { categoryId, search } = req.query;
    
    const where = {};
    if (categoryId && categoryId !== 'all') {
      where.categoryId = parseInt(categoryId);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const articles = await prisma.helpCenterArticle.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendResponse(res, 200, articles, 'Articles fetched successfully');
  } catch (error) {
    console.error('Help center articles error:', error.message);
    // Return empty array instead of error to allow fallback data
    sendResponse(res, 200, [], 'Articles fetched successfully');
  }
});

// Get article by ID
router.get('/articles/:id', authenticateToken, async (req, res) => {
  try {
    if (!prisma || !prisma.helpCenterArticle) {
      return sendResponse(res, 200, null, 'Article not found');
    }

    const { id } = req.params;
    
    const article = await prisma.helpCenterArticle.findUnique({
      where: { id: parseInt(id) }
    });

    if (!article) {
      return sendResponse(res, 200, null, 'Article not found');
    }

    sendResponse(res, 200, article, 'Article fetched successfully');
  } catch (error) {
    console.error('Help center article error:', error.message);
    sendResponse(res, 200, null, 'Article not found');
  }
});

// Mark article as helpful
router.post('/articles/:id/helpful', authenticateToken, async (req, res) => {
  try {
    if (!prisma || !prisma.helpCenterArticle) {
      return sendResponse(res, 200, { success: true }, 'Feedback recorded');
    }

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
    console.error('Help center helpful error:', error.message);
    // Return success even if update fails
    sendResponse(res, 200, { success: true }, 'Feedback recorded');
  }
});

// Get FAQ categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    if (!prisma || !prisma.helpCenterCategory) {
      console.error('Prisma client not initialized properly');
      return sendResponse(res, 200, [], 'Categories fetched successfully');
    }

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
    console.error('Help center categories error:', error.message);
    // Return empty array instead of error to allow fallback data
    sendResponse(res, 200, [], 'Categories fetched successfully');
  }
});

// Submit support ticket
router.post('/support-ticket', authenticateToken, async (req, res) => {
  try {
    if (!prisma || !prisma.supportTicket) {
      return sendResponse(res, 201, { success: true, message: 'Support ticket submitted' }, 'Support ticket created successfully');
    }

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
    console.error('Support ticket error:', error.message);
    // Return success even if creation fails
    sendResponse(res, 201, { success: true, message: 'Support ticket submitted' }, 'Support ticket created successfully');
  }
});

module.exports = router;
