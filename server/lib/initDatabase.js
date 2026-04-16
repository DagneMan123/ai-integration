const { logger } = require('../utils/logger');

async function initDatabase(prisma) {
  try {
    logger.info('🔄 Initializing database tables...');

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

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "application_activities" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "applicationId" INTEGER NOT NULL,
        "action" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "interview_activities" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "interviewId" INTEGER NOT NULL,
        "action" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "system_updates" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "adminId" INTEGER NOT NULL,
        "updateType" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    // Create saved_jobs table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "saved_jobs" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "job_id" INTEGER NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
        "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("user_id", "job_id")
      );
    `);

    // Create job_alerts table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "job_alerts" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "job_id" INTEGER REFERENCES "jobs"("id") ON DELETE SET NULL,
        "keyword" TEXT NOT NULL,
        "location" TEXT,
        "experience_level" TEXT,
        "job_type" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_triggered" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create documents table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "documents" (
        "id" SERIAL NOT NULL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "url" TEXT NOT NULL,
        "is_private" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for saved_jobs
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "saved_jobs_user_id_idx" ON "saved_jobs"("user_id");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "saved_jobs_job_id_idx" ON "saved_jobs"("job_id");
    `);

    // Create indexes for job_alerts
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "job_alerts_user_id_idx" ON "job_alerts"("user_id");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "job_alerts_job_id_idx" ON "job_alerts"("job_id");
    `);

    // Create indexes for documents
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "documents_user_id_idx" ON "documents"("user_id");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "documents_created_at_idx" ON "documents"("created_at");
    `);

    logger.info('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    logger.error('❌ Error initializing database tables:', error.message);
    return false;
  }
}

module.exports = { initDatabase };
