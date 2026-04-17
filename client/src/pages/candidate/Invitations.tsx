import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MapPin } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import Loading from '../../components/Loading';
import { interviewAPI } from '../../utils/api';

const Invitations: React.FC = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await interviewAPI.getCandidateInterviews();
      if (response.data.success) {
        const data = response.data.data || [];
        // Deduplicate by jobId to remove redundant invitations
        const uniqueInvitations = Array.from(
          new Map(data.map(inv => [inv.jobId, inv])).values()
        );
        setInvitations(uniqueInvitations);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitation: any) => {
    try {
      if (invitation.jobId && invitation.applicationId) {
        navigate(`/candidate/interview/start/${invitation.jobId}/${invitation.applicationId}`);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDecline = async (interviewId: number) => {
    try {
      setInvitations(invitations.filter(inv => inv.id !== interviewId));
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

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
                      <h3 className="text-lg font-bold text-gray-900">{typeof invitation.job === 'object' ? (invitation.job?.title || 'Interview') : 'Interview'}</h3>
                      <p className="text-gray-600 font-medium">{typeof invitation.job === 'object' ? (invitation.job?.company?.name || 'Company') : 'Company'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {invitation.interviewMode || 'Online'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-600">Pending</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button 
                      onClick={() => handleAccept(invitation)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-all">
                      Accept & Schedule
                    </button>
                    <button 
                      onClick={() => handleDecline(invitation.id)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 transition-all">
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
