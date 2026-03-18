require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection, prisma } = require('./config/database'); 
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Database Connection
const startDB = async () => {
  await testConnection();
  
  logger.info(' Prisma Client is ready');
};
startDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP' }
});
app.use('/api/', limiter);

// Body parser - UTF-8 (አማርኛ) እንዲደግፍ limit ተጨምሮለታል
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));

// Messages route - only enable if migration has been run
try {
  if (prisma.message) {
    app.use('/api/messages', require('./routes/messages'));
    logger.info('✅ Message service enabled');
  } else {
    logger.warn('⚠️  Message service disabled - database migration not run yet');
    // Provide a helpful endpoint
    app.use('/api/messages', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Message service is not available. Please run: npx prisma migrate dev --name add_messages'
      });
    });
  }
} catch (error) {
  logger.warn('⚠️  Message service disabled:', error.message);
  app.use('/api/messages', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Message service is not available. Please run database migration.'
    });
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;