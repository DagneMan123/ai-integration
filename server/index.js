require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const prisma = require('./lib/prisma');
const { initDatabase } = require('./lib/initDatabase');
const { connectionCheck, lightConnectionCheck } = require('./middleware/connectionCheck');
const { initializeCloudinary } = require('./services/cloudinaryService');

const app = express();

const startDB = async () => {
  try {
    await prisma.connectWithRetry(5);
    logger.info(' Database connection established successfully');
    
    await initDatabase(prisma);
    return true;
  } catch (error) {
    logger.error('❌ Failed to connect to database after 5 attempts.');
    logger.error('Please ensure PostgreSQL is running: Start-Service -Name "postgresql-x64-15"');
    logger.warn('⚠️ Server starting with limited functionality.');
    return false;
  }
};

let dbReady = false;
startDB().then(ready => {
  dbReady = ready;
  // Initialize Cloudinary after database is ready
  initializeCloudinary();
  dbReady = ready;
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased from 500 to 1000 to handle development
  message: { message: 'Too many requests from this IP' },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});
app.use('/api/', limiter);

// Max-Performance Upload Configuration
// Increased limits to 100MB for video uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', lightConnectionCheck);
app.use('/api/users', lightConnectionCheck);
app.use('/api/payments', connectionCheck);
app.use('/api/wallet', connectionCheck);
app.use('/api/interviews', lightConnectionCheck);
app.use('/api/applications', lightConnectionCheck);
app.use('/api/admin', lightConnectionCheck);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/saved-jobs', require('./routes/savedJobs'));
app.use('/api/job-alerts', require('./routes/jobAlerts'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/dashboard-enhanced', require('./routes/enhancedDashboard'));
app.use('/api/dashboard-data', require('./routes/dashboardData'));
app.use('/api/dashboard-communication', require('./routes/dashboardCommunication'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/video-analysis', require('./routes/videoAnalysis'));
app.use('/api/webhook', require('./routes/chapaWebhook'));
app.use('/api/help-center', require('./routes/helpCenter'));
app.use('/api', require('./routes/interviewPersona'));
app.use('/api/interview-session', require('./routes/interviewSession'));
app.use('/api/media', require('./routes/mediaUpload'));

try {
  if (prisma.message) {
    app.use('/api/messages', require('./routes/messages'));
    logger.info(' Message service enabled');
  } else {
    logger.warn('  Message service disabled - database migration not run yet');
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

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealth = await prisma.checkConnectionHealth();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date(),
      database: dbHealth ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Development endpoint to reset rate limiter
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/reset-rate-limit', (req, res) => {
    logger.info('Rate limiter reset requested');
    res.json({ 
      success: true, 
      message: 'Rate limiter will reset on next server restart',
      info: 'Rate limit window: 15 minutes, Max requests: 1000'
    });
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Database status: ${dbReady ? '✅ Connected' : '⏳ Connecting...'}`);
  logger.info(`🌐 API available at http://localhost:${PORT}`);
  logger.info(`💻 Frontend available at http://localhost:3000`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Disconnect from database
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
    
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after 30 seconds');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;