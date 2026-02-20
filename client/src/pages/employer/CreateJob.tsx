import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { jobAPI } from '../../utils/api';
import toast from 'react-hot-toast';

interface JobFormData {
  title: string;
  description: string;
  experienceLevel: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills: string;
  jobType?: string;
  interviewType?: string;
}

const CreateJob: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<JobFormData>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: JobFormData) => {
    setSubmitting(true);
    try {
      const jobData = {
        title: data.title,
        description: data.description,
        location: data.location,
        experienceLevel: data.experienceLevel || 'entry',
        jobType: data.jobType || 'full-time',
        interviewType: data.interviewType || 'technical',
        requiredSkills: data.requiredSkills
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
      };

      await jobAPI.createJob(jobData);
      toast.success('Job created successfully!');
      navigate('/employer/jobs');
    } catch (error: any) {
      console.error('Job creation error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create job';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Job</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
              <input
                type="text"
                {...register('title', { required: 'Job title is required' })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.title && <p className="mt-1 text-sm text-danger">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
              <select
                {...register('experienceLevel', { required: 'Experience level is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead/Manager</option>
              </select>
              {errors.experienceLevel && <p className="mt-1 text-sm text-danger">{errors.experienceLevel.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                placeholder="e.g. Addis Ababa, Ethiopia"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.location && <p className="mt-1 text-sm text-danger">{errors.location.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary (ETB)</label>
                <input
                  type="number"
                  {...register('salaryMin')}
                  placeholder="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary (ETB)</label>
                <input
                  type="number"
                  {...register('salaryMax')}
                  placeholder="20000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills * (comma separated)</label>
              <input
                type="text"
                {...register('requiredSkills', { required: 'Skills are required' })}
                placeholder="JavaScript, React, Node.js"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.requiredSkills && <p className="mt-1 text-sm text-danger">{errors.requiredSkills.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={8}
                placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.description && <p className="mt-1 text-sm text-danger">{errors.description.message}</p>}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Job'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/employer/jobs')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
