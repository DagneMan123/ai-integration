/**
 * Frontend Communication Test
 * Tests frontend-to-backend communication
 */

import api from './api';

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

function log(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

async function testEndpoint(
  name: string,
  method: 'GET' | 'POST',
  endpoint: string,
  data?: any
): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    let response;
    if (method === 'GET') {
      response = await api.get(endpoint);
    } else {
      response = await api.post(endpoint, data || {});
    }
    
    const duration = performance.now() - startTime;
    const result: TestResult = {
      name,
      status: 'pass',
      message: `Status: ${response.status}`,
      duration: Math.round(duration)
    };
    
    results.push(result);
    log(`✅ ${name} (${Math.round(duration)}ms)`, 'success');
    return result;
  } catch (error: any) {
    const duration = performance.now() - startTime;
    const result: TestResult = {
      name,
      status: 'fail',
      message: error.message || 'Unknown error',
      duration: Math.round(duration)
    };
    
    results.push(result);
    log(`❌ ${name} - ${error.message}`, 'error');
    return result;
  }
}

export async function runCommunicationTests() {
  log('\n🚀 Frontend-Backend Communication Test\n', 'info');
  log('Testing API endpoints...\n', 'info');

  // Test 1: Dashboard Communication
  log('1️⃣  Dashboard Communication', 'info');
  await testEndpoint('Get messages', 'GET', '/dashboard-communication/messages/candidate');
  await testEndpoint('Get stats', 'GET', '/dashboard-communication/stats');
  await testEndpoint('Get notifications', 'GET', '/dashboard-communication/notifications/candidate');

  // Test 2: Dashboard Data
  log('\n2️⃣  Dashboard Data', 'info');
  await testEndpoint('Get candidate dashboard', 'GET', '/dashboard-data/candidate');
  await testEndpoint('Get employer dashboard', 'GET', '/dashboard-data/employer');
  await testEndpoint('Get admin dashboard', 'GET', '/dashboard-data/admin');

  // Test 3: Help Center
  log('\n3️⃣  Help Center', 'info');
  await testEndpoint('Get help articles', 'GET', '/help-center/articles');

  // Test 4: Users
  log('\n4️⃣  Users', 'info');
  await testEndpoint('Get current user', 'GET', '/users/me');

  // Summary
  log('\n' + '='.repeat(50), 'info');
  log('\n📊 Test Results:\n', 'info');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    log(`${icon} ${result.name}: ${result.message} (${result.duration}ms)`, 
      result.status === 'pass' ? 'success' : 'error');
  });

  log(`\n✅ Passed: ${passed}`, 'success');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'error' : 'success');
  log(`📈 Total: ${passed + failed}\n`, 'info');

  if (failed === 0) {
    log('🎉 All tests passed! Frontend-Backend communication is working!\n', 'success');
    return true;
  } else {
    log('⚠️  Some tests failed. Check browser console and backend logs.\n', 'error');
    return false;
  }
}

// Export for use in components
export { results };
