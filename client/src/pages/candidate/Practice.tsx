import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PracticeInterviewEnvironment from '../../components/PracticeInterviewEnvironment';
import { Code, Users, Briefcase, Brain, ChevronRight } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: string;
  difficulty: string;
}

interface PracticeType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: Question[];
  duration: number;
}

const Practice: React.FC = () => {
  const navigate = useNavigate();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<PracticeType | null>(null);

  const practiceTypes: PracticeType[] = [
    {
      id: 'behavioral',
      title: 'Behavioral Interview',
      description: 'Practice answering common behavioral questions using the STAR method',
      icon: <Users size={24} />,
      duration: 15,
      questions: [
        {
          id: 1,
          text: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?',
          type: 'Behavioral',
          difficulty: 'Medium'
        },
        {
          id: 2,
          text: 'Describe a project where you had to learn a new technology quickly. What was your approach?',
          type: 'Behavioral',
          difficulty: 'Medium'
        },
        {
          id: 3,
          text: 'What is your greatest strength and how have you used it in your professional life?',
          type: 'Personal',
          difficulty: 'Easy'
        },
        {
          id: 4,
          text: 'Tell me about a time you failed. What did you learn from it?',
          type: 'Behavioral',
          difficulty: 'Hard'
        },
        {
          id: 5,
          text: 'How do you stay updated with industry trends and new technologies?',
          type: 'Professional',
          difficulty: 'Medium'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Interview',
      description: 'Practice solving technical problems and explaining your approach',
      icon: <Code size={24} />,
      duration: 20,
      questions: [
        {
          id: 1,
          text: 'Explain the difference between REST and GraphQL APIs. When would you use each?',
          type: 'Technical',
          difficulty: 'Medium'
        },
        {
          id: 2,
          text: 'How would you optimize a slow database query? Walk us through your debugging process.',
          type: 'Technical',
          difficulty: 'Hard'
        },
        {
          id: 3,
          text: 'Describe the concept of microservices and its advantages over monolithic architecture.',
          type: 'Technical',
          difficulty: 'Medium'
        },
        {
          id: 4,
          text: 'What is the difference between SQL and NoSQL databases? Provide use cases for each.',
          type: 'Technical',
          difficulty: 'Medium'
        },
        {
          id: 5,
          text: 'Explain how you would implement caching in a web application. What are the trade-offs?',
          type: 'Technical',
          difficulty: 'Hard'
        }
      ]
    },
    {
      id: 'case-study',
      title: 'Case Study Interview',
      description: 'Practice analyzing business problems and proposing solutions',
      icon: <Briefcase size={24} />,
      duration: 25,
      questions: [
        {
          id: 1,
          text: 'A startup wants to increase user engagement on their mobile app. How would you approach this problem?',
          type: 'Case Study',
          difficulty: 'Hard'
        },
        {
          id: 2,
          text: 'How would you estimate the market size for a new product in the e-commerce space?',
          type: 'Case Study',
          difficulty: 'Hard'
        },
        {
          id: 3,
          text: 'A company is losing market share to competitors. What would be your strategy to regain it?',
          type: 'Case Study',
          difficulty: 'Hard'
        },
        {
          id: 4,
          text: 'Design a system to handle real-time notifications for millions of users. What are the key considerations?',
          type: 'Case Study',
          difficulty: 'Hard'
        }
      ]
    },
    {
      id: 'situational',
      title: 'Situational Interview',
      description: 'Practice responding to hypothetical workplace scenarios',
      icon: <Brain size={24} />,
      duration: 15,
      questions: [
        {
          id: 1,
          text: 'You discover a critical bug in production that affects 10% of users. What do you do first?',
          type: 'Situational',
          difficulty: 'Medium'
        },
        {
          id: 2,
          text: 'Your manager asks you to complete a project in half the estimated time. How do you respond?',
          type: 'Situational',
          difficulty: 'Medium'
        },
        {
          id: 3,
          text: 'You disagree with a key decision made by your team lead. How would you handle this?',
          type: 'Situational',
          difficulty: 'Medium'
        },
        {
          id: 4,
          text: 'A team member is consistently missing deadlines. As a lead, how would you address this?',
          type: 'Situational',
          difficulty: 'Hard'
        },
        {
          id: 5,
          text: 'You receive critical feedback about your work. How do you respond and move forward?',
          type: 'Situational',
          difficulty: 'Medium'
        }
      ]
    }
  ];

  const handleStartPractice = (practice: PracticeType) => {
    setSelectedPractice(practice);
    setIsSessionActive(true);
  };

  const handleSessionComplete = (responses: any[]) => {
    console.log('Practice session completed with responses:', responses);
    setIsSessionActive(false);
    setSelectedPractice(null);
    navigate('/candidate/interview-history');
  };

  const handleSessionCancel = () => {
    setIsSessionActive(false);
    setSelectedPractice(null);
  };

  if (isSessionActive && selectedPractice) {
    return (
      <PracticeInterviewEnvironment
        sessionType={selectedPractice.title}
        questions={selectedPractice.questions}
        duration={selectedPractice.duration}
        onComplete={handleSessionComplete}
        onCancel={handleSessionCancel}
        demoMode={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Practice Interviews</h1>
          <p className="text-slate-600">Improve your interview skills with AI-powered video practice sessions</p>
        </div>

        {/* Practice Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practiceTypes.map((practice) => (
            <div key={practice.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                    {practice.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase">~{practice.duration} min</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{practice.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{practice.description}</p>

                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-medium mb-2">Questions in this session:</p>
                  <ul className="space-y-1">
                    {practice.questions.slice(0, 3).map((q) => (
                      <li key={q.id} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span className="line-clamp-1">{q.text}</span>
                      </li>
                    ))}
                    {practice.questions.length > 3 && (
                      <li className="text-xs text-slate-500 italic">+{practice.questions.length - 3} more questions</li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => handleStartPractice(practice)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Start Practice
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Before You Start</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Find a quiet, well-lit space
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Test your camera and microphone
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Ensure stable internet connection
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Have a professional background
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">During the Interview</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Look at the camera while speaking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Speak clearly and at natural pace
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Take time to think before answering
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Maintain professional posture
              </li>
            </ul>
          </div>
        </div>

        {/* Interview Types Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-4">Interview Types Explained</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <p className="font-semibold mb-2">Behavioral Interview</p>
              <p>Focus on past experiences and how you handled specific situations. Uses the STAR method (Situation, Task, Action, Result).</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Technical Interview</p>
              <p>Tests your technical knowledge, problem-solving skills, and ability to explain complex concepts clearly.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Case Study Interview</p>
              <p>Evaluates your analytical thinking, business acumen, and ability to solve real-world problems systematically.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Situational Interview</p>
              <p>Assesses how you would handle hypothetical workplace scenarios and your decision-making process.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
