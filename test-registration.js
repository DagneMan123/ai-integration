const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing registration endpoint...\n');

    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'Test@123',
      firstName: 'Test',
      lastName: 'User',
      role: 'candidate'
    };

    console.log('Sending registration request with:');
    console.log(JSON.stringify(testUser, null, 2));
    console.log('');

    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);

    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Registration failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data.errors) {
        console.log('\nValidation Errors:');
        error.response.data.errors.forEach(err => {
          console.log(`  - ${err.msg} (${err.param})`);
        });
      }
    } else if (error.request) {
      console.error('No response from server. Is the server running?');
      console.error('Make sure to run: cd server && npm run dev');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
