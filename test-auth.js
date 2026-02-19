const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User',
  role: 'candidate'
};

async function testRegistration() {
  console.log('\n=== Testing Registration ===');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message === 'Email already registered') {
      console.log('⚠️  User already exists, skipping registration');
      return null;
    }
    console.error('❌ Registration failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testLogin() {
  console.log('\n=== Testing Login ===');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testRefreshToken(refreshToken) {
  console.log('\n=== Testing Refresh Token ===');
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
      refreshToken
    });
    console.log('✅ Token refresh successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Token refresh failed:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  console.log('API URL:', API_URL);
  console.log('Test User:', testUser.email);

  try {
    // Test 1: Registration
    const regData = await testRegistration();
    
    // Test 2: Login
    const loginData = await testLogin();
    
    // Test 3: Refresh Token
    if (loginData && loginData.refreshToken) {
      await testRefreshToken(loginData.refreshToken);
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.log('\n❌ Tests failed!');
    process.exit(1);
  }
}

// Run tests
runTests();
