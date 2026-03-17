import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User, Settings, LogOut, Mail, Shield, Clock, X } from 'lucide-react';

interface AccountMenuProps {
  userName: string;
  userRole: 'admin' | 'employer' | 'candidate';
}

const AccountMenu: React.FC<AccountMenuProps> = ({ userName, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    const rolePrefix = userRole === 'admin' ? '/admin' : userRole === 'employer' ? '/employer' : '/candidate';
    navigate(`${rolePrefix}${path}`);
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setIsOpen(false);
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'employer':
        return 'bg-blue-100 text-blue-700';
      case 'candidate':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleLabel = () => {
    return userRole.charAt(0).toUpperCase() + userRole.slice(1);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Account Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-bold text-slate-900">{userName}</p>
          <p className="text-xs text-slate-500">{getRoleLabel()}</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm">{userName}</p>
                <span className={`inline-block text-xs font-bold px-2 py-1 rounded mt-1 ${getRoleColor()}`}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="divide-y divide-slate-100">
            {/* Profile Section */}
            <div className="p-2">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <User size={18} className="text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">My Profile</p>
                  <p className="text-xs text-slate-500">View and edit profile</p>
                </div>
              </button>
            </div>

            {/* Account Settings Section */}
            <div className="p-2">
              <button
                onClick={() => handleNavigate('/settings')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <Settings size={18} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Settings</p>
                  <p className="text-xs text-slate-500">Account preferences</p>
                </div>
              </button>

              <button
                onClick={() => handleNavigate('/security')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <Shield size={18} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Security</p>
                  <p className="text-xs text-slate-500">Password & 2FA</p>
                </div>
              </button>

              <button
                onClick={() => handleNavigate('/notifications')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <Mail size={18} className="text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">Email preferences</p>
                </div>
              </button>

              <button
                onClick={() => handleNavigate('/activity')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <Clock size={18} className="text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Activity</p>
                  <p className="text-xs text-slate-500">Login history</p>
                </div>
              </button>
            </div>

            {/* Logout Section */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
              >
                <LogOut size={18} className="flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold">Sign Out</p>
                  <p className="text-xs text-red-500">End your session</p>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 border-t border-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">
              Last login: Today at 2:30 PM
            </p>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Profile Info Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{userName}</p>
                    <p className="text-sm text-slate-600 capitalize">{userRole} Account</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleNavigate('/profile');
                  }}
                  className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left"
                >
                  <p className="font-bold text-indigo-900">Edit Profile</p>
                  <p className="text-xs text-indigo-700">Update your information</p>
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleNavigate('/settings');
                  }}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  <p className="font-bold text-blue-900">Settings</p>
                  <p className="text-xs text-blue-700">Preferences & options</p>
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleNavigate('/security');
                  }}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                >
                  <p className="font-bold text-green-900">Security</p>
                  <p className="text-xs text-green-700">Password & 2FA</p>
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleNavigate('/activity');
                  }}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                >
                  <p className="font-bold text-purple-900">Activity</p>
                  <p className="text-xs text-purple-700">Login history</p>
                </button>
              </div>

              {/* Account Info */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-slate-900">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Role:</span>
                    <span className="font-medium text-slate-900 capitalize">{userRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Login:</span>
                    <span className="font-medium text-slate-900">Today at 2:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  handleLogout();
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
