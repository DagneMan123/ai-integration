const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test user credentials (update with your test user)
const testUser = {
  email: 'candidate@test.com',
  password: 'password123'
};

async function testInterviewFetch() {
  try {
    console.log('🔍 Testing Interview Data Fetch...\n');

    // 1. Login
    console.log('1️⃣ Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
    const token = loginRes.data.data.token;
    const userId = loginRes.data.data.user.id;
    console.log(`✅ Logged in as: ${loginRes.data.data.user.email}`);
    console.log(`   User ID: ${userId}\n`);

    // 2. Fetch candidate interviews
    console.log('2️⃣ Fetching candidate interviews...');
    const interviewRes = await axios.get(`${API_URL}/interviews/candidate/my-interviews`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const interviews = interviewRes.data.data;
    console.log(`✅ Found ${interviews.length} interview(s)\n`);

    if (interviews.length > 0) {
      console.log('📋 Interview Details:');
      interviews.forEach((interview, index) => {
        console.log(`\n   Interview ${index + 1}:`);
        console.log(`   - ID: ${interview.id || interview._id}`);
        console.log(`   - Status: ${interview.status}`);
        console.log(`   - Mode: ${interview.interviewMode}`);
        console.log(`   - Job: ${interview.job?.title || 'N/A'}`);
        console.log(`   - Company: ${interview.job?.company?.name || 'N/A'}`);
        console.log(`   - Created: ${new Date(interview.createdAt).toLocaleDateString()}`);
        if (interview.aiEvaluation) {
          console.log(`   - Score: ${interview.aiEvaluation.overallScore}%`);
        }
      });
    } else {
      console.log('⚠️  No interviews found. This is normal if no interviews have been created yet.');
    }

    console.log('\n✅ Interview fetch test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

testInterviewFetch();
