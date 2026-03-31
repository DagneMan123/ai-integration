const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get help center articles
router.get('/articles', authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Mock data - in production, fetch from database
    const articles = [
      {
        id: 'art-1',
        title: 'How to Create an Account',
        category: 'account',
        content: 'To create an account, click on the Register button...',
        views: 1250,
        helpful: 890,
        createdAt: new Date('2026-01-15')
      },
      {
        id: 'art-2',
        title: 'How to Apply for a Job',
        category: 'jobs',
        content: 'Browse available jobs on the Jobs page...',
        views: 2100,
        helpful: 1850,
        createdAt: new Date('2026-01-20')
      },
      {
        id: 'art-3',
        title: 'Interview Preparation Guide',
        category: 'interviews',
        content: 'Prepare for your AI interview with these tips...',
        views: 3400,
        helpful: 3100,
        createdAt: new Date('2026-02-01')
      }
    ];

    let filtered = articles;
    if (category && category !== 'all') {
      filtered = filtered.filter(a => a.category === category);
    }
    if (search) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get article by ID
router.get('/articles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock data
    const article = {
      id,
      title: 'Sample Article',
      category: 'interviews',
      content: 'Full article content here...',
      views: 1500,
      helpful: 1200,
      relatedArticles: []
    };

    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark article as helpful
router.post('/articles/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    // In production, update database
    res.json({ 
      success: true, 
      message: `Article marked as ${helpful ? 'helpful' : 'not helpful'}`,
      data: { articleId: id, helpful }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get FAQ categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = [
      { id: 'account', name: 'Account & Profile', count: 12 },
      { id: 'jobs', name: 'Jobs & Applications', count: 18 },
      { id: 'interviews', name: 'Interviews & Practice', count: 25 },
      { id: 'support', name: 'Support & Contact', count: 8 }
    ];

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit support ticket
router.post('/support-ticket', authenticateToken, async (req, res) => {
  try {
    const { subject, message, category } = req.body;
    const userId = req.user.id;

    // In production, save to database
    const ticket = {
      id: `ticket-${Date.now()}`,
      userId,
      subject,
      message,
      category,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({ 
      success: true, 
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
