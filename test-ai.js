const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testToken = 'your-jwt-token-here'; // You'll need a valid token

async function testAI() {
  try {
    console.log('🧪 Testing AI Service...\n');

    // 1. Check AI Status
    console.log('1️⃣  Checking AI Service Status...');
    const statusRes = await axios.get(`${API_URL}/ai/status`);
    console.log('✅ AI Status:', statusRes.data);
    console.log();

    // 2. Generate Interview Questions (requires auth)
    console.log('2️⃣  Testing Generate Interview Questions...');
    const jobDetails = {
      title: 'Senior React Developer',
      job_type: 'Full-time',
      experience_level: 'Senior',
      interview_type: 'Technical',
      required_skills: ['React', 'TypeScript', 'Node.js'],
      description: 'We are looking for a Senior React Developer with 5+ years of experience.'
    };

    try {
      const questionsRes = await axios.post(
        `${API_URL}/ai/generate-questions`,
        { jobDetails, questionCount: 5 },
        { headers: { Authorization: `Bearer ${testToken}` } }
      );
      console.log('✅ Generated Questions:', questionsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('⚠️  Authentication required. Skipping authenticated endpoints.');
        console.log('   To test authenticated endpoints, provide a valid JWT token.');
      } else {
        throw err;
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

testAI();
