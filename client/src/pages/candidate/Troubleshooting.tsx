import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const Troubleshooting: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I start an interview?',
      answer: 'Navigate to the Interviews section and click "Start Interview" to begin a new session.'
    },
    {
      question: 'What if my internet connection drops?',
      answer: 'Your interview will be paused. Reconnect and click "Resume Interview" to continue.'
    },
    {
      question: 'Can I retake an interview?',
      answer: 'Yes, you can retake interviews. Visit your interview history and select "Retake".'
    },
    {
      question: 'How are my interviews scored?',
      answer: 'Interviews are scored based on technical accuracy, communication, and problem-solving skills.'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Troubleshooting</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow">
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 text-left">
                <HelpCircle size={20} className="text-blue-600" />
                <span className="font-semibold">{faq.question}</span>
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform ${expanded === idx ? 'rotate-180' : ''}`}
              />
            </button>
            {expanded === idx && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Troubleshooting;
