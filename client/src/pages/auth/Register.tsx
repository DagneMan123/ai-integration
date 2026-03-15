import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  User, 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  UserCircle,
  Briefcase,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface RegisterFormData {
  role: 'candidate' | 'employer';
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: { role: 'candidate' }
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(data);
      if (response.data.success || response.status === 201) {
        toast.success('Account created! Please login to continue.');
        navigate('/login');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-2xl">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join SimuAI and start your journey</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('role', 'candidate')}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedRole === 'candidate' 
                  ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className={`p-3 rounded-xl ${selectedRole === 'candidate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Candidate</p>
                  <p className="text-xs text-gray-500">I am looking for a job</p>
                </div>
                {selectedRole === 'candidate' && <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto" />}
              </button>

              <button
                type="button"
                onClick={() => setValue('role', 'employer')}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedRole === 'employer' 
                  ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className={`p-3 rounded-xl ${selectedRole === 'employer' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Employer</p>
                  <p className="text-xs text-gray-500">I am hiring talent</p>
                </div>
                {selectedRole === 'employer' && <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('firstName', { required: 'Required' })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <p className="text-xs text-red-500 ml-1 font-medium">{errors.firstName.message}</p>}
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('lastName', { required: 'Required' })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && <p className="text-xs text-red-500 ml-1 font-medium">{errors.lastName.message}</p>}
              </div>
            </div>

            {selectedRole === 'employer' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('companyName', { required: selectedRole === 'employer' ? 'Company name is required' : false })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                    placeholder="Abyssinia Tech"
                  />
                </div>
                {errors.companyName && <p className="text-xs text-red-500 ml-1 font-medium">{errors.companyName.message}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { 
                    required: 'Password is required',
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Must include uppercase, lowercase & number'
                    }
                  })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>
              ) : (
                <p className="text-[10px] text-gray-400 ml-1 italic font-medium">Use 6+ characters with a mix of letters & numbers.</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.99] transition-all shadow-lg shadow-blue-100 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : 'Create My Account'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-50 pt-8">
            <p className="text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;