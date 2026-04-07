#!/usr/bin/env node

/**
 * Database Diagnostic Tool
 * Checks PostgreSQL connection and database status
 */

const net = require('net');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('\n🔍 Database Diagnostic Tool\n');
console.log('='.repeat(50));

// Check 1: Port 5432 is listening
async function checkPort() {
  return new Promise((resolve) => {
    console.log('\n1️⃣  Checking if port 5432 is listening...');
    
    const socket = net.createConnection({ port: 5432, host: 'localhost' });
    
    socket.on('connect', () => {
      console.log('   ✅ Port 5432 is listening');
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.log('   ❌ Port 5432 is NOT listening');
      console.log('   Error:', err.message);
      resolve(false);
    });
    
    setTimeout(() => {
      socket.destroy();
      console.log('   ❌ Connection timeout');
      resolve(false);
    }, 3000);
  });
}

// Check 2: PostgreSQL service status
async function checkService() {
  console.log('\n2️⃣  Checking PostgreSQL service status...');
  
  try {
    const { stdout } = await execAsync('Get-Service postgresql-x64-15 | Select-Object Status -ExpandProperty Status', {
      shell: 'powershell.exe'
    });
    
    const status = stdout.trim();
    if (status === 'Running') {
      console.log('   ✅ PostgreSQL service is RUNNING');
      return true;
    } else {
      console.log(`   ❌ PostgreSQL service status: ${status}`);
      return false;
    }
  } catch (error) {
    console.log('   ⚠️  Could not check service status');
    console.log('   Make sure you run this as Administrator');
    return null;
  }
}

// Check 3: Database connection
async function checkDatabase() {
  console.log('\n3️⃣  Checking database connection...');
  
  try {
    const { stdout } = await execAsync(
      'psql -U postgres -d simuai_db -c "SELECT 1;" 2>&1',
      { shell: 'cmd.exe' }
    );
    
    if (stdout.includes('1')) {
      console.log('   ✅ Database connection successful');
      return true;
    } else {
      console.log('   ❌ Database connection failed');
      console.log('   Output:', stdout);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Database connection failed');
    console.log('   Error:', error.message);
    return false;
  }
}

// Check 4: Database exists
async function checkDatabaseExists() {
  console.log('\n4️⃣  Checking if simuai_db exists...');
  
  try {
    const { stdout } = await execAsync(
      'psql -U postgres -c "\\l" 2>&1',
      { shell: 'cmd.exe' }
    );
    
    if (stdout.includes('simuai_db')) {
      console.log('   ✅ Database simuai_db exists');
      return true;
    } else {
      console.log('   ❌ Database simuai_db does NOT exist');
      console.log('   Run: psql -U postgres -c "CREATE DATABASE simuai_db;"');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Could not check database');
    console.log('   Error:', error.message);
    return false;
  }
}

// Check 5: Environment variables
function checkEnv() {
  console.log('\n5️⃣  Checking environment variables...');
  
  try {
    require('dotenv').config({ path: '.env' });
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('   ❌ DATABASE_URL not set in .env');
      return false;
    }
    
    if (dbUrl.includes('git"postgresql')) {
      console.log('   ❌ DATABASE_URL has "git" prefix (corrupted)');
      console.log('   Current:', dbUrl.substring(0, 50) + '...');
      return false;
    }
    
    console.log('   ✅ DATABASE_URL is set correctly');
    console.log('   Host: localhost');
    console.log('   Port: 5432');
    console.log('   Database: simuai_db');
    return true;
  } catch (error) {
    console.log('   ❌ Error checking environment:', error.message);
    return false;
  }
}

// Main diagnostic
async function runDiagnostics() {
  const results = {
    port: await checkPort(),
    service: await checkService(),
    env: checkEnv(),
    dbExists: await checkDatabaseExists(),
    dbConnection: await checkDatabase()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Diagnostic Summary:\n');
  
  console.log(`Port 5432 listening:     ${results.port ? '✅' : '❌'}`);
  console.log(`PostgreSQL service:      ${results.service === null ? '⚠️ ' : (results.service ? '✅' : '❌')}`);
  console.log(`Environment variables:   ${results.env ? '✅' : '❌'}`);
  console.log(`Database exists:         ${results.dbExists ? '✅' : '❌'}`);
  console.log(`Database connection:     ${results.dbConnection ? '✅' : '❌'}`);
  
  console.log('\n' + '='.repeat(50));
  
  if (results.port && results.service && results.env && results.dbExists && results.dbConnection) {
    console.log('\n✅ All checks passed! Your database is ready.\n');
    console.log('Start your server with: npm run dev\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed. See above for details.\n');
    
    if (!results.service) {
      console.log('💡 To fix: Start PostgreSQL service');
      console.log('   Run: Start-Service -Name "postgresql-x64-15"\n');
    }
    
    if (!results.dbExists) {
      console.log('💡 To fix: Create the database');
      console.log('   Run: psql -U postgres -c "CREATE DATABASE simuai_db;"\n');
    }
    
    if (!results.env) {
      console.log('💡 To fix: Check your .env file');
      console.log('   See: START_POSTGRESQL.md\n');
    }
    
    process.exit(1);
  }
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('Diagnostic error:', error);
  process.exit(1);
});
