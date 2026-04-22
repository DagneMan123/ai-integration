import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import PracticeInterviewEnvironment from '../../components/PracticeInterviewEnvironment';
import InterviewLobby from '../../components/InterviewLobby';
import { aiInterviewService } from '../../services/aiInterviewService';
import toast from 'react-hot-toast';

interface Question {
  id: number;
  text: string;
  type: string;
  difficulty: string;
}

const Assessment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract URL parameters
  const category = searchParams.get('category') || 'Technical';
  const difficulty = searchParams.get('difficulty') || 'Intermediate';
  const duration = parseInt(searchParams.get('duration') || '45', 10);
  
  // Get state from navigation
  const state = location.state as any;
  const sessionType = state?.sessionType || `${category} Interview`;
  const questionCount = state?.questionCount || 5;
  
  const [phase, setPhase] = useState<'lobby' | 'interview' | 'complete'>('lobby');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [interviewId, setInterviewId] = useState<number | null>(null);

  // AI CONTEXT: Log the parameters for AI service
  useEffect(() => {
    console.log('[Assessment] Initialized with parameters:', {
      category,
      difficulty,
      duration,
      sessionType,
      questionCount
    });
  }, [category, difficulty, duration, sessionType, questionCount]);

  const handleBeginInterview = async () => {
    setLoading(true);
    try {
      // AI CONTEXT: Generate questions based on category and difficulty
      console.log('[Assessment] Generating questions with AI context', {
        category,
        difficulty,
        count: questionCount
      });

      // Generate mock questions (in production, this would call AIService)
      const mockQuestions: Question[] = Array.from({ length: questionCount }, (_, i) => ({
        id: i + 1,
        text: generateQuestionByCategory(category, difficulty, i),
        type: category,
        difficulty: difficulty
      }));

      // START INTERVIEW: Create interview record in database
      console.log('[Assessment] Starting interview in database');
      try {
        const response = await aiInterviewService.startInterview({
          jobId: 1, // Default job ID for practice mode
          applicationId: 1, // Default application ID for practice mode
          interviewMode: 'video',
          strictnessLevel: 'moderate'
        });

        if (response.data?.data?.interviewId) {
          setInterviewId(response.data.data.interviewId);
          console.log('[Assessment] Interview created:', {
            interviewId: response.data.data.interviewId,
            status: response.data.data.status
          });
        }
      } catch (startError) {
        console.warn('[Assessment] Could not create interview record:', startError);
        // Continue anyway - will create interview on first response save
      }

      setQuestions(mockQuestions);
      setPhase('interview');
    } catch (error) {
      console.error('[Assessment] Error starting interview:', error);
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInterview = (responses: any[]) => {
    console.log('[Assessment] Interview completed', {
      category,
      difficulty,
      responsesCount: responses.length,
      totalTime: responses.reduce((sum, r) => sum + r.recordingTime, 0)
    });

    // Navigate back to practice page with results
    navigate('/candidate/practice', {
      state: {
        completed: true,
        responses,
        category,
        difficulty
      }
    });
  };

  // TIMER SYNC: The duration is passed to PracticeInterviewEnvironment
  // which uses it to set the countdown timer
  if (phase === 'lobby') {
    return (
      <DashboardLayout menuItems={candidateMenu} role="candidate">
        <InterviewLobby
          sessionType={sessionType}
          duration={duration}
          questionCount={questionCount}
          onBegin={handleBeginInterview}
          onCancel={() => navigate('/candidate/practice')}
          onDemoMode={() => {
            setDemoMode(true);
            handleBeginInterview();
          }}
        />
      </DashboardLayout>
    );
  }

  if (phase === 'interview' && questions.length > 0) {
    return (
      <PracticeInterviewEnvironment
        sessionType={sessionType}
        questions={questions}
        duration={duration}
        onComplete={handleCompleteInterview}
        onCancel={() => navigate('/candidate/practice')}
        demoMode={demoMode}
      />
    );
  }

  return null;
};

/**
 * Generate questions based on category and difficulty
 * AI CONTEXT: This function adjusts questions based on category and difficulty parameters
 */
function generateQuestionByCategory(category: string, difficulty: string, index: number): string {
  const technicalQuestions = {
    Beginner: [
      'What is a variable and how do you declare one in your preferred language?',
      'Explain the difference between a function and a method.',
      'What is a loop and why is it useful?',
      'Describe what an array is and give an example.',
      'What is the purpose of conditional statements (if/else)?'
    ],
    Intermediate: [
      'Explain the concept of closures in JavaScript and provide a practical example.',
      'How would you optimize a slow database query? Walk us through your approach.',
      'Describe the difference between SQL and NoSQL databases and when to use each.',
      'What is the time complexity of binary search and why is it efficient?',
      'How would you handle authentication and authorization in a web application?'
    ],
    Advanced: [
      'Design a distributed caching system for a high-traffic e-commerce platform.',
      'Explain how you would implement a load balancer for microservices.',
      'Describe the CAP theorem and its implications for distributed systems.',
      'How would you optimize a system that processes millions of events per second?',
      'Explain the trade-offs between consistency and availability in distributed systems.'
    ]
  };

  const behavioralQuestions = {
    Beginner: [
      'Tell us about yourself and your background.',
      'Why are you interested in this role?',
      'What are your strengths?',
      'Describe a time when you learned something new.',
      'How do you handle feedback?'
    ],
    Intermediate: [
      'Tell us about a time when you had to work with a difficult team member. How did you handle it?',
      'Describe a situation where you failed. What did you learn from it?',
      'How do you prioritize tasks when you have multiple deadlines?',
      'Tell us about your greatest professional achievement.',
      'How do you stay updated with the latest industry trends?'
    ],
    Advanced: [
      'Describe a time when you had to make a difficult decision with incomplete information.',
      'Tell us about a project where you had to lead a team through significant challenges.',
      'How do you handle conflicts between team members?',
      'Describe a time when you had to adapt your communication style for different audiences.',
      'Tell us about a time when you had to influence stakeholders without direct authority.'
    ]
  };

  const caseStudyQuestions = {
    Beginner: [
      'How would you approach building a simple todo list application?',
      'Design a basic inventory management system for a small store.',
      'How would you build a simple weather application?'
    ],
    Intermediate: [
      'A startup wants to build a ride-sharing app. How would you approach the technical architecture?',
      'Design a system to handle real-time notifications for millions of users.',
      'How would you scale an e-commerce platform to handle Black Friday traffic?'
    ],
    Advanced: [
      'Design a global payment processing system that handles millions of transactions daily.',
      'How would you architect a real-time collaborative document editing platform?',
      'Design a system for detecting and preventing fraud in a financial institution.'
    ]
  };

  let questionSet: Record<string, string[]> = {};

  if (category === 'Technical') {
    questionSet = technicalQuestions;
  } else if (category === 'Behavioral') {
    questionSet = behavioralQuestions;
  } else if (category === 'Case') {
    questionSet = caseStudyQuestions;
  }

  const questions = questionSet[difficulty] || questionSet['Intermediate'];
  return questions[index % questions.length];
}

export default Assessment;
