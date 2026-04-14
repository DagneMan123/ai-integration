#!/usr/bin/env node

/**
 * Migration Helper Script
 * Runs Prisma migrations for Saved Jobs and Job Alerts
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const serverDir = path.join(__dirname, '..');

console.log('🔄 Running Prisma Migration...\n');

try {
  // Check if prisma is installed
  const prismaPath = path.join(serverDir, 'node_modules', '.bin', 'prisma');
  if (!fs.existsSync(prismaPath)) {
    console.error('❌ Prisma not found. Please run: npm install');
    process.exit(1);
  }

  // Run migration
  console.log('📦 Creating migration for Saved Jobs and Job Alerts...');
  execSync('npx prisma migrate dev --name add_saved_jobs_and_alerts', {
    cwd: serverDir,
    stdio: 'inherit'
  });

  console.log('\n✅ Migration completed successfully!');
  console.log('📊 Tables created:');
  console.log('   - saved_jobs');
  console.log('   - job_alerts');
  console.log('\n🚀 Server will restart automatically with nodemon');
  console.log('💡 If not, run: npm run dev\n');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.error('\n📝 Troubleshooting:');
  console.error('1. Ensure PostgreSQL is running');
  console.error('2. Check DATABASE_URL in .env');
  console.error('3. Run: npm install');
  console.error('4. Try again: npm run migrate\n');
  process.exit(1);
}
