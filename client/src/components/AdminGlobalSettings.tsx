import React, { useState } from 'react';
import { X, Settings, Zap, Bell, Lock, Database, Mail } from 'lucide-react';

interface AdminGlobalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminGlobalSettings: React.FC<AdminGlobalSettingsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    twoFactorAuth: true,
    apiRateLimit: true,
    dataEncryption: true,
    auditLogging: true,
    userRegistration: true
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingsList = [
    {
      key: 'maintenanceMode',
      label: 'Maintenance Mode',
      icon: <Database size={18} />,
      description: 'Disable user access for maintenance'
    },
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      icon: <Mail size={18} />,
      description: 'Send system alerts via email'
    },
    {
      key: 'autoBackup',
      label: 'Auto Backup',
      icon: <Database size={18} />,
      description: 'Automatic daily database backups'
    },
    {
      key: 'twoFactorAuth',
      label: 'Two-Factor Auth',
      icon: <Lock size={18} />,
      description: 'Require 2FA for admin accounts'
    },
    {
      key: 'apiRateLimit',
      label: 'API Rate Limiting',
      icon: <Zap size={18} />,
      description: 'Limit API requests per user'
    },
    {
      key: 'dataEncryption',
      label: 'Data Encryption',
      icon: <Lock size={18} />,
      description: 'Encrypt sensitive data at rest'
    },
    {
      key: 'auditLogging',
      label: 'Audit Logging',
      icon: <Database size={18} />,
      description: 'Log all admin actions'
    },
    {
      key: 'userRegistration',
      label: 'User Registration',
      icon: <Bell size={18} />,
      description: 'Allow new user registrations'
    }
  ];

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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings size={24} className="text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Global Settings</h2>
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
          <div className="space-y-3">
            {settingsList.map((setting) => (
              <label
                key={setting.key}
                className="flex items-start justify-between p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-slate-400 mt-1">{setting.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900">{setting.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{setting.description}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings[setting.key as keyof typeof settings]}
                  onChange={() => handleToggle(setting.key as keyof typeof settings)}
                  className="w-5 h-5 rounded border-slate-300 text-purple-600 cursor-pointer mt-1 flex-shrink-0"
                />
              </label>
            ))}
          </div>

          {/* Save Button */}
          <button className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors mt-6">
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminGlobalSettings;
