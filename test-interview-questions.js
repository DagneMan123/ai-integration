#!/usr/bin/env node

require('dotenv').config({ path: './server/.env' });

const enhancedAI = require('./server/services/enhancedAIService');

async function testQuestionGeneration() {
  console.log('\n========================================');
  console.log('Testing Interview Question Generation');
  console.log('========================================\n');

  const mockJob = {
    id: 1,
    title: 'Senior Software Engineer',
    description: 'We are looking for a senior software engineer with 5+ years of experience in full-stack development.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    experienceLevel: 'Senior',
    jobType: 'full-time'
  };

  try {
    console.log('📝 Generating interview questions...\n');
    const questions = await enhancedAI.generateInterviewQuestions(mockJob, 'moderate', 5);

    console.log(`✓ Generated ${questions.length} questions:\n`);
    
    questions.forEach((q, index) => {
      console.log(`${index + 1}. [${q.type}] ${q.question}`);
      console.log(`   Difficulty: ${q.difficulty}`);
      console.log(`   Keywords: ${q.expectedKeywords?.join(', ')}`);
      console.log();
    });

    console.log('\n========================================');
    console.log('Testing Answer Evaluation');
    console.log('========================================\n');

    if (questions.length > 0) {
      const testAnswer = 'I would use React for the frontend with Redux for state management, Node.js with Express for the backend, and PostgreSQL for the database. I would implement proper error handling, logging, and monitoring.';
      
      console.log(`Question: ${questions[0].question}\n`);
      console.log(`Answer: ${testAnswer}\n`);
      console.log('Evaluating answer...\n');

      const evaluation = await enhancedAI.evaluateAnswer(questions[0], testAnswer, mockJob, 'moderate');

      console.log('Evaluation Results:');
      console.log(`  Technical Score: ${evaluation.technicalScore}/100`);
      console.log(`  Completeness: ${evaluation.completeness}/100`);
      console.log(`  Clarity: ${evaluation.clarity}/100`);
      console.log(`  Relevance: ${evaluation.relevance}/100`);
      console.log(`  Overall Score: ${evaluation.overallScore}/100`);
      console.log(`\nFeedback: ${evaluation.feedback}`);
      console.log(`\nStrengths: ${evaluation.strengths?.join(', ')}`);
      console.log(`Improvements: ${evaluation.improvements?.join(', ')}`);
    }

    console.log('\n========================================');
    console.log('✓ Test Completed Successfully');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nNote: If you see "API key not found", make sure:');
    console.error('1. OPENAI_API_KEY is set in server/.env');
    console.error('2. The API key is valid');
    console.error('3. You have API credits available');
    console.error('\nFallback questions will be used if API is unavailable.');
    process.exit(1);
  }
}

testQuestionGeneration();
