import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { interviewAPI, jobAPI } from '../../utils/api';
import { Interview, Job } from '../../types';
import Loading from '../../components/Loading';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  Calendar,
  Building2,
  Mic,
  Video,
  Type,
  Trophy,
  MapPin,
  Briefcase,
  DollarSign
} from 'lucide-react';

const CandidateInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobsMap, setJobsMap] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewsWithJobs();
  }, []);

  const fetchInterviewsWithJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch interviews
      const interviewResponse = await interviewAPI.getCandidateInterviews();
      const interviewsData = interviewResponse.data?.data || [];
      
      console.log('Interviews fetched:', interviewsData);

      // Extract job IDs from interviews
      const jobIds = new Set<string>();
      interviewsData.forEach((interview: any) => {
        if (interview.jobId) {
          jobIds.add(interview.jobId);
        } else if (interview.job && typeof interview.job === 'string') {
          jobIds.add(interview.job);
        }
      });

      console.log('Job IDs to fetch:', Array.from(jobIds));

      // Fetch job details for each job ID
      const jobsData: Record<string, Job> = {};
      for (const jobId of jobIds) {
        try {
          const jobResponse = await jobAPI.getJob(jobId);
          if (jobResponse.data?.data) {
            jobsData[jobId] = jobResponse.data.data;
          }
        } catch (err) {
          console.error(`Failed to fetch job ${jobId}:`, err);
        }
      }

      console.log('Jobs fetched:', jobsData);

      setJobsMap(jobsData);
      setInterviews(interviewsData);
    } catch (error: any) {
      console.error('Failed to fetch interviews:', error);
      setError('Failed to load interviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string, icon: any, label: string }> = {
      completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completed' },
      in_progress: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <PlayCircle className="w-4 h-4" />, label: 'In Progress' },
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="w-4 h-4" />, label: 'Upcoming' },
      cancelled: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <AlertCircle className="w-4 h-4" />, label: 'Cancelled' },
    };
    return configs[status] || { color: 'bg-gray-50 text-gray-700 border-gray-100', icon: <AlertCircle className="w-4 h-4" />, label: status };
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const getJobData = (interview: any) => {
    // Try to get job from jobsMap first
    if (interview.jobId && jobsMap[interview.jobId]) {
      return jobsMap[interview.jobId];
    }
    // Fallback to interview.job if it's an object
    if (interview.job && typeof interview.job === 'object') {
      return interview.job;
    }
    return null;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Interviews</h1>
          <p className="text-gray-500 font-medium mt-2">Manage your AI assessments and view performance reports.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {interviews.length > 0 ? (
            interviews.map((interview) => {
              const { color, icon, label } = getStatusConfig(interview.status);
              const jobData = getJobData(interview);

              return (
                <div key={interview._id || interview.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 p-6 md:p-8 overflow-hidden relative">
                  
                  {/* Decorative corner for completed ones */}
                  {interview.status === 'completed' && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    
                    {/* Interview Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
                          {icon}
                          {label.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-full text-xs font-bold uppercase tracking-wider">
                          {getModeIcon(interview.interviewMode || 'text')}
                          {interview.interviewMode || 'Text'} Mode
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                          {jobData ? jobData.title : 'General Assessment'}
                        </h3>
                        
                        {/* Job Details */}
                        {jobData && (
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-semibold text-gray-500">
                            <span className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              {jobData.company?.name || 'Company'}
                            </span>
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {jobData.location || 'Remote'}
                            </span>
                            <span className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              {jobData.experienceLevel || 'Entry Level'}
                            </span>
                            {jobData.salary?.min && (
                              <span className="flex items-center gap-2 text-emerald-600">
                                <DollarSign className="w-4 h-4" />
                                {`${(jobData.salary.min/1000)}k - ${(jobData.salary.max/1000)}k`}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Interview Date */}
                        <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-gray-500">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(interview.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {interview.status === 'completed' && interview.aiEvaluation ? (
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</p>
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Trophy className="w-4 h-4" />
                              <span className="text-2xl font-black">{interview.aiEvaluation.overallScore}%</span>
                            </div>
                          </div>
                          <Link
                            to={`/candidate/interview/${interview._id || interview.id}/report`}
                            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                          >
                            <FileText className="w-4 h-4" />
                            View Report
                          </Link>
                        </div>
                      ) : interview.status === 'in_progress' ? (
                        <Link
                          to={`/candidate/interview/${interview._id || interview.id}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                        >
                          Continue Session
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      ) : interview.status === 'pending' ? (
                        <Link
                          to={`/candidate/interview/${interview._id || interview.id}`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                        >
                          Start Interview
                          <PlayCircle className="w-5 h-5" />
                        </Link>
                      ) : null}
                    </div>

                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FileText className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No interviews scheduled</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto font-medium">Apply for jobs to receive an invitation for an AI-powered interview.</p>
              <Link to="/jobs" className="text-blue-600 font-black hover:underline underline-offset-8 decoration-2">
                Browse Job Openings →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviews;
