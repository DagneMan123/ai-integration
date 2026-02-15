import React from 'react';

const AdminLogs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity Logs</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600">System activity logs and audit trail will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
