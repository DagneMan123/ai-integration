const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'candidate@test.com',
  password: 'password123'
};

async function testInterviewWithJobData() {
  try {
    console.log('🔍 Testing Interview Data with Job Information...\n');

    // 1. Login
    console.log('1️⃣ Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
    const token = loginRes.data.data.token;
    const userId = loginRes.data.data.user.id;
    console.log(`✅ Logged in as: ${loginRes.data.data.user.email}`);
    console.log(`   User ID: ${userId}\n`);

    // 2. Fetch candidate interviews with job data
    console.log('2️⃣ Fetching candidate interviews with job data...');
    const interviewRes = await axios.get(`${API_URL}/interviews/candidate/my-interviews`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const interviews = interviewRes.data.data;
    console.log(`✅ Found ${interviews.length} interview(s)\n`);

    if (interviews.length > 0) {
      console.log('📋 Interview Details with Job Information:');
      interviews.forEach((interview, index) => {
        console.log(`\n   Interview ${index + 1}:`);
        console.log(`   ├─ ID: ${interview.id || interview._id}`);
        console.log(`   ├─ Status: ${interview.status}`);
        console.log(`   ├─ Mode: ${interview.interviewMode}`);
        console.log(`   ├─ Created: ${new Date(interview.createdAt).toLocaleDateString()}`);
        
        // Job Information
        if (interview.job) {
          console.log(`   ├─ Job Details:`);
          console.log(`   │  ├─ Title: ${interview.job.title}`);
          console.log(`   │  ├─ Description: ${interview.job.description?.substring(0, 50)}...`);
          console.log(`   │  ├─ Job Type: ${interview.job.jobType}`);
          console.log(`   │  ├─ Location: ${interview.job.location || 'N/A'}`);
          console.log(`   │  ├─ Experience Level: ${interview.job.experienceLevel || 'N/A'}`);
          console.log(`   │  ├─ Salary: ${interview.job.salaryMin || 'N/A'} - ${interview.job.salaryMax || 'N/A'}`);
          console.log(`   │  ├─ Required Skills: ${interview.job.requiredSkills?.join(', ') || 'N/A'}`);
          
          // Company Information
          if (interview.job.company) {
            console.log(`   │  └─ Company:`);
            console.log(`   │     ├─ Name: ${interview.job.company.name}`);
            console.log(`   │     ├─ Industry: ${interview.job.company.industry || 'N/A'}`);
            console.log(`   │     ├─ Website: ${interview.job.company.website || 'N/A'}`);
            console.log(`   │     └─ Verified: ${interview.job.company.isVerified ? '✅' : '❌'}`);
          } else {
            console.log(`   │  └─ Company: ⚠️ NOT LOADED`);
          }
        } else {
          console.log(`   ├─ Job: ⚠️ NOT LOADED`);
        }
        
        // AI Evaluation
        if (interview.aiEvaluation) {
          console.log(`   ├─ AI Evaluation:`);
          console.log(`   │  ├─ Overall Score: ${interview.aiEvaluation.overallScore}%`);
          console.log(`   │  └─ Hiring Decision: ${interview.aiEvaluation.hiringDecision || 'N/A'}`);
        }
      });
    } else {
      console.log('⚠️  No interviews found.');
      console.log('   To test, create an interview first by:');
      console.log('   1. Apply for a job');
      console.log('   2. Start an interview session');
    }

    console.log('\n✅ Interview with job data test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testInterviewWithJobData();
