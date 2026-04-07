#!/usr/bin/env node

/**
 * Full Startup Test Script
 * Tests all components to ensure the application is ready to run
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('\n🚀 FULL STARTUP TEST\n');
console.log('='.repeat(70));

async function runTests() {
  let allPassed = true;

  // Test 1: Check Node.js
  console.log('\n1️⃣  CHECKING NODE.JS');
  console.log('-'.repeat(70));
  try {
    const { stdout } = await execAsync('node --version');
    console.log(`✅ Node.js: ${stdout.trim()}`);
  } catch (error) {
    console.log('❌ Node.js not found');
    allPassed = false;
  }

  // Test 2: Check npm
  console.log('\n2️⃣  CHECKING NPM');
  console.log('-'.repeat(70));
  try {
    const { stdout } = await execAsync('npm --version');
    console.log(`✅ npm: ${stdout.trim()}`);
  } catch (error) {
    console.log('❌ npm not found');
    allPassed = false;
  }

  // Test 3: Check PostgreSQL
  console.log('\n3️⃣  CHECKING POSTGRESQL');
  console.log('-'.repeat(70));
  try {
    const { stdout } = await execAsync('psql --version');
    console.log(`✅ PostgreSQL: ${stdout.trim()}`);
  } catch (error) {
    console.log('⚠️  PostgreSQL command-line tools not found (OK if server is running)');
  }

  // Test 4: Check project structure
  console.log('\n4️⃣  CHECKING PROJECT STRUCTURE');
  console.log('-'.repeat(70));
  
  const requiredDirs = [
    'server',
    'client',
    'server/src',
    'client/src'
  ];

  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir}/`);
    } else {
      console.log(`❌ ${dir}/ NOT FOUND`);
      allPassed = false;
    }
  });

  // Test 5: Check configuration files
  console.log('\n5️⃣  CHECKING CONFIGURATION FILES');
  console.log('-'.repeat(70));

  const requiredFiles = [
    'server/.env',
    'server/package.json',
    'client/package.json',
    'server/prisma/schema.prisma'
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} NOT FOUND`);
      allPassed = false;
    }
  });

  // Test 6: Check .env configuration
  console.log('\n6️⃣  CHECKING .ENV CONFIGURATION');
  console.log('-'.repeat(70));

  if (fs.existsSync('server/.env')) {
    const envContent = fs.readFileSync('server/.env', 'utf8');
    
    if (envContent.includes('DATABASE_URL')) {
      console.log('✅ DATABASE_URL is set');
      
      if (envContent.includes('git DATABASE_URL')) {
        console.log('❌ ERROR: DATABASE_URL has "git " prefix - MUST BE REMOVED');
        allPassed = false;
      } else {
        console.log('✅ DATABASE_URL format is correct');
      }
    } else {
      console.log('❌ DATABASE_URL not found in .env');
      allPassed = false;
    }

    if (envContent.includes('JWT_SECRET')) {
      console.log('✅ JWT_SECRET is set');
    } else {
      console.log('❌ JWT_SECRET not found in .env');
      allPassed = false;
    }

    if (envContent.includes('PORT')) {
      console.log('✅ PORT is set');
    } else {
      console.log('❌ PORT not found in .env');
      allPassed = false;
    }
  }

  // Test 7: Check dependencies
  console.log('\n7️⃣  CHECKING DEPENDENCIES');
  console.log('-'.repeat(70));

  const serverPackageJson = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
  const criticalDeps = ['express', '@prisma/client', 'cors', 'dotenv'];

  criticalDeps.forEach(dep => {
    if (serverPackageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${serverPackageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} not found in dependencies`);
      allPassed = false;
    }
  });

  // Test 8: Check diagnostic tools
  console.log('\n8️⃣  CHECKING DIAGNOSTIC TOOLS');
  console.log('-'.repeat(70));

  const diagnosticTools = [
    'server/diagnose-connection.js',
    'server/fix-connection.js',
    'server/test-communication.js'
  ];

  diagnosticTools.forEach(tool => {
    if (fs.existsSync(tool)) {
      console.log(`✅ ${tool}`);
    } else {
      console.log(`⚠️  ${tool} not found`);
    }
  });

  // Test 9: Check documentation
  console.log('\n9️⃣  CHECKING DOCUMENTATION');
  console.log('-'.repeat(70));

  const docs = [
    'DATABASE_SETUP_GUIDE.md',
    'START_EVERYTHING.md',
    'FINAL_STARTUP_CHECKLIST.md'
  ];

  docs.forEach(doc => {
    if (fs.existsSync(doc)) {
      console.log(`✅ ${doc}`);
    } else {
      console.log(`⚠️  ${doc} not found`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  
  if (allPassed) {
    console.log('\n✅ ALL TESTS PASSED - READY TO START\n');
    console.log('Next steps:');
    console.log('1. Start PostgreSQL service');
    console.log('2. Run: cd server && npm run dev');
    console.log('3. In another terminal: cd client && npm start');
    console.log('4. Open: http://localhost:3000\n');
    return 0;
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - PLEASE FIX ISSUES ABOVE\n');
    console.log('Common fixes:');
    console.log('1. Install Node.js from https://nodejs.org/');
    console.log('2. Install PostgreSQL from https://www.postgresql.org/');
    console.log('3. Check .env file for correct configuration');
    console.log('4. Run: npm install in both server/ and client/ folders\n');
    return 1;
  }
}

runTests().then(code => {
  process.exit(code);
});
