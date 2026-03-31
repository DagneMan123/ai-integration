import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import Loading from '../../components/Loading';

const Invitations: React.FC = () => {
  const [invitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch interview invitations
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Official Invitations</h1>
            <p className="text-gray-500 font-medium mt-1">Interview invitations from employers</p>
          </div>

          {/* Invitations List */}
          {invitations.length > 0 ? (
            <div className="grid gap-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{invitation.jobTitle}</h3>
                      <p className="text-gray-600 font-medium">{invitation.company}</p>
                      <p className="text-sm text-gray-500 mt-2">Invited on: {invitation.invitedDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-600">Pending</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-all">
                      Accept & Schedule
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 transition-all">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-500 font-bold text-lg">No invitations yet</p>
              <p className="text-gray-400">Apply for jobs to receive interview invitations</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invitations;
