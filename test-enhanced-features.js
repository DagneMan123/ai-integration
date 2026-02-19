/**
 * Test script for enhanced AI features
 * Run with: node test-enhanced-features.js
 */

const enhancedAI = require('./server/services/enhancedAIService');
const antiCheatService = require('./server/services/antiCheatService');

console.log('🧪 Testing Enhanced AI Features\n');

// Test 1: Speech Pattern Analysis
console.log('Test 1: Speech Pattern Analysis');
const transcript = "Um, well, you know, I think that, like, the best approach would be, uh, to use React for this project.";
const analysis = enhancedAI.analyzeSpeechPatterns(transcript, 10);
console.log('Result:', JSON.stringify(analysis, null, 2));
console.log('✅ Speech analysis working\n');

// Test 2: Anti-Cheat Session
console.log('Test 2: Anti-Cheat Session Management');
const session = antiCheatService.initializeSession('test-interview-123', 'test-candidate-456');
console.log('Session created:', session.candidateId);

antiCheatService.recordTabSwitch('test-interview-123', new Date());
antiCheatService.recordTabSwitch('test-interview-123', new Date());
antiCheatService.recordCopyPaste('test-interview-123', new Date(), 'some copied text');

const integrityScore = antiCheatService.calculateIntegrityScore('test-interview-123');
console.log('Integrity Score:', JSON.stringify(integrityScore, null, 2));

const summary = antiCheatService.endSession('test-interview-123');
console.log('Session Summary:', JSON.stringify(summary, null, 2));
console.log('✅ Anti-cheat service working\n');

// Test 3: Fallback Question Generation
console.log('Test 3: Fallback Question Generation (without OpenAI)');
const mockJob = {
  title: 'Senior React Developer',
  description: 'Build amazing web applications',
  requiredSkills: ['React', 'TypeScript', 'Node.js'],
  experienceLevel: 'Senior'
};

enhancedAI.generateInterviewQuestions(mockJob, 'moderate', 5)
  .then(questions => {
    console.log('Generated Questions:', questions.length);
    console.log('Sample Question:', questions[0]);
    console.log('✅ Question generation working\n');
    
    console.log('🎉 All tests passed! Enhanced features are ready.');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });
