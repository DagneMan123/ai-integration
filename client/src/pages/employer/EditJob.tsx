import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { jobAPI } from '../../utils/api';
import DashboardLayout from '../../components/DashboardLayout';
import { employerMenu } from '../../config/menuConfig';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';
import { 
  Briefcase, 
  MapPin, 
  Code, 
  ChevronLeft, 
  Sparkles, 
  Save,
  Zap,
  Info,
  Layers
} from 'lucide-react';

interface JobFormData {
  title: string;
  description: string;
  experienceLevel: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string;
  jobType: string;
  interviewType: string;
  strictness: string;
}

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<JobFormData>();

  // 1. ነባር መረጃዎችን ከ API ማምጣት
  const fetchJobDetails = useCallback(async () => {
    try {
      const response = await jobAPI.getOne(id!); // jobAPI.getOne
      const job = response.data.data;
      
      // ፎርሙን በዳታ መሙላት
      setValue('title', job.title);
      setValue('description', job.description);
      setValue('location', job.location);
      setValue('experienceLevel', job.experienceLevel);
      setValue('jobType', job.jobType);
      setValue('interviewType', job.interviewType || 'technical');
      setValue('strictness', job.strictness || 'moderate');
      setValue('salaryMin', job.salaryMin);
      setValue('salaryMax', job.salaryMax);
      
      // Array የነበረውን ስኪል ወደ String መቀየር
      if (Array.isArray(job.requiredSkills)) {
        setValue('requiredSkills', job.requiredSkills.join(', '));
      }
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/employer/jobs');
    } finally {
      setLoading(false);
    }
  }, [id, setValue, navigate]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  // 2. መረጃውን አድሶ መላክ (Update)
  const onSubmit = async (data: JobFormData) => {
    setUpdating(true);
    try {
      const updatedData = {
        ...data,
        requiredSkills: data.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== '')
      };

      await jobAPI.update(id!, updatedData); // jobAPI.update
      toast.success('Job updated successfully!');
      navigate('/employer/jobs');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={employerMenu} role="employer">
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/employer/jobs')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-6 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Job Posting</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
            <p className="text-gray-500 font-medium italic">Modifying ID: <span className="font-mono">{id?.slice(-8)}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: General Info */}
          <FormSection title="Core Details" icon={<Briefcase className="w-5 h-5 text-blue-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField label="Job Title" error={errors.title?.message}>
                  <input {...register('title', { required: 'Title is required' })} className="form-input-pro" />
                </InputField>
              </div>
              <InputField label="Job Type">
                <select {...register('jobType')} className="form-input-pro appearance-none">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </InputField>
              <InputField label="Location">
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input {...register('location', { required: 'Required' })} className="form-input-pro pl-12" />
                </div>
              </InputField>
            </div>
          </FormSection>

          {/* Section 2: AI Settings */}
          <FormSection 
            title="SimuAI Configuration" 
            icon={<Sparkles className="w-5 h-5 text-amber-500" />}
            description="Updating these values will affect future AI-generated interview questions."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Evaluation Focus">
                <select {...register('interviewType')} className="form-input-pro appearance-none">
                  <option value="technical">Technical Depth</option>
                  <option value="behavioral">Soft Skills</option>
                  <option value="mixed">Comprehensive</option>
                </select>
              </InputField>
              <InputField label="AI Strictness">
                <select {...register('strictness')} className="form-input-pro appearance-none">
                  <option value="relaxed">Relaxed</option>
                  <option value="moderate">Moderate</option>
                  <option value="strict">Strict</option>
                </select>
              </InputField>
            </div>
          </FormSection>

          {/* Section 3: Requirements */}
          <FormSection title="Requirements" icon={<Layers className="w-5 h-5 text-purple-600" />}>
            <div className="space-y-6">
              <InputField label="Skills" subLabel="Comma separated list">
                <div className="relative">
                  <Code className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input {...register('requiredSkills')} className="form-input-pro pl-12" />
                </div>
              </InputField>
              <InputField label="Job Description">
                <textarea {...register('description')} rows={10} className="form-input-pro resize-none leading-relaxed" />
              </InputField>
            </div>
          </FormSection>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={updating || !isDirty}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-[0.98]"
            >
              {updating ? <Zap className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
              {updating ? 'Updating System...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/employer/jobs')}
              className="px-10 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-10 p-5 bg-blue-50/50 rounded-2xl border border-blue-50 flex gap-4">
           <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
           <p className="text-xs text-blue-800 font-medium leading-relaxed uppercase">
             Notice: Changes to core requirements might require already pending candidates to re-take certain AI modules.
           </p>
        </div>
      </div>

      <style>{`
        .form-input-pro {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1a202c;
          transition: all 0.2s;
          outline: none;
        }
        .form-input-pro:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.05);
        }
      `}</style>
    </div>
    </DashboardLayout>
  );
};

/* --- UI Helpers --- */
const FormSection = ({ title, icon, description, children }: any) => (
  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-8 border-b border-gray-50 bg-gray-50/20">
      <div className="flex items-center gap-3 mb-1">
        {icon}
        <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
      </div>
      {description && <p className="text-xs text-gray-500 font-medium ml-8">{description}</p>}
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const InputField = ({ label, subLabel, error, children }: any) => (
  <div className="space-y-1.5 w-full">
    <div className="flex justify-between items-end ml-1">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      {subLabel && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{subLabel}</span>}
    </div>
    {children}
    {error && <p className="text-xs font-bold text-red-500 ml-1">{error}</p>}
  </div>
);

export default EditJob;