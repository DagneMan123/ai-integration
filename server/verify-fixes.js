#!/usr/bin/env node

/**
 * Verification script to check if all fixes are applied correctly
 * Run this after starting the server to verify everything is working
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('./utils/logger');

console.log('\n🔍 Verifying all fixes...\n');

let allGood = true;

// Check 1: Verify .env file
console.log('1️⃣  Checking .env file...');
try {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('git"postgresql')) {
    console.log('   ❌ ERROR: .env file still has "git" prefix in DATABASE_URL');
    allGood = false;
  } else if (envContent.includes('DATABASE_URL')) {
    console.log('   ✅ .env file looks good');
  } else {
    console.log('   ❌ ERROR: DATABASE_URL not found in .env');
    allGood = false;
  }
} catch (error) {
  console.log('   ❌ ERROR: Could not read .env file:', error.message);
  allGood = false;
}

// Check 2: Verify initDatabase.js
console.log('\n2️⃣  Checking initDatabase.js...');
try {
  const initDbPath = path.join(__dirname, 'lib/initDatabase.js');
  const initDbContent = fs.readFileSync(initDbPath, 'utf8');
  
  if (initDbContent.includes('async function initDatabase(prisma)')) {
    console.log('   ✅ initDatabase accepts prisma parameter');
  } else {
    console.log('   ❌ ERROR: initDatabase function signature incorrect');
    allGood = false;
  }
  
  if (initDbContent.includes('CREATE TABLE IF NOT EXISTS "dashboard_messages"')) {
    console.log('   ✅ Dashboard tables creation code present');
  } else {
    console.log('   ❌ ERROR: Dashboard table creation code missing');
    allGood = false;
  }
} catch (error) {
  console.log('   ❌ ERROR: Could not read initDatabase.js:', error.message);
  allGood = false;
}

// Check 3: Verify server/index.js
console.log('\n3️⃣  Checking server/index.js...');
try {
  const indexPath = path.join(__dirname, 'index.js');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  if (indexContent.includes('await initDatabase(prismaCli)')) {
    console.log('   ✅ initDatabase called with prisma instance');
  } else {
    console.log('   ❌ ERROR: initDatabase not called correctly');
    allGood = false;
  }
} catch (error) {
  console.log('   ❌ ERROR: Could not read index.js:', error.message);
  allGood = false;
}

// Check 4: Verify TypeScript types in service
console.log('\n4️⃣  Checking dashboardCommunicationService.ts...');
try {
  const servicePath = path.join(__dirname, '../client/src/services/dashboardCommunicationService.ts');
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  const checks = [
    { name: 'DashboardRole export', pattern: 'export type DashboardRole' },
    { name: 'DashboardMessage export', pattern: 'export interface DashboardMessage' },
    { name: 'DashboardStats export', pattern: 'export interface DashboardStats' },
    { name: 'DashboardNotification export', pattern: 'export interface DashboardNotification' }
  ];
  
  checks.forEach(check => {
    if (serviceContent.includes(check.pattern)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ERROR: ${check.name} missing`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('   ❌ ERROR: Could not read dashboardCommunicationService.ts:', error.message);
  allGood = false;
}

// Check 5: Verify hook exports
console.log('\n5️⃣  Checking useDashboardCommunication.ts...');
try {
  const hookPath = path.join(__dirname, '../client/src/hooks/useDashboardCommunication.ts');
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  
  const checks = [
    { name: 'Message export', pattern: 'export interface Message' },
    { name: 'Notification export', pattern: 'export interface Notification' },
    { name: 'Stats export', pattern: 'export interface Stats' },
    { name: 'DashboardRole export', pattern: 'export type DashboardRole' }
  ];
  
  checks.forEach(check => {
    if (hookContent.includes(check.pattern)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ERROR: ${check.name} missing`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('   ❌ ERROR: Could not read useDashboardCommunication.ts:', error.message);
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All fixes verified successfully!');
  console.log('\nYou can now:');
  console.log('1. Start the backend: npm run dev');
  console.log('2. Start the frontend: cd ../client && npm run dev');
  console.log('3. Access the app at http://localhost:3000');
} else {
  console.log('❌ Some issues found. Please review the errors above.');
  console.log('\nRun this script again after fixing the issues.');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);
