import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Mail, Bell, Zap } from 'lucide-react';
import { adminMenu } from '../../config/menuConfig';

const AdminNotifications: React.FC = () => {
  const [preferences, setPreferences] = useState({
    systemAlerts: true,
    userReports: true,
    paymentAlerts: true,
    securityAlerts: true,
    weeklyDigest: true,
    maintenanceNotices: true,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Mail size={24} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-500">Manage your admin notification preferences</p>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Email Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">System Alerts</p>
                <p className="text-sm text-slate-500">Critical system notifications</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.systemAlerts}
                onChange={() => handleToggle('systemAlerts')}
                className="w-5 h-5 rounded"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">User Reports</p>
                <p className="text-sm text-slate-500">User complaints and reports</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.userReports}
                onChange={() => handleToggle('userReports')}
                className="w-5 h-5 rounded"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Payment Alerts</p>
                <p className="text-sm text-slate-500">Payment and transaction alerts</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.paymentAlerts}
                onChange={() => handleToggle('paymentAlerts')}
                className="w-5 h-5 rounded"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Security Alerts</p>
                <p className="text-sm text-slate-500">Security incidents and threats</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.securityAlerts}
                onChange={() => handleToggle('securityAlerts')}
                className="w-5 h-5 rounded"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Weekly Digest</p>
                <p className="text-sm text-slate-500">Summary of weekly activity</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.weeklyDigest}
                onChange={() => handleToggle('weeklyDigest')}
                className="w-5 h-5 rounded"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Maintenance Notices</p>
                <p className="text-sm text-slate-500">System maintenance notifications</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.maintenanceNotices}
                onChange={() => handleToggle('maintenanceNotices')}
                className="w-5 h-5 rounded"
              />
            </div>
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={20} className="text-yellow-600" />
            <h2 className="text-xl font-bold text-slate-900">Notification Frequency</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              How often would you like to receive notifications?
            </label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Immediately</option>
              <option>Daily Digest</option>
              <option>Weekly Digest</option>
              <option>Never</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            Save Preferences
          </button>
          <button className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium">
            Cancel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications;
