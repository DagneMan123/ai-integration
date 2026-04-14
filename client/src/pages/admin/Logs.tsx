import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';
import { 
  Clock, 
  Activity, 
  Download, 
  Filter, 
  Search, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import api from '../../utils/api';
import Loading from '../../components/Loading';

interface Log {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'danger' | 'success' | 'warning' | 'info';
  icon: React.ReactNode;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/admin/logs');
        const data = response.data?.data || [];
        
        const formattedLogs = data.map((log: any) => ({
          id: log.id,
          user: log.user?.firstName + ' ' + log.user?.lastName || 'Unknown',
          action: log.action,
          target: log.description || 'N/A',
          time: new Date(log.createdAt).toLocaleDateString(),
          type: log.action.includes('DELETE') ? 'danger' : 
                 log.action.includes('CREATED') ? 'success' : 
                 log.action.includes('UPDATED') ? 'warning' : 'info',
          icon: log.action.includes('DELETE') ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />
        }));
        
        setLogs(formattedLogs);
      } catch (err: any) {
        console.error('Error fetching logs:', err);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);
  
  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-blue-600" /> Activity Logs
            </h1>
            <p className="text-gray-500">Track all administrative and system activities</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading && <Loading />}

        {!loading && !error && (
          <>
            {/* Search & Stats Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <div className="lg:col-span-3 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search logs by user, action or target..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white shadow-sm"
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-center gap-3">
                 <Clock className="text-blue-600 w-5 h-5" />
                 <span className="text-blue-800 font-medium">Last updated: Just now</span>
              </div>
            </div>

            {/* Logs Table / List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity/Target</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.filter(log => 
                      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.target.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No logs found
                        </td>
                      </tr>
                    ) : (
                      logs.filter(log => 
                        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.target.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((log) => (
                        <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                {log.user.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900">{log.user}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="flex items-center gap-2">
                               <span className={`p-1.5 rounded-md ${
                                 log.type === 'danger' ? 'bg-red-50 text-red-600' :
                                 log.type === 'success' ? 'bg-green-50 text-green-600' :
                                 log.type === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                                 'bg-blue-50 text-blue-600'
                               }`}>
                                 {log.icon}
                               </span>
                               {log.action}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 italic">
                            {log.target}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {log.time}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                               log.type === 'danger' ? 'bg-red-100 text-red-800' :
                               log.type === 'success' ? 'bg-green-100 text-green-800' :
                               log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-blue-100 text-blue-800'
                             }`}>
                               {log.type.toUpperCase()}
                             </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Placeholder */}
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center text-sm text-gray-500">
                <span>Showing {logs.length} logs</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded bg-white disabled:opacity-50">Prev</button>
                  <button className="px-3 py-1 border rounded bg-white">Next</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLogs;