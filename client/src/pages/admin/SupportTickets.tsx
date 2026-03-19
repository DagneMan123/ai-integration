import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, CheckCircle, Clock, Filter, Loader } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';
import api from '../../utils/api';

interface Ticket {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  email: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  category: string;
}

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch from support/tickets endpoint or use a mock for now
      // This assumes you have a support tickets API endpoint
      const response = await api.get('/admin/support-tickets');
      setTickets(response.data?.data || []);
    } catch (err: any) {
      // If endpoint doesn't exist, show message but don't fail
      console.log('Support tickets endpoint not yet available, showing empty state');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          </div>
          <button 
            onClick={fetchTickets}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
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
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Open</p>
                <p className="text-2xl font-bold text-red-600">{tickets.filter(t => t.status === 'open').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'in-progress').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolved').length}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ticket ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted By</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-blue-600">{ticket.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{ticket.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div>
                              <p className="font-medium">{ticket.submittedBy}</p>
                              <p className="text-xs text-gray-500">{ticket.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{ticket.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{ticket.createdAt}</td>
                          <td className="px-6 py-4">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SupportTickets;
