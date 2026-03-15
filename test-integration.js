const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testIntegration() {
  console.log('\n🧪 Testing Frontend-Backend Integration\n');
  console.log('═'.repeat(50));

  const tests = [
    { name: 'Health Check', method: 'GET', url: '/health' },
    { name: 'Auth Register', method: 'POST', url: '/auth/register', data: { email: 'test@test.com', password: 'Test@123', firstName: 'Test', lastName: 'User', role: 'candidate' } },
    { name: 'Jobs List', method: 'GET', url: '/jobs' },
    { name: 'Companies List', method: 'GET', url: '/companies' },
  ];

  for (const test of tests) {
    try {
      let response;
      if (test.method === 'GET') {
        response = await axios.get(`${API_URL}${test.url}`);
      } else {
        response = await axios.post(`${API_URL}${test.url}`, test.data);
      }
      console.log(`✅ ${test.name}: ${response.status}`);
    } catch (error) {
      const status = error.response?.status || 'No response';
      console.log(`⚠️  ${test.name}: ${status}`);
    }
  }

  console.log('═'.repeat(50));
  console.log('\n✅ Integration test complete!\n');
}

testIntegration();
