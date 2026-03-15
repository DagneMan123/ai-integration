import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { companyAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';
import { 
  Building2, 
  Globe, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Camera, 
  Save,
  Factory
} from 'lucide-react';

interface CompanyFormData {
  name: string;
  industry: string;
  description: string;
  website: string;
  address: string;
}

const EmployerProfile: React.FC = () => {
  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<CompanyFormData>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    try {
      const response = await companyAPI.getMyCompany();
      const data = response.data.data;
      setCompany(data);
      setValue('name', data.name || '');
      setValue('industry', data.industry || '');
      setValue('description', data.description || '');
      setValue('website', data.website || '');
      setValue('address', data.address || '');
      if (data.logo) setLogoPreview(data.logo);
    } catch (error) {
      toast.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const onSubmit = async (data: CompanyFormData) => {
    setSaving(true);
    try {
      await companyAPI.updateCompany(data);
      toast.success('Company profile updated!');
    } catch (error: any) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('logo', file);
      await companyAPI.uploadLogo(formData);
      toast.success('Logo updated successfully');
    } catch (error: any) {
      toast.error('Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header & Verification */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Company Profile</h1>
            <p className="text-gray-500 font-medium">Manage your organization's identity and public presence.</p>
          </div>
          {company?.isVerified && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-500">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Verified Organization</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Logo & Branding Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-300">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-gray-300" />
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white cursor-pointer hover:bg-blue-700 transition-all active:scale-90">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-black text-gray-900 mb-2">Company Branding</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-md">
                This logo will be displayed on all your job postings and candidate interview sessions. Use a high-resolution PNG or JPG.
              </p>
            </div>
          </div>

          {/* Form Content - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Main Details */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-10 space-y-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Organization Identity</h3>
                
                <InputField label="Company Name *" error={errors.name?.message}>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input {...register('name', { required: 'Required' })} className="form-input-pro pl-12" placeholder="e.g. Abyssinia Tech" />
                  </div>
                </InputField>

                <InputField label="Industry *" error={errors.industry?.message}>
                  <div className="relative">
                    <Factory className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <select {...register('industry', { required: 'Required' })} className="form-input-pro pl-12 appearance-none bg-white">
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                </InputField>

                <InputField label="Company Mission & Description">
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                    <textarea {...register('description')} rows={6} className="form-input-pro pl-12 resize-none leading-relaxed" placeholder="Our mission is to..." />
                  </div>
                </InputField>
              </div>
            </div>

            {/* Right: Presence & Contact */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Digital Presence</h3>
                
                <InputField label="Website">
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input {...register('website')} className="form-input-pro pl-12" placeholder="https://..." />
                  </div>
                </InputField>

                <InputField label="Headquarters">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input {...register('address')} className="form-input-pro pl-12" placeholder="Addis Ababa, ET" />
                  </div>
                </InputField>

                <div className="pt-4">
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-50">
                    <p className="text-[11px] text-blue-700 font-bold leading-relaxed uppercase">
                      Tip: Companies with complete profiles get 40% more applications.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={saving || !isDirty}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
              >
                {saving ? (
                  <div className="w-5 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Save className="w-5 h-5" /> Save Profile</>
                )}
              </button>
              {!isDirty && (
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">No changes detected</p>
              )}
            </div>
          </div>
        </form>
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
  );
};

/* --- Helper Component --- */
const InputField = ({ label, subLabel, error, children }: any) => (
  <div className="space-y-1.5 w-full">
    <div className="flex justify-between items-end ml-1">
      <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">{label}</label>
      {subLabel && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{subLabel}</span>}
    </div>
    {children}
    {error && <p className="text-xs font-bold text-red-500 ml-1">{error}</p>}
  </div>
);

export default EmployerProfile;