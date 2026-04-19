import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth, setIsLoading } = useAuthStore();
  const navigate = useNavigate();

  // HARDCODED STOP: Kill the redirect loop - nuke ALL stale data immediately
  useEffect(() => {
    console.log('[Login Page] HARDCODED STOP - Nuking all stale data');
    localStorage.clear();
    sessionStorage.clear();
    console.log('[Login Page] All storage cleared');
  }, []); // Empty dependency array - runs once on mount

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await authAPI.login(data);
      const { user, token, refreshToken } = response.data;
      
      if (!user || !token) throw new Error('Invalid response');
      
      setAuth(user, token, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      
      // Redirect immediately without waiting for loading state
      setTimeout(() => {
        navigate(`/${user.role}/dashboard`, { replace: true });
      }, 300);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50/50">
      <div className="w-full max-w-md">
        {/* Logo/Branding Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">SimuAI</h1>
          <p className="text-gray-500 mt-2 font-medium">Sign in to manage your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Enter a valid email address'
                    }
                  })}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all duration-200
                    ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password', { required: 'Password is required' })}
                  className={`w-full pl-11 pr-12 py-3 border rounded-xl outline-none transition-all duration-200
                    ${errors.password ? 'border-red-500 bg-red-50 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
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
              {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center before:flex-1 before:border-t before:border-gray-100 after:flex-1 after:border-t after:border-gray-100">
            <span className="mx-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Or continue with</span>
          </div>

          {/* Registration Link */}
          <p className="text-center text-gray-500 font-medium">
            New to SimuAI?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 hover:underline underline-offset-4 transition-all">
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-8 text-xs text-gray-400 font-medium italic">
          &copy; {new Date().getFullYear()} SimuAI. All rights reserved. Secure Cloud Access.
        </p>
      </div>
    </div>
  );
};

export default Login;