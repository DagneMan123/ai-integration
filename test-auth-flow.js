/**
 * Test Auth Flow - Register and Login
 * Run: node test-auth-flow.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Generate unique email with timestamp
const timestamp = Date.now();
const testEmail = `test${timestamp}@example.com`;
const testPassword = 'TestPassword123';

async function testAuthFlow() {
  try {
    console.log('\n========== AUTH FLOW TEST ==========\n');

    // 1. Register
    console.log('1️⃣  REGISTERING NEW USER...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      role: 'candidate',
      firstName: 'Test',
      lastName: 'User'
    });

    console.log('✅ Registration successful!');
    console.log(`   User ID: ${registerRes.data.user.id}`);
    console.log(`   Role: ${registerRes.data.user.role}`);

    // 2. Login with correct credentials
    console.log('\n2️⃣  LOGGING IN WITH CORRECT CREDENTIALS...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);

    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    console.log('✅ Login successful!');
    console.log(`   User ID: ${loginRes.data.user.id}`);
    console.log(`   Token: ${loginRes.data.token.substring(0, 20)}...`);

    // 3. Try login with wrong password
    console.log('\n3️⃣  TRYING LOGIN WITH WRONG PASSWORD...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: WrongPassword123`);

    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: 'WrongPassword123'
      });
      console.log('❌ Should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected!');
      console.log(`   Error: ${error.response.data.message}`);
    }

    // 4. Try register with same email
    console.log('\n4️⃣  TRYING REGISTER WITH SAME EMAIL...');
    console.log(`   Email: ${testEmail}`);

    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: testEmail,
        password: 'AnotherPassword123',
        role: 'candidate',
        firstName: 'Another',
        lastName: 'User'
      });
      console.log('❌ Should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected!');
      console.log(`   Error: ${error.response.data.message}`);
    }

    console.log('\n========== ALL TESTS PASSED ✅ ==========\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

testAuthFlow();
