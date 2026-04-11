import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import Loading from '../../components/Loading';
import { 
  Search, 
  UserX, 
  UserCheck, 
  MoreVertical, 
  Shield, 
  User, 
  Mail
} from 'lucide-react';

// የተጠቃሚ መረጃ አይነት (Interface)
interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'employer' | 'candidate';
  isActive: boolean;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    // እዚህ ጋር የ API ጥሪ ይደረጋል (ለምሳሌ፡ adminAPI.updateUserStatus)
    console.log(`Toggling status for ${userId}`);
    // ስኬታማ ከሆነ በኋላ ስቴቱን አፕዴት ማድረግ
  };

  // Normalize roles from database (convert to lowercase for comparison)
  const normalizedUsers = users.map(user => ({
    ...user,
    role: user.role.toLowerCase() as 'admin' | 'employer' | 'candidate'
  }));

  // Search and filter logic
  const filteredUsers = normalizedUsers.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
            <p className="text-gray-500 font-medium">Manage {users.length} registered users on the platform</p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-72 shadow-sm hover:border-gray-300 transition-colors"
              />
            </div>
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none shadow-sm hover:border-gray-300 transition-colors font-medium"
            >
              <option value="all">All Roles</option>
              <option value="admin">👤 Admins</option>
              <option value="employer">🏢 Employers</option>
              <option value="candidate">👨‍💼 Candidates</option>
            </select>
          </div>
        </div>

        {/* Role Filter Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{normalizedUsers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admins</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{normalizedUsers.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employers</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{normalizedUsers.filter(u => u.role === 'employer').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Candidates</p>
            <p className="text-2xl font-black text-gray-600 mt-1">{normalizedUsers.filter(u => u.role === 'candidate').length}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2
                            ${user.role === 'admin' ? 'bg-purple-600 border-purple-200' :
                              user.role === 'employer' ? 'bg-blue-600 border-blue-200' :
                              'bg-gray-600 border-gray-200'}`}>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border
                          ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                            user.role === 'employer' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            'bg-gray-50 text-gray-700 border-gray-200'}`}>
                          {user.role === 'admin' && <Shield className="w-4 h-4" />}
                          {user.role === 'employer' && <span>🏢</span>}
                          {user.role === 'candidate' && <span>👤</span>}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold
                          ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            className={`p-2 rounded-lg transition-colors font-semibold text-sm
                              ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={user.isActive ? "Block User" : "Activate User"}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 font-medium">No users found matching your search.</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or role filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;