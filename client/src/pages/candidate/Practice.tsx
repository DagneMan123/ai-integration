import React, { useState } from 'react';
import { Play, BookOpen, Zap } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import { interviewAPI } from '../../utils/api';

const Practice: React.FC = () => {
  const [practiceMode] = useState<any[]>([
    { id: 1, title: 'Technical Interview', description: 'Practice coding and technical questions', difficulty: 'Intermediate' },
    { id: 2, title: 'Behavioral Interview', description: 'Improve your soft skills and communication', difficulty: 'Beginner' },
    { id: 3, title: 'Case Study Analysis', description: 'Solve real-world business problems', difficulty: 'Advanced' },
  ]);

  const handleStartPractice = async (sessionId: number) => {
    try {
      const response = await interviewAPI.start({ sessionId });
      if (response.data.success) {
        window.location.href = `/candidate/practice/${response.data.data.id}`;
      }
    } catch (error) {
      console.error('Error starting practice:', error);
    }
  };

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Practice Mode</h1>
            <p className="text-gray-500 font-medium mt-1">Prepare for your interviews with practice sessions</p>
          </div>

          {/* Practice Sessions */}
          <div className="grid md:grid-cols-2 gap-6">
            {practiceMode.map((session) => (
              <div key={session.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{session.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                  </div>
                  <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    session.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                    session.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {session.difficulty}
                  </span>
                  <button 
                    onClick={() => handleStartPractice(session.id)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all">
                    <Play className="w-4 h-4" />
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Practice Tips</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Practice regularly to build confidence</li>
                  <li>• Record yourself to review your performance</li>
                  <li>• Focus on clear communication and structure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Practice;
