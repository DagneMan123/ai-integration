#!/usr/bin/env node

/**
 * Comprehensive Database Connection Diagnostic Tool
 * Run this to identify database connection issues
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('\n🔍 DATABASE CONNECTION DIAGNOSTIC TOOL\n');
console.log('=' .repeat(60));

// 1. Check environment variables
console.log('\n1️⃣  CHECKING ENVIRONMENT VARIABLES');
console.log('-'.repeat(60));

const requiredEnvVars = ['DATABASE_URL', 'NODE_ENV', 'PORT'];
const envStatus = {};

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive data
    const displayValue = varName === 'DATABASE_URL' 
      ? value.replace(/:[^:]*@/, ':****@')
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
    envStatus[varName] = true;
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    envStatus[varName] = false;
  }
});

// 2. Parse DATABASE_URL
console.log('\n2️⃣  PARSING DATABASE_URL');
console.log('-'.repeat(60));

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    console.log(`✅ Protocol: ${url.protocol}`);
    console.log(`✅ Hostname: ${url.hostname}`);
    console.log(`✅ Port: ${url.port || 5432}`);
    console.log(`✅ Database: ${url.pathname.split('/')[1]}`);
    console.log(`✅ Username: ${url.username}`);
  } catch (error) {
    console.log(`❌ Invalid DATABASE_URL format: ${error.message}`);
  }
} else {
  console.log('❌ DATABASE_URL not set');
}

// 3. Check .env file
console.log('\n3️⃣  CHECKING .ENV FILE');
console.log('-'.repeat(60));

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log(`✅ .env file exists at: ${envPath}`);
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  console.log(`   Total lines: ${lines.length}`);
  
  // Check for common issues
  if (envContent.includes('git ')) {
    console.log(`⚠️  WARNING: Found "git " prefix in .env file - this may corrupt DATABASE_URL`);
  }
  
  const dbUrlLine = lines.find(l => l.startsWith('DATABASE_URL'));
  if (dbUrlLine) {
    console.log(`✅ DATABASE_URL line found`);
    if (dbUrlLine.includes('git ')) {
      console.log(`❌ ERROR: DATABASE_URL has "git " prefix - MUST BE REMOVED`);
    }
  }
} else {
  console.log(`❌ .env file NOT found at: ${envPath}`);
}

// 4. Test Prisma connection
console.log('\n4️⃣  TESTING PRISMA CONNECTION');
console.log('-'.repeat(60));

(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: [],
      errorFormat: 'pretty',
    });

    console.log('⏳ Attempting to connect to database...');
    
    const startTime = Date.now();
    await prisma.$connect();
    const duration = Date.now() - startTime;
    
    console.log(`✅ Successfully connected to database (${duration}ms)`);
    
    // Test a simple query
    console.log('⏳ Running test query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`✅ Test query successful: ${JSON.stringify(result)}`);
    
    // Check tables
    console.log('\n5️⃣  CHECKING DATABASE TABLES');
    console.log('-'.repeat(60));
    
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      if (tables.length > 0) {
        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(t => {
          console.log(`   - ${t.table_name}`);
        });
      } else {
        console.log('⚠️  No tables found in database - may need to run migrations');
      }
    } catch (error) {
      console.log(`⚠️  Could not query tables: ${error.message}`);
    }
    
    await prisma.$disconnect();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE CONNECTION SUCCESSFUL\n');
    process.exit(0);
    
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    
    // Provide helpful suggestions
    console.log('\n💡 TROUBLESHOOTING SUGGESTIONS:');
    console.log('-'.repeat(60));
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('1. PostgreSQL is not running');
      console.log('   Windows: Start-Service -Name "postgresql-x64-15"');
      console.log('   Mac: brew services start postgresql');
      console.log('   Linux: sudo systemctl start postgresql');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('1. PostgreSQL is not running on the specified port');
      console.log('2. Check if port 5432 is correct in DATABASE_URL');
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('1. Check username and password in DATABASE_URL');
      console.log('2. Verify PostgreSQL user exists and password is correct');
    }
    
    if (error.message.includes('does not exist')) {
      console.log('1. Database "simuai_db" does not exist');
      console.log('2. Create it with: createdb simuai_db');
      console.log('3. Or run: npm run db:setup');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('❌ DATABASE CONNECTION FAILED\n');
    process.exit(1);
  }
})();
