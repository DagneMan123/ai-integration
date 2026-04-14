#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🔄 Regenerating Prisma client...');
  execSync('npx prisma generate', { 
    cwd: path.resolve(__dirname),
    stdio: 'inherit'
  });
  console.log('✅ Prisma client regenerated successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to regenerate Prisma client:', error.message);
  process.exit(1);
}
