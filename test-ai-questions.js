const enhancedAI = require('./server/services/enhancedAIService');

async function testQuestionGeneration() {
  console.log('Testing AI Question Generation...\n');

  const mockJob = {
    id: 1,
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced Full Stack Developer to join our growing team.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
    experienceLevel: 'Senior'
  };

  try {
    console.log('Generating interview questions...');
    const questions = await enhancedAI.generateInterviewQuestions(mockJob, 'moderate', 5);
    
    console.log('\n✅ Questions Generated Successfully!\n');
    console.log('Questions:');
    questions.forEach((q, idx) => {
      console.log(`\n${idx + 1}. ${q.question}`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Difficulty: ${q.difficulty}`);
      console.log(`   Keywords: ${q.expectedKeywords?.join(', ') || 'N/A'}`);
    });

    // Test answer evaluation
    console.log('\n\n--- Testing Answer Evaluation ---\n');
    const testAnswer = 'I have 5 years of experience with JavaScript and React. I have built several production applications using React and Node.js, managing state with Redux and handling APIs with Express.js.';
    
    console.log('Evaluating answer...');
    const evaluation = await enhancedAI.evaluateAnswer(questions[0], testAnswer, mockJob, 'moderate');
    
    console.log('\n✅ Answer Evaluated Successfully!\n');
    console.log('Evaluation Results:');
    console.log(`  Technical Score: ${evaluation.technicalScore}/100`);
    console.log(`  Completeness: ${evaluation.completeness}/100`);
    console.log(`  Clarity: ${evaluation.clarity}/100`);
    console.log(`  Relevance: ${evaluation.relevance}/100`);
    console.log(`  Overall Score: ${evaluation.overallScore}/100`);
    console.log(`  Feedback: ${evaluation.feedback}`);
    console.log(`  Strengths: ${evaluation.strengths?.join(', ') || 'N/A'}`);
    console.log(`  Improvements: ${evaluation.improvements?.join(', ') || 'N/A'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testQuestionGeneration();
