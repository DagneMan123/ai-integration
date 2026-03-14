import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { userAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  skills: string;
  experience: string;
  education: string;
  bio?: string;
}

const CandidateProfile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      const profile = response.data.data;
      setValue('firstName', profile.user.firstName || '');
      setValue('lastName', profile.user.lastName || '');
      setValue('phone', profile.user.phone || '');
      setValue('skills', profile.user.skills || '');
      setValue('experience', profile.user.experience || '');
      setValue('education', profile.user.education || '');
      setValue('bio', profile.user.bio || '');
    } catch (error) {
      console.error('Failed to fetch profile', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setSuccessMessage('');
    try {
      await userAPI.updateProfile(data);
      updateUser(data);
      setSuccessMessage('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      setHasChanges(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async () => {
    setEmailError('');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if email is same as current
    if (newEmail === user?.email) {
      setEmailError('New email must be different from current email');
      return;
    }

    setSaving(true);
    try {
      await userAPI.updateProfile({ email: newEmail });
      updateUser({ email: newEmail });
      setSuccessMessage('Email updated successfully!');
      toast.success('Email updated successfully!');
      setEditingEmail(false);
      setNewEmail('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Failed to update email';
      setEmailError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your professional information and career details</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-semibold">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('firstName', { 
                    required: 'First name is required',
                    onChange: () => setHasChanges(true)
                  })}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    errors.firstName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Your first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('lastName', { 
                    required: 'Last name is required',
                    onChange: () => setHasChanges(true)
                  })}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    errors.lastName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Your last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              {!editingEmail ? (
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmail(true);
                      setNewEmail(user?.email || '');
                      setEmailError('');
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="Enter new email address"
                    className={`w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      emailError 
                        ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                  {emailError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {emailError}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleEmailChange}
                      disabled={saving}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                    >
                      {saving ? 'Updating...' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEmail(false);
                        setNewEmail('');
                        setEmailError('');
                      }}
                      disabled={saving}
                      className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">Click "Change" to update your email address</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                {...register('phone', {
                  onChange: () => setHasChanges(true)
                })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Bio</label>
              <textarea
                {...register('bio', {
                  onChange: () => setHasChanges(true)
                })}
                rows={3}
                placeholder="Write a brief professional bio about yourself..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">This will be visible to employers</p>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
              <input
                type="text"
                {...register('skills', {
                  onChange: () => setHasChanges(true)
                })}
                placeholder="JavaScript, React, Node.js, TypeScript (comma separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500">Separate skills with commas</p>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Work Experience</label>
              <textarea
                {...register('experience', {
                  onChange: () => setHasChanges(true)
                })}
                rows={4}
                placeholder="Describe your work experience, roles, and achievements..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
              <textarea
                {...register('education', {
                  onChange: () => setHasChanges(true)
                })}
                rows={3}
                placeholder="Your educational background, degrees, certifications..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  saving || !hasChanges
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl active:scale-95'
                }`}
              >
                {saving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* Info Text */}
            {!hasChanges && (
              <p className="text-center text-sm text-gray-500 pt-2">Make changes to enable the save button</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
