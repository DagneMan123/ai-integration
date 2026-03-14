#!/usr/bin/env node

/**
 * Test Dashboard Database Connection
 * Verifies that dashboards can fetch data from the database
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials
const testUser = {
  email: 'candidate@test.com',
  password: 'Test@123'
};

async function test() {
  try {
    console.log('🔍 Testing Dashboard Database Connection\n');

    // Step 1: Login
    console.log('1️⃣  Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
    const token = loginRes.data.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Test Candidate Dashboard
    console.log('2️⃣  Testing Candidate Dashboard...');
    const dashboardRes = await axios.get(`${API_URL}/analytics/candidate/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = dashboardRes.data.data;
    console.log('✅ Dashboard data fetched:');
    console.log(`   Applications: ${data.applications}`);
    console.log(`   Interviews: ${data.interviews}`);
    console.log(`   Average Score: ${data.averageScore}\n`);

    // Step 3: Check if data is empty
    if (data.applications === 0 && data.interviews === 0) {
      console.log('⚠️  Dashboard is showing 0 because:');
      console.log('   • No applications created yet');
      console.log('   • No interviews scheduled yet');
      console.log('\n📝 To populate dashboard:');
      console.log('   1. Create a job as employer');
      console.log('   2. Apply for job as candidate');
      console.log('   3. Start interview (AI generates questions)');
      console.log('   4. Complete interview');
      console.log('   5. Dashboard will show data\n');
    } else {
      console.log('✅ Dashboard has data!\n');
    }

    console.log('✅ Connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

test();
