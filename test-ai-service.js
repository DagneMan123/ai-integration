#!/usr/bin/env node

require('dotenv').config({ path: './server/.env' });

const aiService = require('./server/services/aiService');

async function testAI() {
  console.log('🤖 Testing AI Service...\n');

  try {
    // Test 1: Check availability
    console.log('1️⃣  Checking AI Service Availability...');
    const status = await aiService.checkAvailability();
    console.log('✅ Status:', status);
    console.log();

    if (!status.available) {
      console.log('❌ AI Service is not available:', status.reason);
      process.exit(1);
    }

    // Test 2: Generate interview questions
    console.log('2️⃣  Generating Interview Questions...');
    const jobDetails = {
      title: 'Senior Software Engineer',
      job_type: 'Full-time',
      experience_level: 'Senior',
      interview_type: 'Technical',
      required_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      description: 'We are looking for a Senior Software Engineer with 5+ years of experience in full-stack development.'
    };

    const questions = await aiService.generateInterviewQuestions(jobDetails, 5);
    console.log('✅ Generated Questions:');
    questions.forEach((q, i) => {
      console.log(`   Q${i + 1}: ${q.question}`);
      console.log(`       Type: ${q.type}, Difficulty: ${q.difficulty}`);
    });
    console.log();

    // Test 3: Evaluate responses
    console.log('3️⃣  Evaluating Interview Responses...');
    const responses = [
      { answer: 'I have 6 years of experience in full-stack development with React and Node.js' },
      { answer: 'I am proficient in JavaScript, React, Node.js, and PostgreSQL' },
      { answer: 'I have led multiple projects and mentored junior developers' },
      { answer: 'I handle deadlines by breaking tasks into smaller milestones' },
      { answer: 'I am motivated by solving complex problems and learning new technologies' }
    ];

    const evaluation = await aiService.evaluateResponses(questions, responses, jobDetails);
    console.log('✅ Evaluation Results:');
    console.log(`   Overall Score: ${evaluation.overall_score}/100`);
    console.log(`   Technical Score: ${evaluation.technical_score}/100`);
    console.log(`   Communication Score: ${evaluation.communication_score}/100`);
    console.log(`   Problem Solving Score: ${evaluation.problem_solving_score}/100`);
    console.log(`   Recommendation: ${evaluation.recommendation}`);
    console.log();

    // Test 4: Generate feedback
    console.log('4️⃣  Generating Personalized Feedback...');
    const candidateProfile = {
      experience_level: 'Senior',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS']
    };

    const feedback = await aiService.generateFeedback(evaluation, candidateProfile);
    console.log('✅ Feedback Generated:');
    console.log(feedback.feedback.substring(0, 300) + '...');
    console.log();

    console.log('✅ All AI tests passed successfully!');
    console.log('\n🎉 AI Service is working correctly!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull Error:', error);
    process.exit(1);
  }
}

testAI();
