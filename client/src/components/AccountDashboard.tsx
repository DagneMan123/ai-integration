import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDashboardCommunication } from '../hooks/useDashboardCommunication';
import {
  X,
  Mail,
  Settings,
  Bell,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface AccountDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'admin' | 'employer' | 'candidate';
}

const AccountDashboard: React.FC<AccountDashboardProps> = ({ isOpen, onClose, role }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sendMessage, broadcastAlert } = useDashboardCommunication(role);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 000-0000',
    joinDate: user?.createdAt || new Date().toISOString()
  });

  const handleLogout = () => {
    // Notify other dashboards of logout
    sendMessage('all', 'notification', 'User Logged Out', `${user?.firstName} ${user?.lastName} has logged out`);
    
    // Broadcast logout alert
    broadcastAlert('User Session Ended', `${user?.firstName} has ended their session`, 'info');
    
    // Perform logout
    logout();
    onClose();
    navigate('/login');
  };

  const handleSaveProfile = () => {
    // Notify other dashboards of profile update
    sendMessage('all', 'data-update', 'Profile Updated', `${profileData.firstName} ${profileData.lastName} updated their profile`);
    setEditMode(false);
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'employer':
        return 'bg-blue-100 text-blue-700';
      case 'candidate':
        return 'bg-green-100 text-green-700';
    }
  };

  const getRoleLabel = () => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />

      {/* Account Dashboard Panel */}
      <div className="fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Account</h2>
            <p className="text-xs text-slate-300 mt-1">Manage your profile and settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.firstName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">
                {profileData.firstName} {profileData.lastName}
              </h3>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${getRoleColor()}`}>
                {getRoleLabel()}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-600">{profileData.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {['profile', 'settings', 'security'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900">Profile Information</h4>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Profile Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!editMode}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!editMode}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
                    />
                    <CheckCircle2 size={18} className="text-green-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Verified email</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!editMode}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</label>
                  <input
                    type="text"
                    value={new Date(profileData.joinDate).toLocaleDateString()}
                    disabled
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
                  />
                </div>
              </div>

              {editMode && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 mb-4">Preferences</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell size={18} className="text-slate-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Notifications</p>
                      <p className="text-xs text-slate-500">Receive platform updates</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-slate-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Email Alerts</p>
                      <p className="text-xs text-slate-500">Get email notifications</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings size={18} className="text-slate-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Auto-sync</p>
                      <p className="text-xs text-slate-500">Sync data automatically</p>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 mb-4">Security Settings</h4>

              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield size={18} className="text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Account Status</p>
                      <p className="text-xs text-blue-700 mt-1">Your account is secure and verified</p>
                    </div>
                  </div>
                </div>

                <button className="w-full flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold">
                  <Lock size={16} />
                  Change Password
                </button>

                <button className="w-full flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold">
                  <Shield size={16} />
                  Two-Factor Authentication
                </button>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-yellow-600 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-yellow-900">Active Sessions</p>
                      <p className="text-xs text-yellow-700 mt-1">1 active session on this device</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sign Out */}
        <div className="sticky bottom-0 border-t border-slate-200 p-6 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default AccountDashboard;