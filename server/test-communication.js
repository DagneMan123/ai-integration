#!/usr/bin/env node

/**
 * Backend & Frontend Communication Test
 * Tests all API endpoints to ensure backend is working correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Color codes for console output
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

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoint(name, method, path, data = null, expectedStatus = 200) {
  try {
    const result = await makeRequest(method, path, data);
    const success = result.status === expectedStatus || result.status < 400;
    
    if (success) {
      log(`✅ ${name}`, 'green');
      log(`   Status: ${result.status}`, 'cyan');
      return true;
    } else {
      log(`❌ ${name}`, 'red');
      log(`   Status: ${result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${name} - ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🚀 Backend & Frontend Communication Test\n', 'blue');
  log('Testing API endpoints...\n', 'cyan');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  log('1️⃣  Health Check', 'yellow');
  if (await testEndpoint('Health endpoint', 'GET', '/health')) {
    passed++;
  } else {
    failed++;
  }

  // Test 2: Dashboard Communication Routes
  log('\n2️⃣  Dashboard Communication', 'yellow');
  
  if (await testEndpoint('Get messages', 'GET', '/api/dashboard-communication/messages/candidate', null, 200)) {
    passed++;
  } else {
    failed++;
  }

  if (await testEndpoint('Get stats', 'GET', '/api/dashboard-communication/stats', null, 200)) {
    passed++;
  } else {
    failed++;
  }

  if (await testEndpoint('Get notifications', 'GET', '/api/dashboard-communication/notifications/candidate', null, 200)) {
    passed++;
  } else {
    failed++;
  }

  // Test 3: Dashboard Data Routes
  log('\n3️⃣  Dashboard Data', 'yellow');
  
  if (await testEndpoint('Get candidate dashboard', 'GET', '/api/dashboard-data/candidate', null, 200)) {
    passed++;
  } else {
    failed++;
  }

  if (await testEndpoint('Get employer dashboard', 'GET', '/api/dashboard-data/employer', null, 200)) {
    passed++;
  } else {
    failed++;
  }

  if (await testEndpoint('Get admin dashboard', 'GET', '/api/dashboard-data/admin', null, 200)) {
    passed++;
  } else {
    failed++;
  }

  // Test 4: Help Center Routes
  log('\n4️⃣  Help Center', 'yellow');
  
  if (await testEndpoint('Get help articles', 'GET', '/api/help-center/articles', null, 200)) {
    passed++;
  } else {
    failed++;
  }

  // Test 5: Auth Routes
  log('\n5️⃣  Authentication', 'yellow');
  
  if (await testEndpoint('Login endpoint exists', 'POST', '/api/auth/login', 
    { email: 'test@test.com', password: 'test' }, 400)) {
    passed++;
  } else {
    failed++;
  }

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log(`\n📊 Test Results:`, 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📈 Total: ${passed + failed}\n`, 'cyan');

  if (failed === 0) {
    log('🎉 All tests passed! Backend is working correctly.\n', 'green');
    log('Frontend can now communicate with backend.\n', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed. Check backend logs.\n', 'red');
    process.exit(1);
  }
}

// Run tests
log('\n⏳ Connecting to backend at ' + BASE_URL + '...\n', 'cyan');
setTimeout(() => {
  runTests().catch(error => {
    log(`\n❌ Test suite failed: ${error.message}\n`, 'red');
    process.exit(1);
  });
}, 1000);
