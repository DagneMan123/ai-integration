import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Trash2, Archive, Loader } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { employerMenu } from '../../config/menuConfig';
import api from '../../utils/api';

interface Message {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
}

const Inbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/messages');
      setMessages(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/messages/${id}`);
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err: any) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const msg = messages.find(m => m.id === id);
      if (msg) {
        await api.patch(`/messages/${id}`, { archived: !msg.archived });
        setMessages(messages.map(m =>
          m.id === id ? { ...m, archived: !m.archived } : m
        ));
      }
    } catch (err: any) {
      console.error('Error archiving message:', err);
      alert('Failed to archive message');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/messages/${id}`, { read: true });
      setMessages(messages.map(msg =>
        msg.id === id ? { ...msg, read: true } : msg
      ));
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  };

  return (
    <DashboardLayout menuItems={employerMenu} role="employer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          </div>
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send size={18} />
            New Message
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        handleMarkAsRead(msg.id);
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                        !msg.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${!msg.read ? 'text-blue-900' : 'text-gray-900'}`}>
                            {msg.from}
                          </h3>
                          <p className="text-sm text-gray-600">{msg.subject}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{msg.body}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">{msg.timestamp}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(msg.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Archive size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(msg.id);
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Detail / Compose */}
            <div className="bg-white rounded-lg shadow p-6">
              {showCompose ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">New Message</h3>
                  <input
                    type="text"
                    placeholder="To:"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Subject:"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Message..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Send
                    </button>
                    <button
                      onClick={() => setShowCompose(false)}
                      className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : selectedMessage ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-600">From: {selectedMessage.from}</p>
                  <p className="text-sm text-gray-500">{selectedMessage.timestamp}</p>
                  <div className="border-t pt-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.body}</p>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Reply
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a message to view</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inbox;
