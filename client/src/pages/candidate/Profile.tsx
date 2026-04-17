import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { userAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import { 
  User, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Settings, 
  Camera,
  Save,
  Info,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

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
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'account'>('personal');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ፕሮፋይሉ ምን ያህል እንደተሞላ ለመቁጠር (UX)
  const watchedFields = watch();
  const calculateCompletion = () => {
    const fields = ['firstName', 'lastName', 'phone', 'skills', 'experience', 'education', 'bio'];
    const filled = fields.filter(f => !!(watchedFields as any)[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      const u = response.data.data;
      setValue('firstName', u.firstName || '');
      setValue('lastName', u.lastName || '');
      setValue('phone', u.phone || '');
      setValue('skills', u.skills || '');
      setValue('experience', u.experience || '');
      setValue('education', u.education || '');
      setValue('bio', u.bio || '');
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Real-time sync across all form fields
  useEffect(() => {
    const subscription = watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      await userAPI.updateProfile(data);
      updateUser(data);
      setLastSaved(new Date());
      toast.success('Profile updated successfully!');
      setHasChanges(false);
      await fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Only PNG and JPG files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      console.log('FormData created, sending to server...');
      const response = await userAPI.uploadAvatar(formData) as any;
      console.log('Upload response:', response);
      
      toast.success('Profile photo updated successfully!');
      
      // Update the user in auth store with new avatar
      const avatarUrl = response.data?.data?.avatarUrl;
      if (avatarUrl) {
        updateUser({ ...user, profilePicture: avatarUrl });
        setPhotoPreview(null);
      }
      
      // Refresh profile to ensure everything is synced
      await fetchProfile();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header with Progress */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
            <p className="text-gray-600 font-medium mt-2">Keep your professional information up to date</p>
            {lastSaved && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Last saved {new Date(lastSaved).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="w-full md:w-72 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
              <span>Profile Completion</span>
              <span className="text-blue-600 text-lg">{calculateCompletion()}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500" style={{ width: `${calculateCompletion()}%` }} />
            </div>
            <p className="text-[11px] text-gray-500 mt-3 font-medium">
              {calculateCompletion() === 100 ? '✓ Profile complete!' : `${100 - calculateCompletion()} fields remaining`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-3 space-y-2">
            <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon={<User className="w-4 h-4" />} label="Personal Info" />
            <TabButton active={activeTab === 'professional'} onClick={() => setActiveTab('professional')} icon={<Briefcase className="w-4 h-4" />} label="Professional" />
            <TabButton active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<Settings className="w-4 h-4" />} label="Account & Email" />
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-9">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-10">
              
              {activeTab === 'personal' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="relative group">
                      <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-600 border-2 border-dashed border-blue-300 group-hover:bg-blue-50 transition-colors overflow-hidden shadow-sm">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : user?.profilePicture ? (
                          <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12" />
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute -bottom-2 -right-2 p-3 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-all hover:shadow-xl"
                      >
                        {uploadingPhoto ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">Profile Photo</h3>
                      <p className="text-sm text-gray-600 mt-1">Upload a professional photo</p>
                      <p className="text-xs text-gray-500 font-medium mt-2">{uploadingPhoto ? '⏳ Uploading...' : '✓ PNG, JPG up to 5MB'}</p>
                      <div className="mt-3 flex gap-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg">Recommended: 400x400px</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField label="First Name" error={errors.firstName?.message}>
                      <input {...register('firstName', { required: 'Required' })} onChange={() => setHasChanges(true)} className="form-input-pro" placeholder="John" />
                    </InputField>
                    <InputField label="Last Name" error={errors.lastName?.message}>
                      <input {...register('lastName', { required: 'Required' })} onChange={() => setHasChanges(true)} className="form-input-pro" placeholder="Doe" />
                    </InputField>
                  </div>

                  <InputField label="Phone Number">
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <input {...register('phone')} onChange={() => setHasChanges(true)} className="form-input-pro pl-12" placeholder="+251 9..." />
                    </div>
                  </InputField>

                  <InputField label="About / Bio">
                    <textarea {...register('bio')} onChange={() => setHasChanges(true)} rows={4} className="form-input-pro resize-none" placeholder="Tell us about yourself..." />
                  </InputField>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <InputField label="Core Skills" subLabel="Separate with commas">
                    <div className="relative">
                      <Code className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <input {...register('skills')} onChange={() => setHasChanges(true)} className="form-input-pro pl-12" placeholder="React, Node.js, Python..." />
                    </div>
                  </InputField>

                  <InputField label="Work Experience">
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      <textarea {...register('experience')} onChange={() => setHasChanges(true)} rows={5} className="form-input-pro pl-12 resize-none" placeholder="Detail your past roles..." />
                    </div>
                  </InputField>

                  <InputField label="Education">
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      <textarea {...register('education')} onChange={() => setHasChanges(true)} rows={3} className="form-input-pro pl-12 resize-none" placeholder="Degrees and certifications..." />
                    </div>
                  </InputField>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-50 flex gap-4">
                      <Info className="w-5 h-5 text-blue-500 mt-1" />
                      <p className="text-sm text-blue-900 font-medium leading-relaxed">
                        To update your secure login email, click the "Request Change" button. A verification link will be sent to the new address.
                      </p>
                   </div>
                   <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <InputField label="Current Login Email">
                          <input value={user?.email || ''} disabled className="form-input-pro bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed" />
                        </InputField>
                      </div>
                      <button type="button" className="px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">Request Change</button>
                   </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasChanges ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <p className="text-sm font-bold text-amber-600">You have unsaved changes</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-bold text-green-600">Everything is up to date</p>
                    </>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .form-input-pro {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.875rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1f2937;
          transition: all 0.2s;
          outline: none;
          background-color: #ffffff;
        }
        .form-input-pro:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          background-color: #fff;
        }
        .form-input-pro::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
        .form-input-pro:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
    </DashboardLayout>
  );
};

/* --- Helper Components --- */

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all duration-200 ${
      active 
        ? 'bg-white text-blue-600 shadow-md border border-blue-200' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const InputField = ({ label, subLabel, error, children }: any) => (
  <div className="space-y-2 w-full">
    <div className="flex justify-between items-end">
      <label className="text-sm font-bold text-gray-800">{label}</label>
      {subLabel && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{subLabel}</span>}
    </div>
    {children}
    {error && (
      <div className="flex items-center gap-1 text-xs font-bold text-red-600 mt-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </div>
    )}
  </div>
);

export default CandidateProfile;