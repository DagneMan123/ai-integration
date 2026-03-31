import React, { useState } from 'react';
import { MessageSquare, Send, Search } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

const Messages: React.FC = () => {
  const [conversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex gap-6 pb-10">
          {/* Conversations List */}
          <div className="w-80 border border-gray-200 rounded-2xl flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="bg-transparent border-none focus:outline-none text-sm flex-1"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <h4 className="font-bold text-gray-900">{conv.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                  <p>No conversations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 border border-gray-200 rounded-2xl flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900">{selectedConversation.name}</h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Messages would go here */}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="font-bold">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
