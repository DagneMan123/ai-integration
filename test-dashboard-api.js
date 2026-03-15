const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test token (you'll need to replace this with a real token from login)
const testToken = process.env.TEST_TOKEN || '';

async function testDashboardEndpoints() {
  console.log('Testing Dashboard API Endpoints...\n');

  const headers = testToken ? { Authorization: `Bearer ${testToken}` } : {};

  try {
    console.log('1. Testing Candidate Dashboard...');
    const candidateRes = await axios.get(`${API_URL}/analytics/candidate/dashboard`, { headers });
    console.log('✓ Candidate Dashboard:', candidateRes.data);
  } catch (error) {
    console.log('✗ Candidate Dashboard Error:', error.response?.data || error.message);
  }

  try {
    console.log('\n2. Testing Employer Dashboard...');
    const employerRes = await axios.get(`${API_URL}/analytics/employer/dashboard`, { headers });
    console.log('✓ Employer Dashboard:', employerRes.data);
  } catch (error) {
    console.log('✗ Employer Dashboard Error:', error.response?.data || error.message);
  }

  try {
    console.log('\n3. Testing Admin Dashboard...');
    const adminRes = await axios.get(`${API_URL}/analytics/admin/dashboard`, { headers });
    console.log('✓ Admin Dashboard:', adminRes.data);
  } catch (error) {
    console.log('✗ Admin Dashboard Error:', error.response?.data || error.message);
  }
}

testDashboardEndpoints();
