import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import {
  ArrowLeft,
  Zap,
  Users,
  Clock,
  Target,
  BookOpen,
  Mic,
  MessageSquare,
} from 'lucide-react';

const AIPracticeArena: React.FC = () => {
  const navigate = useNavigate();

  const practiceModes = [
    {
      id: 'text',
      title: 'Text Interview',
      description: 'Practice answering interview questions in text format',
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'blue',
      difficulty: ['Easy', 'Medium', 'Hard'],
    },
    {
      id: 'voice',
      title: 'Voice Interview',
      description: 'Practice with voice responses and AI evaluation',
      icon: <Mic className="w-8 h-8" />,
      color: 'purple',
      difficulty: ['Easy', 'Medium', 'Hard'],
    },
    {
      id: 'video',
      title: 'Video Interview',
      description: 'Full video interview simulation with webcam',
      icon: <Users className="w-8 h-8" />,
      color: 'green',
      difficulty: ['Easy', 'Medium', 'Hard'],
    },
  ];

  const industries = [
    { name: 'Technology', icon: <Zap className="w-6 h-6" /> },
    { name: 'Finance', icon: <Target className="w-6 h-6" /> },
    { name: 'Healthcare', icon: <BookOpen className="w-6 h-6" /> },
    { name: 'Marketing', icon: <Users className="w-6 h-6" /> },
  ];

  const handleStartPractice = (mode: string, difficulty: string) => {
    // Navigate to practice session with parameters
    navigate(`/candidate/practice-session?mode=${mode}&difficulty=${difficulty}`);
  };

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="max-w-6xl mx-auto pb-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">AI Practice Arena</h1>
            <p className="text-gray-500 font-medium">Master interview skills with AI-powered practice</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-semibold">Sessions Completed</p>
                <p className="text-3xl font-black text-blue-900 mt-2">0</p>
              </div>
              <Target className="w-12 h-12 text-blue-300" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-semibold">Average Score</p>
                <p className="text-3xl font-black text-purple-900 mt-2">--</p>
              </div>
              <Zap className="w-12 h-12 text-purple-300" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-semibold">Total Practice Time</p>
                <p className="text-3xl font-black text-green-900 mt-2">0h</p>
              </div>
              <Clock className="w-12 h-12 text-green-300" />
            </div>
          </div>
        </div>

        {/* Practice Modes */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Choose Practice Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {practiceModes.map((mode) => (
              <div
                key={mode.id}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`bg-gradient-to-r from-${mode.color}-500 to-${mode.color}-600 p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{mode.title}</h3>
                    {mode.icon}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-6">{mode.description}</p>

                  <div className="space-y-3">
                    {mode.difficulty.map((level) => (
                      <button
                        key={level}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartPractice(mode.id, level.toLowerCase());
                        }}
                        className="w-full py-2 px-4 bg-gray-100 hover:bg-blue-500 hover:text-white text-gray-700 rounded-lg font-semibold transition"
                      >
                        {level} Level
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industries */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Practice by Industry</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industries.map((industry) => (
              <button
                key={industry.name}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition text-center"
              >
                <div className="flex justify-center mb-3 text-blue-600">{industry.icon}</div>
                <p className="font-semibold text-gray-900">{industry.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Tips for Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Practice Regularly</h3>
                <p className="text-gray-600 text-sm mt-1">Consistent practice improves your interview performance</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Focus on Clarity</h3>
                <p className="text-gray-600 text-sm mt-1">Clear communication is key to a successful interview</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Review Feedback</h3>
                <p className="text-gray-600 text-sm mt-1">Learn from AI feedback to improve your answers</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Track Progress</h3>
                <p className="text-gray-600 text-sm mt-1">Monitor your improvement over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIPracticeArena;
