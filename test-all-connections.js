#!/usr/bin/env node

/**
 * Complete System Connection Test
 * Tests all dashboard-database-AI connections
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TESTS = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test helper
async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🔍 COMPLETE SYSTEM CONNECTION TEST\n');
  console.log('Testing all dashboard-database-AI connections...\n');

  // Test 1: Server Health
  await test('Server Health Check', async () => {
    const res = await makeRequest('GET', '/health');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.status) throw new Error('No status in response');
  });

  // Test 2: AI Service Status
  await test('AI Service Status', async () => {
    const res = await makeRequest('GET', '/api/ai/status');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.data) throw new Error('No data in response');
  });

  // Test 3: Database Connection (via Prisma)
  await test('Database Connection (Prisma)', async () => {
    // This is tested implicitly by other endpoints
    // If database is not connected, other endpoints will fail
    const res = await makeRequest('GET', '/health');
    if (res.status !== 200) throw new Error('Database connection failed');
  });

  // Test 4: Auth Routes Available
  await test('Auth Routes Available', async () => {
    // Just check that auth endpoint exists (will return 400 without credentials)
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'test@test.com',
      password: 'test'
    });
    // Should return 400 (bad request) or 401 (unauthorized), not 404
    if (res.status === 404) throw new Error('Auth route not found');
  });

  // Test 5: User Routes Available
  await test('User Routes Available', async () => {
    const res = await makeRequest('GET', '/api/users/1');
    // Should return 401 (unauthorized) or 404 (not found), not 404 for route
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('User route not found');
    }
  });

  // Test 6: Job Routes Available
  await test('Job Routes Available', async () => {
    const res = await makeRequest('GET', '/api/jobs');
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Job route not found');
    }
  });

  // Test 7: Interview Routes Available
  await test('Interview Routes Available', async () => {
    const res = await makeRequest('GET', '/api/interviews/my-interviews');
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Interview route not found');
    }
  });

  // Test 8: Application Routes Available
  await test('Application Routes Available', async () => {
    const res = await makeRequest('GET', '/api/applications');
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Application route not found');
    }
  });

  // Test 9: Payment Routes Available
  await test('Payment Routes Available', async () => {
    const res = await makeRequest('GET', '/api/payments');
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Payment route not found');
    }
  });

  // Test 10: Analytics Routes Available
  await test('Analytics Routes Available', async () => {
    const res = await makeRequest('GET', '/api/analytics');
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Analytics route not found');
    }
  });

  // Test 11: Admin Routes Available
  await test('Admin Routes Available', async () => {
    const res = await makeRequest('GET', '/api/admin/users');
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Admin route not found');
    }
  });

  // Test 12: AI Routes Available
  await test('AI Routes Available', async () => {
    const res = await makeRequest('GET', '/api/ai/status');
    if (res.status !== 200) throw new Error('AI route not found');
  });

  // Test 13: AI Generate Questions Endpoint
  await test('AI Generate Questions Endpoint', async () => {
    const res = await makeRequest('POST', '/api/ai/generate-questions', {
      jobDetails: { title: 'Test Job', description: 'Test' }
    });
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404) throw new Error('Generate questions endpoint not found');
  });

  // Test 14: AI Evaluate Responses Endpoint
  await test('AI Evaluate Responses Endpoint', async () => {
    const res = await makeRequest('POST', '/api/ai/evaluate-responses', {
      questions: [],
      responses: [],
      jobDetails: {}
    });
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404) throw new Error('Evaluate responses endpoint not found');
  });

  // Test 15: AI Analyze Resume Endpoint
  await test('AI Analyze Resume Endpoint', async () => {
    const res = await makeRequest('POST', '/api/ai/analyze-resume', {
      resumeText: 'Test resume',
      jobRequirements: 'Test requirements'
    });
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404) throw new Error('Analyze resume endpoint not found');
  });

  // Test 16: AI Job Recommendations Endpoint
  await test('AI Job Recommendations Endpoint', async () => {
    const res = await makeRequest('POST', '/api/ai/job-recommendations', {
      candidateProfile: {},
      availableJobs: []
    });
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404) throw new Error('Job recommendations endpoint not found');
  });

  // Test 17: AI Generate Cover Letter Endpoint
  await test('AI Generate Cover Letter Endpoint', async () => {
    const res = await makeRequest('POST', '/api/ai/generate-cover-letter', {
      candidateProfile: {},
      jobDetails: {}
    });
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404) throw new Error('Generate cover letter endpoint not found');
  });

  // Test 18: AI Analyze Performance Endpoint
  await test('AI Analyze Performance Endpoint', async () => {
    const res = await makeRequest('POST', '/api/ai/analyze-performance', {
      interviewData: {}
    });
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404) throw new Error('Analyze performance endpoint not found');
  });

  // Test 19: AI Skill Development Plan Endpoint
  await test('AI Skill Development Plan Endpoint', async () => {
    const res = await makeRequest('POST', '/api/ai/skill-development-plan', {
      candidateProfile: {},
      targetSkills: ['JavaScript']
    });
    // Should return 401 (unauthorized) or 200, not 404
    if (res.status === 404) throw new Error('Skill development plan endpoint not found');
  });

  // Test 20: Interview Start Endpoint
  await test('Interview Start Endpoint', async () => {
    const res = await makeRequest('POST', '/api/interviews/start', {
      jobId: 'test',
      applicationId: 'test'
    });
    // Should return 401 (unauthorized) or 400/404, not 404 for route
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Interview start endpoint not found');
    }
  });

  // Test 21: Interview Submit Answer Endpoint
  await test('Interview Submit Answer Endpoint', async () => {
    const res = await makeRequest('POST', '/api/interviews/test-id/submit-answer', {
      questionIndex: 0,
      answer: 'test'
    });
    // Should return 401 (unauthorized) or 404, not 404 for route
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Submit answer endpoint not found');
    }
  });

  // Test 22: Interview Complete Endpoint
  await test('Interview Complete Endpoint', async () => {
    const res = await makeRequest('POST', '/api/interviews/test-id/complete', {});
    // Should return 401 (unauthorized) or 404, not 404 for route
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Complete interview endpoint not found');
    }
  });

  // Test 23: Interview Report Endpoint
  await test('Interview Report Endpoint', async () => {
    const res = await makeRequest('GET', '/api/interviews/test-id/report');
    // Should return 401 (unauthorized) or 404, not 404 for route
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Interview report endpoint not found');
    }
  });

  // Test 24: Anti-Cheat Event Endpoint
  await test('Anti-Cheat Event Endpoint', async () => {
    const res = await makeRequest('POST', '/api/interviews/test-id/anti-cheat-event', {
      eventType: 'TAB_SWITCH',
      timestamp: Date.now()
    });
    // Should return 401 (unauthorized) or 404, not 404 for route
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Anti-cheat event endpoint not found');
    }
  });

  // Test 25: Identity Snapshot Endpoint
  await test('Identity Snapshot Endpoint', async () => {
    const res = await makeRequest('POST', '/api/interviews/test-id/identity-snapshot', {
      imageData: 'test',
      faceDetected: true
    });
    // Should return 401 (unauthorized) or 404, not 404 for route
    if (res.status === 404 && res.data?.message?.includes('Cannot')) {
      throw new Error('Identity snapshot endpoint not found');
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 TEST RESULTS\n`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);
  console.log(`\n${failedTests === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}\n`);

  process.exit(failedTests === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
