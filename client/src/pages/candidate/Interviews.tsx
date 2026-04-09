import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { interviewAPI, jobAPI } from '../../utils/api';
import { Interview, Job } from '../../types';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  Calendar,
  Building2,
  Trophy,
  MapPin
} from 'lucide-react';

const CandidateInterviews: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobsMap, setJobsMap] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviewsWithJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch interviews from your automated backend
      const response = await interviewAPI.getCandidateInterviews();
      const interviewsData = response.data?.data || [];
      
      // 2. Map Job IDs
      const jobIds = new Set<string>();
      interviewsData.forEach((interview: any) => {
        const id = interview.jobId || interview.job;
        if (id) jobIds.add(id.toString());
      });

      // 3. Fetch specific job details for each interview
      const jobsData: Record<string, Job> = {};
      await Promise.all(
        Array.from(jobIds).map(async (id) => {
          try {
            const jobRes = await jobAPI.getJob(id);
            if (jobRes.data?.data) {
              jobsData[id] = jobRes.data.data;
            }
          } catch (err) {
            console.warn(`Job ${id} fetch failed`);
          }
        })
      );

      setJobsMap(jobsData);
      setInterviews(interviewsData);
    } catch (err: any) {
      console.error('Fetch failed:', err);
      setError('Connection issue. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviewsWithJobs();
  }, [fetchInterviewsWithJobs]);

  const getStatusConfig = (status: string) => {
    const normalized = status?.toUpperCase();
    const configs: Record<string, { color: string, icon: any, label: string }> = {
      COMPLETED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completed' },
      IN_PROGRESS: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <PlayCircle className="w-4 h-4" />, label: 'In Progress' },
      SCHEDULED: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="w-4 h-4" />, label: 'Ready to Start' },
      CANCELLED: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <AlertCircle className="w-4 h-4" />, label: 'Cancelled' },
    };
    return configs[normalized] || { color: 'bg-gray-50 text-gray-700 border-gray-100', icon: <Clock className="w-4 h-4" />, label: status };
  };

  const getJobData = (interview: any) => {
    const jobId = interview.jobId || interview.job;
    return jobsMap[jobId] || (typeof interview.job === 'object' ? interview.job : null);
  };

  const handleStartInterview = (jobId: string, applicationId: string) => {
    navigate(`/candidate/interview/start/${jobId}/${applicationId}`);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Interviews</h1>
          <p className="text-gray-500 font-medium mt-2">Access your AI-powered sessions and performance insights.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="grid gap-6">
          {interviews.length > 0 ? (
            interviews.map((interview) => {
              const statusNormalized = interview.status?.toUpperCase();
              const { color, icon, label } = getStatusConfig(interview.status);
              const jobData = getJobData(interview);
              const interviewId = interview.id || interview._id;

              return (
                <div key={interviewId} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
                          {icon} {label}
                        </span>
                        <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-full text-xs font-bold uppercase">
                          {interview.interviewMode || 'Text'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                          {jobData && typeof jobData.title === 'string' ? jobData.title : 'AI Evaluation'}
                        </h3>
                        
                        {jobData && (
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-semibold text-gray-500">
                            <span className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" /> {typeof jobData.company === 'object' && jobData.company?.name ? jobData.company.name : 'Partner'}
                            </span>
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> {typeof jobData.location === 'string' ? jobData.location : 'Addis Ababa'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-xs font-bold text-gray-400">
                          <Calendar className="w-4 h-4" />
                          Applied: {new Date(interview.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {statusNormalized === 'COMPLETED' ? (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Final Score</p>
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Trophy className="w-4 h-4" />
                              <span className="text-xl font-black">{(interview.overallScore || interview.aiEvaluation?.overallScore || 0)}%</span>
                            </div>
                          </div>
                          <Link to={`/candidate/interview/${interviewId}/report`} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
                            Report
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartInterview(String(interview.jobId || (typeof interview.job === 'object' ? interview.job?.id : interview.job)), String(interview.applicationId))}
                          className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                            statusNormalized === 'IN_PROGRESS' 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {statusNormalized === 'IN_PROGRESS' ? (
                            <>
                              Continue Interview
                              <ChevronRight className="w-5 h-5" />
                            </>
                          ) : (
                            <>
                              Start AI Interview
                              <PlayCircle className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">No Interview Found</h2>
              <p className="text-gray-500 mb-6">Apply for a job to see your interview here.</p>
              <Link to="/jobs" className="text-blue-600 font-bold hover:underline">Browse Job Openings →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviews;