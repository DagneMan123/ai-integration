import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { jobAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Code, 
  FileText, 
  ChevronLeft, 
  Sparkles, 
  Layers, 
  Zap,
  Save,
  Send
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

const CreateJob: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<JobFormData>({
    defaultValues: {
      jobType: 'full-time',
      interviewType: 'technical',
      strictness: 'moderate'
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: JobFormData) => {
    setSubmitting(true);
    try {
      const jobData = {
        ...data,
        requiredSkills: data.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== '')
      };

      await jobAPI.create(jobData);
      toast.success('Job published successfully!');
      navigate('/employer/jobs');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb / Back button */}
        <button 
          onClick={() => navigate('/employer/jobs')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-6 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Post a New Job</h1>
            <p className="text-gray-500 font-medium mt-1">Fill in the details to find and AI-interview your next talent.</p>
          </div>
          <div className="flex gap-3">
             <button className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
               <Save className="w-4 h-4" /> Save Draft
             </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <FormSection title="Basic Information" icon={<Briefcase className="w-5 h-5 text-blue-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField label="Job Title *" error={errors.title?.message}>
                  <input 
                    {...register('title', { required: 'Job title is required' })}
                    className="form-input-pro" 
                    placeholder="e.g. Senior Full Stack Developer" 
                  />
                </InputField>
              </div>
              
              <InputField label="Job Type *" error={errors.jobType?.message}>
                <select {...register('jobType')} className="form-input-pro appearance-none">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </InputField>

              <InputField label="Location *" error={errors.location?.message}>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    {...register('location', { required: 'Location is required' })}
                    className="form-input-pro pl-12" 
                    placeholder="Addis Ababa, Ethiopia / Remote" 
                  />
                </div>
              </InputField>
            </div>
          </FormSection>

          {/* Section 2: Requirements & Salary */}
          <FormSection title="Requirements & Compensation" icon={<Layers className="w-5 h-5 text-purple-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Experience Level *" error={errors.experienceLevel?.message}>
                <select {...register('experienceLevel', { required: 'Required' })} className="form-input-pro appearance-none">
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (2-5 years)</option>
                  <option value="senior">Senior Level (5+ years)</option>
                  <option value="lead">Lead / Managerial</option>
                </select>
              </InputField>

              <InputField label="Required Skills *" subLabel="Comma separated">
                <div className="relative">
                  <Code className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    {...register('requiredSkills', { required: 'Skills are required' })}
                    className="form-input-pro pl-12" 
                    placeholder="React, TypeScript, AWS..." 
                  />
                </div>
              </InputField>

              <InputField label="Min Salary (ETB)">
                <div className="relative">
                  <DollarSign className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input type="number" {...register('salaryMin')} className="form-input-pro pl-12" placeholder="Min" />
                </div>
              </InputField>

              <InputField label="Max Salary (ETB)">
                <div className="relative">
                  <DollarSign className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input type="number" {...register('salaryMax')} className="form-input-pro pl-12" placeholder="Max" />
                </div>
              </InputField>
            </div>
          </FormSection>

          {/* Section 3: AI Interview Settings */}
          <FormSection 
            title="SimuAI Interview Settings" 
            icon={<Sparkles className="w-5 h-5 text-amber-500" />}
            description="These settings define how our AI will evaluate candidates for this role."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Interview Focus">
                <select {...register('interviewType')} className="form-input-pro appearance-none">
                  <option value="technical">Technical Depth</option>
                  <option value="behavioral">Behavioral & Soft Skills</option>
                  <option value="mixed">Mixed Assessment</option>
                </select>
              </InputField>

              <InputField label="AI Strictness">
                <select {...register('strictness')} className="form-input-pro appearance-none">
                  <option value="relaxed">Relaxed (Helpful hints)</option>
                  <option value="moderate">Moderate (Standard)</option>
                  <option value="strict">Strict (Hardcore Technical)</option>
                </select>
              </InputField>
            </div>
          </FormSection>

          {/* Section 4: Description */}
          <FormSection title="Job Description" icon={<FileText className="w-5 h-5 text-gray-600" />}>
             <InputField label="Role Overview *" error={errors.description?.message}>
                <textarea 
                  {...register('description', { required: 'Description is required' })}
                  rows={8} 
                  className="form-input-pro resize-none" 
                  placeholder="Describe the responsibilities, daily tasks, and company culture..."
                />
             </InputField>
          </FormSection>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Zap className="w-5 h-5 animate-pulse" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Publish Job Posting
                </>
              )}
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

        {/* Info Footer */}
        <p className="mt-10 text-center text-xs text-gray-400 font-medium">
          By publishing this job, it will be immediately visible to candidates and SimuAI will begin generating interview modules.
        </p>
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
          background-color: white;
        }
        .form-input-pro:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.05);
        }
        .form-input-pro::placeholder {
          color: #a0aec0;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
};

/* --- UI Helper Components --- */

const FormSection = ({ title, icon, description, children }: any) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
      <div className="flex items-center gap-3 mb-1">
        {icon}
        <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
      </div>
      {description && <p className="text-xs text-gray-500 font-medium ml-8">{description}</p>}
    </div>
    <div className="p-6 md:p-8">
      {children}
    </div>
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

export default CreateJob;