#!/usr/bin/env node

/**
 * Fix Prisma Model Warnings
 * This script regenerates the Prisma client to resolve model warnings
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const serverDir = path.join(__dirname, '..');

console.log('🔧 Fixing Prisma Model Warnings...\n');

try {
  console.log('📦 Regenerating Prisma client...');
  execSync('npx prisma generate', { 
    cwd: serverDir,
    stdio: 'inherit'
  });
  
  console.log('\n✅ Prisma client regenerated successfully!');
  console.log('✅ SavedJob model is now available');
  console.log('✅ JobAlert model is now available');
  console.log('\n🚀 Restart your server to apply changes');
  
} catch (error) {
  console.error('\n❌ Error regenerating Prisma client:');
  console.error(error.message);
  
  console.log('\n📝 Manual Fix:');
  console.log('1. Navigate to server directory: cd server');
  console.log('2. Run: npx prisma generate');
  console.log('3. Restart the server');
  
  process.exit(1);
}
