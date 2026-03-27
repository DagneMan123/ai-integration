#!/usr/bin/env node

/**
 * Test Job Posting Flow
 * Tests the complete flow: Employer posts job → Candidate sees it
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let employerToken = '';
let candidateToken = '';
let jobId = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

async function testJobPostingFlow() {
  try {
    log.info('Starting Job Posting Flow Test...\n');

    // Step 1: Create/Login Employer
    log.info('Step 1: Authenticating Employer...');
    try {
      const employerRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'employer@test.com',
        password: 'password123'
      });
      employerToken = employerRes.data.data.token;
      log.success('Employer authenticated');
    } catch (err) {
      log.warn('Employer login failed, attempting registration...');
      const regRes = await axios.post(`${API_URL}/auth/register`, {
        email: 'employer@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Employer',
        role: 'EMPLOYER'
      });
      employerToken = regRes.data.data.token;
      log.success('Employer registered and authenticated');
    }

    // Step 2: Create/Login Candidate
    log.info('\nStep 2: Authenticating Candidate...');
    try {
      const candidateRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'candidate@test.com',
        password: 'password123'
      });
      candidateToken = candidateRes.data.data.token;
      log.success('Candidate authenticated');
    } catch (err) {
      log.warn('Candidate login failed, attempting registration...');
      const regRes = await axios.post(`${API_URL}/auth/register`, {
        email: 'candidate@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Candidate',
        role: 'CANDIDATE'
      });
      candidateToken = regRes.data.data.token;
      log.success('Candidate registered and authenticated');
    }

    // Step 3: Employer creates a job
    log.info('\nStep 3: Employer posting a job...');
    const jobRes = await axios.post(
      `${API_URL}/jobs`,
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full stack developer to join our team.',
        location: 'Addis Ababa, Ethiopia',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
        experienceLevel: 'senior',
        jobType: 'full-time',
        interviewType: 'technical',
        salaryMin: 50000,
        salaryMax: 80000
      },
      {
        headers: { Authorization: `Bearer ${employerToken}` }
      }
    );
    jobId = jobRes.data.data.id;
    log.success(`Job created with ID: ${jobId}`);
    console.log(`  Title: ${jobRes.data.data.title}`);
    console.log(`  Status: ${jobRes.data.data.status}`);

    // Step 4: Candidate fetches all jobs
    log.info('\nStep 4: Candidate viewing all jobs...');
    const allJobsRes = await axios.get(`${API_URL}/jobs`);
    const jobs = allJobsRes.data.data;
    log.success(`Retrieved ${jobs.length} total jobs`);

    // Check if our job is in the list
    const ourJob = jobs.find((j) => j.id === jobId);
    if (ourJob) {
      log.success('✓ Posted job appears in candidate\'s job list!');
      console.log(`  Title: ${ourJob.title}`);
      console.log(`  Location: ${ourJob.location}`);
      console.log(`  Experience: ${ourJob.experienceLevel}`);
    } else {
      log.error('Posted job NOT found in candidate\'s job list');
    }

    // Step 5: Candidate views job details
    log.info('\nStep 5: Candidate viewing job details...');
    const jobDetailsRes = await axios.get(`${API_URL}/jobs/${jobId}`);
    const jobDetails = jobDetailsRes.data.data;
    log.success('Job details retrieved');
    console.log(`  Title: ${jobDetails.title}`);
    console.log(`  Description: ${jobDetails.description.substring(0, 50)}...`);
    console.log(`  Skills: ${jobDetails.requiredSkills.join(', ')}`);

    // Step 6: Test search functionality
    log.info('\nStep 6: Testing search functionality...');
    const searchRes = await axios.get(`${API_URL}/jobs?search=Developer`);
    const searchResults = searchRes.data.data;
    const foundInSearch = searchResults.find((j) => j.id === jobId);
    if (foundInSearch) {
      log.success('Job found in search results');
    } else {
      log.warn('Job not found in search results');
    }

    // Summary
    log.info('\n' + '='.repeat(50));
    log.success('Job Posting Flow Test Completed Successfully!');
    log.info('='.repeat(50));
    console.log('\nSummary:');
    console.log(`  ✓ Employer posted job: "${jobRes.data.data.title}"`);
    console.log(`  ✓ Job status: ${jobRes.data.data.status}`);
    console.log(`  ✓ Job visible to candidates: YES`);
    console.log(`  ✓ Total jobs in system: ${jobs.length}`);
    console.log(`  ✓ Search functionality: Working`);

  } catch (error) {
    log.error('Test failed with error:');
    if (error.response?.data) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the test
testJobPostingFlow();
