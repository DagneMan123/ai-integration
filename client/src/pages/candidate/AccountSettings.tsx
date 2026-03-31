import React, { useState } from 'react';
import { Settings, Lock, Bell, Eye } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';

const AccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-5 h-5" /> },
  ];

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your account preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                  <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                  <input type="tel" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                  <h4 className="font-bold text-gray-900">Change Password</h4>
                  <p className="text-sm text-gray-500">Update your password regularly</p>
                </button>
                <button className="w-full p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors">
                  <h4 className="font-bold text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Get instant alerts</p>
                  </div>
                </label>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Profile Visibility</h4>
                    <p className="text-sm text-gray-500">Allow employers to see your profile</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
