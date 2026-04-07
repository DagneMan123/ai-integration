#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if everything is configured correctly
 * Usage: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔍 Verifying SimuAI Setup...\n');

let allGood = true;

// Check 1: .env file exists
console.log('1️⃣  Checking .env file...');
if (fs.existsSync('.env')) {
  console.log('   ✅ .env file found');
} else {
  console.log('   ❌ .env file not found');
  allGood = false;
}

// Check 2: Node modules installed
console.log('\n2️⃣  Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('   ✅ node_modules found');
} else {
  console.log('   ❌ node_modules not found - run: npm install');
  allGood = false;
}

// Check 3: Prisma schema exists
console.log('\n3️⃣  Checking Prisma schema...');
if (fs.existsSync('prisma/schema.prisma')) {
  console.log('   ✅ Prisma schema found');
} else {
  console.log('   ❌ Prisma schema not found');
  allGood = false;
}

// Check 4: Required directories
console.log('\n4️⃣  Checking required directories...');
const dirs = ['logs', 'uploads', 'public'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`   ⚠️  Creating ${dir} directory...`);
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ ${dir} directory created`);
    } catch (error) {
      console.log(`   ❌ Failed to create ${dir}: ${error.message}`);
      allGood = false;
    }
  } else {
    console.log(`   ✅ ${dir} directory exists`);
  }
});

// Check 5: PostgreSQL connection
console.log('\n5️⃣  Checking PostgreSQL...');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  prisma.$connect()
    .then(() => {
      console.log('   ✅ PostgreSQL connection successful');
      prisma.$disconnect();
      
      if (allGood) {
        console.log('\n✅ All checks passed! You can now run: npm run dev\n');
      } else {
        console.log('\n⚠️  Some checks failed. Please fix the issues above.\n');
      }
    })
    .catch(error => {
      console.log('   ❌ PostgreSQL connection failed');
      console.log(`   Error: ${error.message}`);
      console.log('   Make sure PostgreSQL is running and DATABASE_URL is correct');
      console.log('\n❌ Setup verification failed\n');
    });
} catch (error) {
  console.log('   ❌ Error checking PostgreSQL:', error.message);
  allGood = false;
}
