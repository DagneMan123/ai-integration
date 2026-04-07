#!/usr/bin/env node

/**
 * Quick Fix Script for Database Connection Issues
 * This script attempts to automatically fix common database connection problems
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('\n🔧 DATABASE CONNECTION FIX SCRIPT\n');
console.log('='.repeat(60));

async function fixConnection() {
  try {
    // 1. Check and fix .env file
    console.log('\n1️⃣  CHECKING .ENV FILE');
    console.log('-'.repeat(60));
    
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found');
      return;
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    const originalContent = envContent;
    
    // Fix: Remove "git " prefix if present
    if (envContent.includes('git DATABASE_URL')) {
      console.log('🔧 Removing "git " prefix from DATABASE_URL...');
      envContent = envContent.replace('git DATABASE_URL', 'DATABASE_URL');
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Fixed: Removed "git " prefix');
    }
    
    // Fix: Ensure DATABASE_URL is properly formatted
    const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
    if (dbUrlMatch) {
      const dbUrl = dbUrlMatch[1];
      console.log(`✅ DATABASE_URL found: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
      
      // Validate URL format
      try {
        new URL(dbUrl);
        console.log('✅ DATABASE_URL format is valid');
      } catch (error) {
        console.log(`❌ DATABASE_URL format is invalid: ${error.message}`);
      }
    }
    
    // 2. Check PostgreSQL service
    console.log('\n2️⃣  CHECKING POSTGRESQL SERVICE');
    console.log('-'.repeat(60));
    
    try {
      // Try to connect with psql
      const { stdout } = await execAsync('psql --version', { timeout: 5000 });
      console.log(`✅ PostgreSQL is installed: ${stdout.trim()}`);
    } catch (error) {
      console.log('⚠️  PostgreSQL command-line tools not found');
      console.log('   This is OK if PostgreSQL server is running');
    }
    
    // 3. Test Prisma connection
    console.log('\n3️⃣  TESTING DATABASE CONNECTION');
    console.log('-'.repeat(60));
    
    require('dotenv').config();
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: [],
      errorFormat: 'pretty',
    });
    
    try {
      console.log('⏳ Connecting to database...');
      await prisma.$connect();
      console.log('✅ Successfully connected to database');
      
      // Test query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database is responding correctly');
      
      await prisma.$disconnect();
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ ALL CHECKS PASSED - DATABASE IS READY\n');
      return true;
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      
      // Provide specific fixes
      if (error.message.includes('Can\'t reach database server')) {
        console.log('\n💡 FIX: Start PostgreSQL service');
        console.log('   Windows: Start-Service -Name "postgresql-x64-15"');
        console.log('   Or search for "Services" and start PostgreSQL');
      }
      
      if (error.message.includes('does not exist')) {
        console.log('\n💡 FIX: Create the database');
        console.log('   Run: createdb simuai_db');
      }
      
      if (error.message.includes('password authentication failed')) {
        console.log('\n💡 FIX: Check DATABASE_URL credentials');
        console.log('   Verify username and password in .env file');
      }
      
      await prisma.$disconnect();
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

fixConnection().then(success => {
  process.exit(success ? 0 : 1);
});
