import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Lock, 
  Eye, 
  Moon, 
  Volume2,
  X,
  ChevronRight
} from 'lucide-react';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const settings = [
    {
      id: 'notifications',
      label: 'Push Notifications',
      icon: <Bell size={20} />,
      value: notifications,
      onChange: setNotifications
    },
    {
      id: 'email',
      label: 'Email Notifications',
      icon: <Bell size={20} />,
      value: emailNotifications,
      onChange: setEmailNotifications
    },
    {
      id: 'sound',
      label: 'Sound Effects',
      icon: <Volume2 size={20} />,
      value: soundEnabled,
      onChange: setSoundEnabled
    },
    {
      id: 'darkMode',
      label: 'Dark Mode',
      icon: <Moon size={20} />,
      value: darkMode,
      onChange: setDarkMode
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Settings Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Settings size={24} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Notifications Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Notifications
            </h3>
            <div className="space-y-3">
              {settings.slice(0, 2).map((setting) => (
                <label
                  key={setting.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{setting.icon}</span>
                    <span className="text-sm font-medium text-slate-700">
                      {setting.label}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={setting.value}
                    onChange={(e) => setting.onChange(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Preferences Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Preferences
            </h3>
            <div className="space-y-3">
              {settings.slice(2).map((setting) => (
                <label
                  key={setting.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{setting.icon}</span>
                    <span className="text-sm font-medium text-slate-700">
                      {setting.label}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={setting.value}
                    onChange={(e) => setting.onChange(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Security Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Security
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    Change Password
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Eye size={20} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    Privacy Settings
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Session Info</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Last Activity:</span>
                <span className="font-medium">Just now</span>
              </div>
              <div className="flex justify-between">
                <span>Device:</span>
                <span className="font-medium">Web Browser</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsSidebar;
