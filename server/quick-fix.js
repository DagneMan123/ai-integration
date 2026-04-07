#!/usr/bin/env node

/**
 * Quick Database Connection Fix
 * Automatically fixes common database connection issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function quickFix() {
  log('\n🔧 Quick Database Connection Fix\n', 'blue');

  // Step 1: Check .env file
  log('Step 1: Checking .env file...', 'yellow');
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found', 'red');
    process.exit(1);
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Fix: Remove "git" from beginning
  if (envContent.startsWith('git')) {
    log('   Fixing: Removing "git" from beginning of .env', 'cyan');
    envContent = envContent.replace(/^git/, '');
    fs.writeFileSync(envPath, envContent);
    log('   ✅ Fixed', 'green');
  }

  // Step 2: Verify DATABASE_URL
  log('\nStep 2: Verifying DATABASE_URL...', 'yellow');
  
  if (!envContent.includes('DATABASE_URL')) {
    log('❌ DATABASE_URL not found in .env', 'red');
    log('   Add this line to server/.env:', 'cyan');
    log('   DATABASE_URL="postgresql://postgres:MYlove8@localhost:5432/simuai_db?schema=public&connection_limit=10"', 'cyan');
    process.exit(1);
  }

  log('✅ DATABASE_URL found', 'green');

  // Step 3: Check PostgreSQL
  log('\nStep 3: Checking PostgreSQL...', 'yellow');
  
  try {
    // Try to connect to PostgreSQL
    const { PrismaClient } = require('@prisma/client');
    require('dotenv').config({ path: envPath });
    
    const prisma = new PrismaClient({
      log: []
    });

    await prisma.$connect();
    log('✅ PostgreSQL is running and accessible', 'green');
    
    // Check if database has tables
    try {
      const tables = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      if (tables[0].count > 0) {
        log(`✅ Database has ${tables[0].count} tables`, 'green');
      } else {
        log('⚠️  Database is empty (tables will be created on server start)', 'yellow');
      }
    } catch (e) {
      log('⚠️  Could not check tables', 'yellow');
    }

    await prisma.$disconnect();

  } catch (error) {
    log('❌ PostgreSQL connection failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('\n   Make sure PostgreSQL is running:', 'cyan');
    log('   Windows: Start-Service -Name "postgresql-x64-15"', 'cyan');
    log('   macOS: brew services start postgresql', 'cyan');
    log('   Linux: sudo systemctl start postgresql', 'cyan');
    process.exit(1);
  }

  // Step 4: Summary
  log('\n✅ All checks passed!\n', 'green');
  log('You can now start the server with:', 'cyan');
  log('   npm run dev\n', 'cyan');
}

quickFix().catch(error => {
  log(`\n❌ Error: ${error.message}\n`, 'red');
  process.exit(1);
});
