require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection, prisma } = require('./config/database'); 
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { connectWithRetry } = require('./lib/prisma');
const { connectionCheck, lightConnectionCheck } = require('./middleware/connectionCheck');

const app = express();

// Database Connection with retry logic
const startDB = async () => {
  try {
    await connectWithRetry(5);
    await testConnection();
    logger.info('✅ Prisma Client is ready');
  } catch (error) {
    logger.error('❌ Failed to connect to database. Please ensure PostgreSQL is running.');
    logger.error('Start PostgreSQL with: Start-Service -Name "postgresql-x64-15"');
    // Don't exit - allow server to start but with limited functionality
    logger.warn('⚠️ Server starting without database connection. Some features will be unavailable.');
  }
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
  max: 500,
  message: { message: 'Too many requests from this IP' }
});
app.use('/api/', limiter);

// Body parser - UTF-8 (አማርኛ) እንዲደግፍ limit ተጨምሮለታል
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for images, logos, etc.)
app.use(express.static('public'));

// Apply connection check to critical API routes
app.use('/api/auth', lightConnectionCheck);
app.use('/api/users', lightConnectionCheck);
app.use('/api/payments', connectionCheck);
app.use('/api/wallet', connectionCheck);
app.use('/api/interviews', lightConnectionCheck);
app.use('/api/applications', lightConnectionCheck);

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
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/dashboard-data', require('./routes/dashboardData'));
app.use('/api/dashboard-communication', require('./routes/dashboardCommunication'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/webhook', require('./routes/chapaWebhook'));
app.use('/api/help-center', require('./routes/helpCenter'));
app.use('/api', require('./routes/interviewPersona'));

// Messages route - only enable if migration has been run
try {
  if (prisma.message) {
    app.use('/api/messages', require('./routes/messages'));
    logger.info(' Message service enabled');
  } else {
    logger.warn('  Message service disabled - database migration not run yet');
    // Provide a helpful endpoint
    app.use('/api/messages', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Message service is not available. Please run: npx prisma migrate dev --name add_messages'
      });
    });
  }
} catch (error) {
  logger.warn('  Message service disabled:', error.message);
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