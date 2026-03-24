#!/usr/bin/env node

/**
 * SimuAI System Diagnostic Tool
 * Checks all services and configurations
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
};

async function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      log.success(`${description}: ${filePath}`);
      return true;
    } else {
      log.error(`${description} NOT FOUND: ${filePath}`);
      return false;
    }
  } catch (error) {
    log.error(`Error checking ${description}: ${error.message}`);
    return false;
  }
}

async function checkEnvVariable(key, filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`^${key}=`, 'm');
    if (regex.test(content)) {
      const value = content.match(new RegExp(`^${key}=(.*)$`, 'm'))[1];
      log.success(`${key} is set: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
      return true;
    } else {
      log.warn(`${key} is NOT set in ${filePath}`);
      return false;
    }
  } catch (error) {
    log.error(`Error reading ${filePath}: ${error.message}`);
    return false;
  }
}

async function checkPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`, { shell: 'cmd.exe' });
    if (stdout) {
      log.success(`Port ${port} is in use`);
      return true;
    } else {
      log.warn(`Port ${port} is NOT in use`);
      return false;
    }
  } catch (error) {
    log.warn(`Port ${port} is NOT in use`);
    return false;
  }
}

async function checkPostgreSQL() {
  try {
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq postgres.exe"', { shell: 'cmd.exe' });
    if (stdout.includes('postgres.exe')) {
      log.success('PostgreSQL service is running');
      return true;
    } else {
      log.error('PostgreSQL service is NOT running');
      return false;
    }
  } catch (error) {
    log.error('PostgreSQL service is NOT running');
    return false;
  }
}

async function checkNodeModules(dir, description) {
  try {
    const nodeModulesPath = path.join(dir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const packageCount = fs.readdirSync(nodeModulesPath).length;
      log.success(`${description} node_modules: ${packageCount} packages installed`);
      return true;
    } else {
      log.warn(`${description} node_modules NOT found. Run: cd ${dir} && npm install`);
      return false;
    }
  } catch (error) {
    log.error(`Error checking ${description} node_modules: ${error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  console.clear();
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║         SimuAI System Diagnostic Tool                      ║
║         Checking all services and configurations           ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  let allGood = true;

  // Check critical files
  log.header('1. Critical Files');
  allGood &= await checkFile('server/.env', 'Server .env');
  allGood &= await checkFile('client/.env', 'Client .env');
  allGood &= await checkFile('server/config/database.js', 'Database config');
  allGood &= await checkFile('server/controllers/interviewController.js', 'Interview controller');
  allGood &= await checkFile('server/routes/interviews.js', 'Interview routes');

  // Check environment variables
  log.header('2. Environment Variables');
  allGood &= await checkEnvVariable('DATABASE_URL', 'server/.env');
  allGood &= await checkEnvVariable('USE_MOCK_AI', 'server/.env');
  allGood &= await checkEnvVariable('PORT', 'server/.env');

  // Check services
  log.header('3. Running Services');
  const postgresRunning = await checkPostgreSQL();
  const port5000 = await checkPort(5000);
  const port3000 = await checkPort(3000);

  if (!postgresRunning) {
    log.warn('PostgreSQL is not running. Start it before running the server.');
  }
  if (!port5000) {
    log.info('Backend server (port 5000) is not running. Start with: cd server && npm run dev');
  }
  if (!port3000) {
    log.info('Frontend client (port 3000) is not running. Start with: cd client && npm run dev');
  }

  // Check node_modules
  log.header('4. Dependencies');
  allGood &= await checkNodeModules('server', 'Server');
  allGood &= await checkNodeModules('client', 'Client');

  // Summary
  log.header('5. Summary');
  if (postgresRunning && port5000 && port3000) {
    log.success('All services are running!');
  } else {
    log.warn('Some services are not running. Follow the startup guide.');
  }

  console.log(`\n${colors.cyan}Diagnostic complete.${colors.reset}\n`);
}

runDiagnostics().catch(error => {
  log.error(`Diagnostic failed: ${error.message}`);
  process.exit(1);
});
