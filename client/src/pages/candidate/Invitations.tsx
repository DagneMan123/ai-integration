import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, ArrowRight, Calendar, Building2 } from 'lucide-react';
import Loading from '../../components/Loading';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../utils/api';
import toast from 'react-hot-toast';

interface Invitation {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  createdAt: string;
  deadline?: string;
}

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getPendingInvitations();
      const data = response.data?.data || [];
      
      // Map Interview type to Invitation type
      const mapped = data.map((item: any) => ({
        id: item.id,
        jobId: item.jobId || item.job?.id,
        jobTitle: item.job?.title || 'Interview',
        companyName: item.job?.company?.name || 'Company',
        createdAt: item.createdAt,
        deadline: item.deadline
      }));
      
      setInvitations(mapped);
    } catch (err: any) {
      console.error('Failed to load invitations:', err);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (invitation: Invitation) => {
    try {
      setStartingInterview(invitation.id);
      toast.loading('Starting interview...');
      
      // Convert IDs to numbers as backend expects
      const jobId = parseInt(invitation.jobId) || invitation.jobId;
      const applicationId = parseInt(invitation.id) || invitation.id;
      
      console.log('Starting interview with:', { jobId, applicationId });
      
      // Call the start interview API with correct parameters
      await interviewAPI.start({
        jobId,
        applicationId
      });
      
      toast.dismiss();
      toast.success('Interview started successfully!');
      
      // Redirect to interview start page (system check) with jobId and applicationId
      navigate(`/candidate/interview/start/${jobId}/${applicationId}`);
      setStartingInterview(null);
    } catch (err: any) {
      toast.dismiss();
      console.error('Failed to start interview:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to start interview';
      toast.error(errorMsg);
      setStartingInterview(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Interview Invitations</h1>
          <p className="text-gray-500 font-medium mt-2">Official interview invitations from companies.</p>
        </div>

        <div className="grid gap-6">
          {invitations.length > 0 ? (
            invitations.map((invitation) => (
              <div key={invitation.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border bg-green-50 text-green-700 border-green-100">
                        <CheckCircle className="w-4 h-4" /> Pending
                      </span>
                      <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-full text-xs font-bold uppercase">
                        Official
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                        {invitation.jobTitle}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-semibold text-gray-500">
                        <span className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" /> {invitation.companyName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs font-bold text-gray-400">
                        <Calendar className="w-4 h-4" />
                        Invited: {new Date(invitation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleStartInterview(invitation)}
                      disabled={startingInterview === invitation.id}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-wait"
                    >
                      {startingInterview === invitation.id ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          Start Interview
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <Mail className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">No Invitations Yet</h2>
              <p className="text-gray-500 mb-6">Apply for jobs to receive interview invitations.</p>
              <button
                onClick={() => navigate('/jobs')}
                className="text-blue-600 font-bold hover:underline"
              >
                Browse Job Openings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invitations;
