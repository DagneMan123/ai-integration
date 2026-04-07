#!/usr/bin/env node

/**
 * Database Setup Script
 * Run this to initialize the database with all required tables
 * Usage: node setup-db.js
 */

const { execSync } = require('child_process');
const { logger } = require('./utils/logger');

async function setupDatabase() {
  try {
    logger.info('🔧 Starting database setup...');

    // Run Prisma migrations
    logger.info('📦 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    logger.info('✅ Database setup completed successfully!');
    logger.info('📝 All tables have been created.');
    logger.info('🚀 You can now start the server with: npm run dev');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Database setup failed:', error.message);
    logger.error('Please ensure PostgreSQL is running and DATABASE_URL is correct in .env');
    process.exit(1);
  }
}

setupDatabase();
