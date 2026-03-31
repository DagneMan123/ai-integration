import React, { useEffect, useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import Loading from '../../components/Loading';

const JobAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch job alerts
    setLoading(false);
  }, []);

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Job Alerts</h1>
              <p className="text-gray-500 font-medium mt-1">Manage your job search notifications</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
              <Plus className="w-5 h-5" />
              Create Alert
            </button>
          </div>

          {/* Alerts List */}
          {alerts.length > 0 ? (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">{alert.keyword}</h3>
                      </div>
                      <p className="text-gray-600">{alert.location}</p>
                      <p className="text-sm text-gray-500 mt-2">Last triggered: {alert.lastTriggered}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-500 font-bold text-lg">No job alerts yet</p>
              <p className="text-gray-400">Create alerts to get notified about new job opportunities</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobAlerts;
