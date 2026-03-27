const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let employerId = '';
let candidateId = '';
let jobId = '';
let applicationId = '';
let interviewId = '';

const log = (title, data) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ ${title}`);
  console.log(`${'='.repeat(60)}`);
  console.log(JSON.stringify(data, null, 2));
};

const logError = (title, error) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✗ ${title}`);
  console.log(`${'='.repeat(60)}`);
  console.log(error.response?.data || error.message);
};

const api = axios.create({
  baseURL: API_URL,
  validateStatus: () => true
});

async function runTests() {
  try {
    // 1. Register Employer
    console.log('\n📝 STEP 1: Register Employer');
    let res = await api.post('/auth/register', {
      email: `employer-${Date.now()}@test.com`,
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'Employer',
      role: 'EMPLOYER'
    });
    if (res.status !== 201) {
      logError('Employer Registration', res.data);
      return;
    }
    employerId = res.data.data.id;
    authToken = res.data.data.token;
    log('Employer Registered', { employerId, email: res.data.data.email });

    // 2. Create Company
    console.log('\n🏢 STEP 2: Create Company');
    res = await api.post('/companies', {
      name: `Test Company ${Date.now()}`,
      description: 'Test company for job posting',
      industry: 'Technology',
      website: 'https://test.com'
    }, { headers: { Authorization: `Bearer ${authToken}` } });
    if (res.status !== 201) {
      logError('Company Creation', res.data);
      return;
    }
    const companyId = res.data.data.id;
    log('Company Created', { companyId, name: res.data.data.name });

    // 3. Create Job
    console.log('\n💼 STEP 3: Create Job');
    res = await api.post('/jobs', {
      title: 'Senior Developer',
      description: 'Looking for experienced developer',
      location: 'Remote',
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'senior',
      jobType: 'full-time',
      interviewType: 'technical'
    }, { headers: { Authorization: `Bearer ${authToken}` } });
    if (res.status !== 201) {
      logError('Job Creation', res.data);
      return;
    }
    jobId = res.data.data.id;
    log('Job Created', { jobId, title: res.data.data.title, status: res.data.data.status });

    // 4. Register Candidate
    console.log('\n👤 STEP 4: Register Candidate');
    res = await api.post('/auth/register', {
      email: `candidate-${Date.now()}@test.com`,
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'Candidate',
      role: 'CANDIDATE'
    });
    if (res.status !== 201) {
      logError('Candidate Registration', res.data);
      return;
    }
    candidateId = res.data.data.id;
    const candidateToken = res.data.data.token;
    log('Candidate Registered', { candidateId, email: res.data.data.email });

    // 5. Verify Job Appears in Explore Opportunities
    console.log('\n🔍 STEP 5: Verify Job in Explore Opportunities');
    res = await api.get('/jobs', { headers: { Authorization: `Bearer ${candidateToken}` } });
    if (res.status !== 200) {
      logError('Fetch Jobs', res.data);
      return;
    }
    const jobFound = res.data.data.find(j => j.id === jobId);
    if (!jobFound) {
      logError('Job Not Found in Explore', { jobId, totalJobs: res.data.data.length });
      return;
    }
    log('Job Found in Explore Opportunities', { jobId, title: jobFound.title, status: jobFound.status });

    // 6. Apply for Job
    console.log('\n📤 STEP 6: Apply for Job');
    res = await api.post('/applications', {
      jobId: jobId
    }, { headers: { Authorization: `Bearer ${candidateToken}` } });
    if (res.status !== 201) {
      logError('Job Application', res.data);
      return;
    }
    applicationId = res.data.data.id;
    interviewId = res.data.data.interviewId;
    log('Application Created & Interview Auto-Started', { 
      applicationId, 
      interviewId, 
      status: res.data.data.status 
    });

    // 7. Verify Interview Status
    console.log('\n🎤 STEP 7: Verify Interview Status');
    res = await api.get(`/interviews/${interviewId}/report`, { 
      headers: { Authorization: `Bearer ${candidateToken}` } 
    });
    if (res.status !== 200) {
      logError('Fetch Interview', res.data);
      return;
    }
    log('Interview Retrieved', { 
      interviewId, 
      status: res.data.data.status,
      jobTitle: res.data.data.job?.title 
    });

    // 8. Submit Answer
    console.log('\n✍️ STEP 8: Submit Interview Answer');
    res = await api.post(`/interviews/${interviewId}/submit-answer`, {
      questionIndex: 0,
      answer: 'This is my answer to the first question'
    }, { headers: { Authorization: `Bearer ${candidateToken}` } });
    if (res.status !== 200) {
      logError('Submit Answer', res.data);
      return;
    }
    log('Answer Submitted Successfully', { 
      interviewId,
      hasNextQuestion: !!res.data.data.nextQuestion,
      isLastQuestion: res.data.data.isLastQuestion
    });

    // 9. Complete Interview
    console.log('\n🏁 STEP 9: Complete Interview');
    res = await api.post(`/interviews/${interviewId}/complete`, {}, { 
      headers: { Authorization: `Bearer ${candidateToken}` } 
    });
    if (res.status !== 200) {
      logError('Complete Interview', res.data);
      return;
    }
    log('Interview Completed', { 
      interviewId,
      overallScore: res.data.data.overallScore
    });

    console.log('\n\n✅ ALL TESTS PASSED!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    process.exit(1);
  }
}

runTests();
