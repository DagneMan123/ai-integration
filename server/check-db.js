#!/usr/bin/env node

/**
 * Database Connection Diagnostic
 * Checks if PostgreSQL is running and database is accessible
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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

async function checkDatabase() {
  log('\n🔍 Database Connection Diagnostic\n', 'blue');

  // Check environment variables
  log('1️⃣  Checking Environment Variables', 'yellow');
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    log('❌ DATABASE_URL not found in .env', 'red');
    log('   Please add DATABASE_URL to server/.env', 'red');
    process.exit(1);
  }

  log('✅ DATABASE_URL found', 'green');
  
  // Parse connection string
  try {
    const url = new URL(dbUrl);
    log(`   Host: ${url.hostname}`, 'cyan');
    log(`   Port: ${url.port}`, 'cyan');
    log(`   Database: ${url.pathname.replace('/', '')}`, 'cyan');
    log(`   User: ${url.username}`, 'cyan');
  } catch (e) {
    log('❌ Invalid DATABASE_URL format', 'red');
    process.exit(1);
  }

  // Try to connect
  log('\n2️⃣  Attempting Database Connection', 'yellow');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn']
  });

  try {
    await prisma.$connect();
    log('✅ Successfully connected to PostgreSQL', 'green');

    // Check tables
    log('\n3️⃣  Checking Database Tables', 'yellow');
    
    try {
      const result = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      if (result.length === 0) {
        log('⚠️  No tables found in database', 'yellow');
        log('   Tables will be created automatically on server start', 'cyan');
      } else {
        log(`✅ Found ${result.length} tables:`, 'green');
        result.forEach(row => {
          log(`   - ${row.table_name}`, 'cyan');
        });
      }
    } catch (e) {
      log('⚠️  Could not query tables:', 'yellow');
      log(`   ${e.message}`, 'yellow');
    }

    // Check Prisma connection
    log('\n4️⃣  Checking Prisma Client', 'yellow');
    try {
      await prisma.$queryRaw`SELECT 1`;
      log('✅ Prisma client is working', 'green');
    } catch (e) {
      log('❌ Prisma client error:', 'red');
      log(`   ${e.message}`, 'red');
    }

    log('\n✅ Database connection is working!\n', 'green');
    log('You can now start the server with: npm run dev\n', 'cyan');

  } catch (error) {
    log('❌ Failed to connect to database', 'red');
    log(`\nError: ${error.message}\n`, 'red');

    log('Troubleshooting steps:', 'yellow');
    log('1. Make sure PostgreSQL is running', 'cyan');
    log('   Windows: Start-Service -Name "postgresql-x64-15"', 'cyan');
    log('   macOS: brew services start postgresql', 'cyan');
    log('   Linux: sudo systemctl start postgresql', 'cyan');
    
    log('\n2. Create the database if it doesn\'t exist:', 'cyan');
    log('   createdb simuai_db', 'cyan');
    
    log('\n3. Verify DATABASE_URL in server/.env:', 'cyan');
    log('   Should be: postgresql://postgres:PASSWORD@localhost:5432/simuai_db', 'cyan');
    
    log('\n4. Check PostgreSQL is listening on port 5432:', 'cyan');
    log('   Windows: netstat -ano | findstr :5432', 'cyan');
    log('   macOS/Linux: lsof -i :5432', 'cyan');

    process.exit(1);

  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(error => {
  log(`\n❌ Diagnostic failed: ${error.message}\n`, 'red');
  process.exit(1);
});
