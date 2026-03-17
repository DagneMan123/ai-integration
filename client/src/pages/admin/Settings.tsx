import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { Settings as SettingsIcon, Bell, Eye, Lock } from 'lucide-react';
import { adminMenu } from '../../config/menuConfig';

const AdminSettings: React.FC = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    systemAlerts: true,
    auditLogs: true,
    twoFactorAuth: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <SettingsIcon size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500">Manage your admin account preferences</p>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid gap-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell size={20} className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive updates via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="w-5 h-5 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Push Notifications</p>
                  <p className="text-sm text-slate-500">Receive browser notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  className="w-5 h-5 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">System Alerts</p>
                  <p className="text-sm text-slate-500">Critical system notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.systemAlerts}
                  onChange={() => handleToggle('systemAlerts')}
                  className="w-5 h-5 rounded"
                />
              </div>
            </div>
          </div>

          {/* Audit & Logging */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Eye size={20} className="text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">Audit & Logging</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Audit Logs</p>
                  <p className="text-sm text-slate-500">Track all admin activities</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auditLogs}
                  onChange={() => handleToggle('auditLogs')}
                  className="w-5 h-5 rounded"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={20} className="text-purple-600" />
              <h2 className="text-xl font-bold text-slate-900">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">Required for admin accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                  className="w-5 h-5 rounded"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Save Changes
          </button>
          <button className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium">
            Cancel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
