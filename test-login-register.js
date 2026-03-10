const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuthFlow() {
  try {
    console.log('🧪 Testing Authentication Flow\n');

    // Test credentials
    const testUser = {
      email: 'test@simuai.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'candidate'
    };

    // 1. Register
    console.log('1️⃣  Registering user...');
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('✅ Registration successful');
      console.log('   Token:', registerRes.data.token.substring(0, 20) + '...');
      console.log('   User:', registerRes.data.user.email);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already registered')) {
        console.log('⚠️  User already exists, skipping registration');
      } else {
        console.error('❌ Registration failed:', err.response?.data?.message || err.message);
        return;
      }
    }

    // 2. Login
    console.log('\n2️⃣  Logging in...');
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful');
      console.log('   Token:', loginRes.data.token.substring(0, 20) + '...');
      console.log('   User:', loginRes.data.user.email);
      console.log('   Role:', loginRes.data.user.role);
    } catch (err) {
      console.error('❌ Login failed:', err.response?.data?.message || err.message);
      console.log('\n💡 Troubleshooting:');
      console.log('   - Make sure the user was registered first');
      console.log('   - Check that email and password are correct');
      console.log('   - Verify database is running');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuthFlow();
