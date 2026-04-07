const { logger } = require('../utils/logger');

/**
 * Initialize database tables if they don't exist
 * This runs on server startup to ensure all tables are created
 */
async function initDatabase(prisma) {
  try {
    logger.info('🔄 Initializing database tables...');

    // Create DashboardMessage table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "dashboard_messages" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "fromDashboard" TEXT NOT NULL,
        "toDashboard" TEXT,
        "eventType" TEXT NOT NULL,
        "data" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "read" BOOLEAN NOT NULL DEFAULT false
      );
    `);

    // Create ApplicationActivity table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "application_activities" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "applicationId" INTEGER NOT NULL,
        "action" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create InterviewActivity table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "interview_activities" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "interviewId" INTEGER NOT NULL,
        "action" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create SystemUpdate table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "system_updates" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "adminId" INTEGER NOT NULL,
        "updateType" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create DashboardNotification table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "dashboard_notifications" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "dashboard" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'info',
        "data" TEXT,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "dashboard_messages_fromDashboard_idx" 
      ON "dashboard_messages"("fromDashboard");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "dashboard_messages_timestamp_idx" 
      ON "dashboard_messages"("timestamp");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "dashboard_notifications_dashboard_idx" 
      ON "dashboard_notifications"("dashboard");
    `);

    logger.info('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    logger.error('❌ Error initializing database tables:', error.message);
    // Don't throw - allow server to continue
    return false;
  }
}

module.exports = { initDatabase };
