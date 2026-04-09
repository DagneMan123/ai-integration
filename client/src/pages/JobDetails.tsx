import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../utils/api';
import { Job } from '../types';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  ChevronLeft, 
  ShieldCheck, 
  Building2, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  Globe,
  Award
} from 'lucide-react';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchJob = useCallback(async () => {
    try {
      const response = await jobAPI.getOne(id!);
      setJob(response.data?.data || null);
    } catch (error) {
      toast.error('Could not load job details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== 'undefined') fetchJob();
    else setLoading(false);
  }, [id, fetchJob]);

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'candidate') { toast.error('Only candidates can apply'); return; }
    
    setApplying(true);
    try {
      const appResponse = await applicationAPI.create({ jobId: id! });
      const applicationId = appResponse.data?.data?.id;
      
      if (!applicationId) {
        throw new Error('Failed to create application');
      }

      toast.success('Application submitted successfully!');
      navigate('/candidate/applications');
    } catch (error: any) {
      console.error('Apply error:', error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loading />;
  if (!job) return <div className="text-center py-20 font-bold text-gray-500">Job not found</div>;

  const company = typeof job.company === 'object' ? job.company : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navigation */}
        <button 
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50" />
               
               <div className="relative z-10">
                 <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                      {job.jobType || 'Full-time'}
                    </span>
                    {company?.isVerified && (
                      <span className="flex items-center gap-1.5 px-4 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                 </div>

                 <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                   {job.title}
                 </h1>
                 
                 <div className="flex items-center gap-3 text-xl text-gray-500 font-semibold mb-8">
                    <Building2 className="w-6 h-6 text-gray-300" />
                    <span>{company?.name || 'Company Name'}</span>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetaCard icon={<MapPin />} label="Location" value={job.location || 'Remote'} />
                    <MetaCard icon={<Award />} label="Level" value={job.experienceLevel} />
                    <MetaCard icon={<DollarSign />} label="Salary" value={job.salary ? `${job.salary.min / 1000}k - ${job.salary.max / 1000}k` : 'Private'} />
                    <MetaCard icon={<Clock />} label="Posted" value={new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                 </div>
               </div>
            </div>

            {/* Description & Skills */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm space-y-10">
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-blue-600" /> Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(job.requiredSkills || job.skills)?.map((skill: string, i: number) => (
                    <span key={i} className="px-5 py-2 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm border border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-50 pt-10">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-6">About the Role</h2>
                <div className="text-gray-600 leading-[1.8] text-lg font-medium whitespace-pre-line">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
               <Building2 className="absolute -right-10 -bottom-10 w-64 h-64 opacity-5 text-white" />
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center p-4 shadow-2xl">
                     {company?.logo ? <img src={company.logo} alt="Logo" /> : <Building2 className="w-12 h-12 text-gray-200" />}
                  </div>
                  <div className="text-center md:text-left flex-1">
                     <h3 className="text-2xl font-black mb-2">{company?.name}</h3>
                     <p className="text-blue-400 font-bold flex items-center justify-center md:justify-start gap-2 mb-4">
                        <Globe className="w-4 h-4" /> {company?.industry || 'Technology'}
                     </p>
                     <p className="text-gray-400 leading-relaxed max-w-2xl">{company?.description}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">
            
            {/* Apply Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 space-y-6">
              <div className="space-y-2">
                 <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Ready to join?</h3>
                 <p className="text-sm text-gray-500 font-medium">Be part of the next big thing at {company?.name}.</p>
              </div>

              {user?.role === 'candidate' ? (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
                >
                  {applying ? 'Processing...' : 'Apply Now'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : !user ? (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center bg-gray-900 text-white py-5 rounded-2xl font-black hover:bg-black transition-all text-center"
                >
                  Login to Apply
                </Link>
              ) : (
                <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs font-bold text-gray-400 uppercase tracking-widest italic">
                   Switch to Candidate role to apply
                </div>
              )}

              <div className="pt-4 border-t border-gray-50 space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Resume parsed by AI</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Instant status tracking</span>
                </div>
              </div>
            </div>

            {/* AI Process Notice */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden">
               <Cpu className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20" />
               <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                 <Cpu className="w-5 h-5" /> SimuAI Process
               </h4>
               <p className="text-sm text-blue-100 font-medium leading-relaxed mb-6">
                 Applying to this position includes a neural-proctored AI interview to evaluate your technical and soft skills fairly.
               </p>
               <Link to="/about" className="text-xs font-black uppercase tracking-widest text-white hover:underline flex items-center gap-2">
                 How it works <ArrowRight className="w-3 h-3" />
               </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* --- UI Helper Card --- */
const MetaCard = ({ icon, label, value }: any) => (
  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
    <div className="text-blue-600 mb-2">{React.cloneElement(icon, { size: 18, strokeWidth: 3 })}</div>
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-xs font-black text-gray-900">{value}</span>
  </div>
);

export default JobDetails;