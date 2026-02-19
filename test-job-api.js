/**
 * Test script to verify job API endpoints work correctly
 * Run: node test-job-api.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const tests = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to add tests
function addTest(name, fn) {
  tests.push({ name, fn });
}

// Helper function to run tests
async function runTests() {
  console.log('\n🧪 Starting Job API Tests...\n');
  
  for (const test of tests) {
    try {
      await test.fn();
      console.log(`✅ ${test.name}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
      failedTests++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed\n`);
}

// Test 1: Get all jobs
addTest('GET /jobs - Should return all jobs', async () => {
  const response = await axios.get(`${API_URL}/jobs`);
  if (!response.data.success) throw new Error('Response not successful');
  if (!Array.isArray(response.data.data)) throw new Error('Data is not an array');
  console.log(`   Found ${response.data.data.length} jobs`);
});

// Test 2: Get single job with valid ID
addTest('GET /jobs/:id - Should return single job with valid ID', async () => {
  // First get all jobs
  const allJobsResponse = await axios.get(`${API_URL}/jobs`);
  const jobs = allJobsResponse.data.data;
  
  if (jobs.length === 0) throw new Error('No jobs available to test');
  
  const jobId = jobs[0].id;
  if (!jobId) throw new Error('Job ID is undefined');
  
  const response = await axios.get(`${API_URL}/jobs/${jobId}`);
  if (!response.data.success) throw new Error('Response not successful');
  if (!response.data.data) throw new Error('Job data is missing');
  if (response.data.data.id !== jobId) throw new Error('Job ID mismatch');
  console.log(`   Retrieved job: ${response.data.data.title}`);
});

// Test 3: Get single job with invalid ID (should fail gracefully)
addTest('GET /jobs/undefined - Should return 400 error', async () => {
  try {
    await axios.get(`${API_URL}/jobs/undefined`);
    throw new Error('Should have thrown an error');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`   Correctly rejected with status 400`);
    } else {
      throw new Error(`Expected 400, got ${error.response?.status}`);
    }
  }
});

// Test 4: Get single job with non-numeric ID (should fail gracefully)
addTest('GET /jobs/invalid-id - Should return 400 error', async () => {
  try {
    await axios.get(`${API_URL}/jobs/invalid-id`);
    throw new Error('Should have thrown an error');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`   Correctly rejected with status 400`);
    } else {
      throw new Error(`Expected 400, got ${error.response?.status}`);
    }
  }
});

// Test 5: Get single job with empty ID (should fail gracefully)
addTest('GET /jobs/ - Should return 404 or 400 error', async () => {
  try {
    await axios.get(`${API_URL}/jobs/`);
    throw new Error('Should have thrown an error');
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 400) {
      console.log(`   Correctly rejected with status ${error.response?.status}`);
    } else {
      throw new Error(`Expected 400 or 404, got ${error.response?.status}`);
    }
  }
});

// Test 6: Verify job data structure
addTest('Job data structure - Should have required fields', async () => {
  const response = await axios.get(`${API_URL}/jobs`);
  const jobs = response.data.data;
  
  if (jobs.length === 0) throw new Error('No jobs available to test');
  
  const job = jobs[0];
  const requiredFields = ['id', 'title', 'description'];
  
  for (const field of requiredFields) {
    if (!(field in job)) throw new Error(`Missing required field: ${field}`);
  }
  
  console.log(`   Job has all required fields: ${requiredFields.join(', ')}`);
});

// Test 7: Verify no undefined IDs in response
addTest('Job IDs - Should not contain undefined values', async () => {
  const response = await axios.get(`${API_URL}/jobs`);
  const jobs = response.data.data;
  
  for (const job of jobs) {
    if (!job.id) throw new Error(`Job has no ID: ${job.title}`);
    if (job.id === 'undefined') throw new Error(`Job has string "undefined" as ID`);
  }
  
  console.log(`   All ${jobs.length} jobs have valid IDs`);
});

// Run all tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
