import React, { useState } from 'react';
import { X, MessageSquare, AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

interface SupportTicketsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  assignee?: string;
}

const SupportTickets: React.FC<SupportTicketsProps> = ({ isOpen, onClose }) => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TKT-001',
      title: 'Login page not loading',
      description: 'Users unable to access login page on mobile',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2 hours ago',
      updatedAt: '30 mins ago',
      assignee: 'John Dev'
    },
    {
      id: 'TKT-002',
      title: 'Payment processing error',
      description: 'Chapa payment integration failing intermittently',
      status: 'open',
      priority: 'critical',
      createdAt: '1 hour ago',
      updatedAt: '1 hour ago'
    },
    {
      id: 'TKT-003',
      title: 'Dashboard performance slow',
      description: 'Dashboard takes 10+ seconds to load',
      status: 'open',
      priority: 'medium',
      createdAt: '3 hours ago',
      updatedAt: '3 hours ago'
    },
    {
      id: 'TKT-004',
      title: 'Email verification not working',
      description: 'Users not receiving verification emails',
      status: 'resolved',
      priority: 'high',
      createdAt: '1 day ago',
      updatedAt: '2 hours ago',
      assignee: 'Sarah QA'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'in-progress':
        return <Clock size={16} className="text-yellow-500" />;
      case 'resolved':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MessageSquare size={24} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Support Tickets</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{openTickets}</p>
              <p className="text-xs text-red-600 font-medium">Open</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{inProgressTickets}</p>
              <p className="text-xs text-yellow-600 font-medium">In Progress</p>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Tickets
            </h3>
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                className="w-full text-left border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    <span className="font-bold text-slate-900 text-sm">{ticket.id}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </div>

                <p className="font-semibold text-slate-900 mb-1 text-sm">{ticket.title}</p>
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{ticket.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{ticket.createdAt}</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>

                {ticket.assignee && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">Assigned to:</span> {ticket.assignee}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Create New Ticket Button */}
          <button className="w-full bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors mt-6">
            Create New Ticket
          </button>
        </div>
      </div>
    </>
  );
};

export default SupportTickets;
