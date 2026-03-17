import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { Clock, LogIn, LogOut, Edit, FileText, AlertCircle } from 'lucide-react';
import { adminMenu } from '../../config/menuConfig';

const AdminActivity: React.FC = () => {

  const activities = [
    {
      id: 1,
      type: 'login',
      description: 'Signed in',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      timestamp: 'Today at 2:30 PM',
      icon: LogIn,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'user',
      description: 'Suspended user account: user@example.com',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      timestamp: 'Today at 1:15 PM',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      id: 3,
      type: 'system',
      description: 'Updated system settings',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      timestamp: 'Yesterday at 10:45 AM',
      icon: Edit,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'login',
      description: 'Signed in',
      device: 'Safari on iPhone',
      location: 'New York, USA',
      timestamp: 'Yesterday at 8:20 AM',
      icon: LogIn,
      color: 'text-green-600'
    },
    {
      id: 5,
      type: 'report',
      description: 'Generated system report',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      timestamp: '2 days ago at 6:00 PM',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 6,
      type: 'logout',
      description: 'Signed out',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      timestamp: '3 days ago at 3:30 PM',
      icon: LogOut,
      color: 'text-orange-600'
    },
  ];

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Clock size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Activity</h1>
            <p className="text-slate-500">Your login history and admin activities</p>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0 mt-1">
                      <IconComponent size={18} className={activity.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-900">{activity.description}</p>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-slate-500">{activity.device}</p>
                            <p className="text-sm text-slate-500">{activity.location}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 flex-shrink-0 whitespace-nowrap">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center">
          <button className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium">
            Load More Activity
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminActivity;
