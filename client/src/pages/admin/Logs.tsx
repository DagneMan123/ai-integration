import React, { useState } from 'react';
import { 
  Clock, 
  Activity, 
  Download, 
  Filter, 
  Search, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

interface Log {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'danger' | 'success' | 'warning' | 'info';
  icon: React.ReactNode;
}

const MOCK_LOGS: Log[] = [
  {
    id: 1,
    user: 'John Admin',
    action: 'Created Job',
    target: 'Senior Developer Position',
    time: '2 hours ago',
    type: 'success',
    icon: <CheckCircle2 size={16} />
  },
  {
    id: 2,
    user: 'Sarah Manager',
    action: 'Updated Company',
    target: 'Tech Solutions Inc',
    time: '4 hours ago',
    type: 'success',
    icon: <CheckCircle2 size={16} />
  },
  {
    id: 3,
    user: 'Mike Support',
    action: 'Deleted User',
    target: 'Inactive Account',
    time: '6 hours ago',
    type: 'danger',
    icon: <AlertCircle size={16} />
  },
  {
    id: 4,
    user: 'Emma Admin',
    action: 'Modified Payment',
    target: 'Invoice #2024-001',
    time: '8 hours ago',
    type: 'warning',
    icon: <AlertCircle size={16} />
  },
  {
    id: 5,
    user: 'David Support',
    action: 'Approved Interview',
    target: 'Candidate #5432',
    time: '10 hours ago',
    type: 'success',
    icon: <CheckCircle2 size={16} />
  }
];

const AdminLogs: React.FC = () => {
  const [logs] = useState<Log[]>(MOCK_LOGS);
  
  return (
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

        {/* Search & Stats Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search logs by user, action or target..." 
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
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
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
      </div>
    </div>
  );
};

export default AdminLogs;