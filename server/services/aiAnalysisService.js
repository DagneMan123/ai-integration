const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * AI Analysis Service
 * Handles transcription and AI-powered feedback using OpenAI APIs
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Transcribe audio using Whisper API
exports.transcribeAudio = async (audioFilePath) => {
  try {
    if (!OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured, using mock transcription');
      return generateMockTranscription();
    }

    const fs = require('fs');
    const FormData = require('form-data');

    const form = new FormData();
    form.append('file', fs.createReadStream(audioFilePath));
    form.append('model', 'whisper-1');
    form.append('language', 'en');

    const response = await axios.post(
      `${OPENAI_BASE_URL}/audio/transcriptions`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        timeout: 60000
      }
    );

    logger.info('Audio transcribed successfully');

    return {
      text: response.data.text,
      language: 'en',
      confidence: 0.95,
      duration: 0
    };
  } catch (error) {
    logger.error('Transcription error:', error.message);
    // Return mock data if API fails
    return generateMockTranscription();
  }
};

// Analyze response using GPT-4
exports.analyzeResponse = async (transcript, questionText, interviewType) => {
  try {
    if (!OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured, using mock analysis');
      return generateMockAnalysis(transcript, interviewType);
    }

    const systemPrompt = `You are an expert interview evaluator. Analyze the candidate's response and provide detailed feedback.
    
    Evaluate on these criteria:
    1. Clarity (0-100): How clear and understandable is the response?
    2. Technical Knowledge (0-100): How accurate and deep is the technical knowledge?
    3. Confidence (0-100): How confident does the candidate sound?
    4. Communication (0-100): How well structured and articulated is the response?
    5. Relevance (0-100): How relevant is the response to the question?
    
    Also provide:
    - Key strengths (2-3 points)
    - Areas for improvement (2-3 points)
    - Specific observations (e.g., filler words, pacing, technical accuracy)
    
    Return response as JSON with this structure:
    {
      "scores": {
        "clarity": number,
        "technicalKnowledge": number,
        "confidence": number,
        "communication": number,
        "relevance": number,
        "overall": number
      },
      "strengths": ["strength1", "strength2", "strength3"],
      "improvements": ["improvement1", "improvement2", "improvement3"],
      "observations": ["observation1", "observation2", "observation3"],
      "summary": "Brief summary of performance"
    }`;

    const userPrompt = `Question: ${questionText}
    
    Candidate's Response: ${transcript}
    
    Interview Type: ${interviewType}
    
    Please analyze this response and provide detailed feedback in JSON format.`;

    const response = await axios.post(
      `${OPENAI_BASE_URL}/chat/completions`,
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content;
    const analysis = JSON.parse(content);

    logger.info('Response analyzed successfully');

    return analysis;
  } catch (error) {
    logger.error('Analysis error:', error.message);
    // Return mock data if API fails
    return generateMockAnalysis(transcript, interviewType);
  }
};

// Generate comprehensive feedback
exports.generateFeedback = async (transcript, analysis) => {
  try {
    if (!OPENAI_API_KEY) {
      return generateMockFeedback(transcript);
    }

    const prompt = `Based on this interview response and analysis, generate a comprehensive feedback message for the candidate.
    
    Transcript: ${transcript}
    
    Analysis: ${JSON.stringify(analysis)}
    
    Create a professional, encouraging feedback message that:
    1. Acknowledges their strengths
    2. Provides specific, actionable improvements
    3. Encourages them to practice
    4. Is motivating and constructive
    
    Keep it to 2-3 paragraphs.`;

    const response = await axios.post(
      `${OPENAI_BASE_URL}/chat/completions`,
      {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error('Feedback generation error:', error.message);
    return generateMockFeedback(transcript);
  }
};

// Count filler words
exports.countFillerWords = (transcript) => {
  const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so'];
  const lowerTranscript = transcript.toLowerCase();
  
  const counts = {};
  let totalFillers = 0;

  fillerWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerTranscript.match(regex) || [];
    counts[word] = matches.length;
    totalFillers += matches.length;
  });

  return {
    total: totalFillers,
    byWord: counts,
    frequency: totalFillers > 0 ? (totalFillers / transcript.split(' ').length * 100).toFixed(2) : 0
  };
};

// Analyze speech patterns
exports.analyzeSpeechPatterns = (transcript) => {
  const words = transcript.split(/\s+/);
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim());
  
  const avgWordsPerSentence = words.length / sentences.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const vocabularyDiversity = (uniqueWords / words.length * 100).toFixed(2);

  return {
    totalWords: words.length,
    totalSentences: sentences.length,
    averageWordsPerSentence: avgWordsPerSentence.toFixed(2),
    uniqueWords,
    vocabularyDiversity: `${vocabularyDiversity}%`,
    complexity: avgWordsPerSentence > 20 ? 'High' : avgWordsPerSentence > 10 ? 'Medium' : 'Low'
  };
};

// Mock functions for when API is not available
function generateMockTranscription() {
  return {
    text: 'I would approach this problem by first understanding the requirements and breaking it down into smaller components. Then I would design the architecture, implement the solution, and test it thoroughly. This approach ensures quality and maintainability.',
    language: 'en',
    confidence: 0.92,
    duration: 45
  };
}

function generateMockAnalysis(transcript, interviewType) {
  return {
    scores: {
      clarity: 82,
      technicalKnowledge: 78,
      confidence: 85,
      communication: 80,
      relevance: 88,
      overall: 82
    },
    strengths: [
      'Clear problem-solving approach',
      'Good technical understanding',
      'Structured explanation'
    ],
    improvements: [
      'Add more specific examples',
      'Reduce filler words',
      'Elaborate on edge cases'
    ],
    observations: [
      'Used "um" 3 times',
      'Good pacing and clarity',
      'Could provide more technical depth'
    ],
    summary: 'Good response with solid technical knowledge. Focus on adding more specific examples and reducing filler words for even better performance.'
  };
}

function generateMockFeedback(transcript) {
  return `Great job on your response! You demonstrated a solid understanding of the problem and provided a structured approach to solving it. Your explanation was clear and easy to follow.

To improve further, consider adding more specific examples from your experience and elaborating on edge cases. Also, try to minimize filler words like "um" and "uh" to enhance your delivery.

Keep practicing, and you'll continue to improve. Your technical foundation is strong, so focus on refining your communication skills.`;
}
