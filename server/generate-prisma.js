#!/usr/bin/env node

/**
 * Script to regenerate Prisma client
 * Run this after updating schema.prisma
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Regenerating Prisma Client...');

try {
  // Generate Prisma Client
  execSync('npx prisma generate', {
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });
  
  console.log('✅ Prisma Client regenerated successfully!');
  console.log('📝 Next steps:');
  console.log('   1. Run: npx prisma migrate dev --name add_messages');
  console.log('   2. Restart your server');
  
} catch (error) {
  console.error('❌ Error regenerating Prisma Client:', error.message);
  process.exit(1);
}
