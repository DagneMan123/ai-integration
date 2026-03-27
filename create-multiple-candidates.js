#!/usr/bin/env node

/**
 * Create Multiple Test Candidate Accounts
 * This script creates different candidate accounts for testing
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const candidates = [
  {
    email: 'candidate1@test.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'CANDIDATE'
  },
  {
    email: 'candidate2@test.com',
    password: 'password123',
    firstName: 'Bob',
    lastName: 'Smith',
    role: 'CANDIDATE'
  },
  {
    email: 'candidate3@test.com',
    password: 'password123',
    firstName: 'Carol',
    lastName: 'Williams',
    role: 'CANDIDATE'
  },
  {
    email: 'candidate4@test.com',
    password: 'password123',
    firstName: 'David',
    lastName: 'Brown',
    role: 'CANDIDATE'
  },
  {
    email: 'candidate5@test.com',
    password: 'password123',
    firstName: 'Emma',
    lastName: 'Davis',
    role: 'CANDIDATE'
  }
];

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

async function createCandidates() {
  log.info('Creating multiple test candidate accounts...\n');

  for (const candidate of candidates) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, candidate);
      
      if (response.data?.success) {
        log.success(`Created: ${candidate.firstName} ${candidate.lastName}`);
        console.log(`  Email: ${candidate.email}`);
        console.log(`  ID: ${response.data.data?.user?.id}`);
        console.log(`  Token: ${response.data.data?.token?.substring(0, 20)}...`);
      }
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        log.warn(`Already exists: ${candidate.email}`);
      } else {
        log.error(`Failed to create ${candidate.email}`);
        console.error(`  Error: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  log.info('\n' + '='.repeat(50));
  log.success('Candidate creation complete!');
  log.info('='.repeat(50));
  
  console.log('\nTest Candidates Created:');
  candidates.forEach((c, i) => {
    console.log(`${i + 1}. ${c.firstName} ${c.lastName} (${c.email})`);
  });
  
  console.log('\nNow you can:');
  console.log('1. Login as each candidate');
  console.log('2. Apply for different jobs');
  console.log('3. Each application will have a different candidateId');
  console.log('4. Each candidate will have their own interviews');
}

createCandidates();
