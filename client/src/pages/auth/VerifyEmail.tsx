import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  ShieldCheck,
  RefreshCcw
} from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Verification ሂደት ትንሽ እንዲታይ 1 ሰከንድ መጠበቅ (UX እንዲሰማው)
        await authAPI.verifyEmail(token!);
        setStatus('success');
        setMessage('Your email has been successfully verified. You can now access all features.');
        
        // ከ 5 ሰከንድ በኋላ በራሱ ወደ ሎጊን እንዲሄድ ማድረግ (አማራጭ)
        // setTimeout(() => navigate('/login'), 5000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'The verification link is invalid or has expired.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-md">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">SimuAI Verification</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 border border-gray-100 text-center">
          
          {status === 'verifying' && (
            <div className="py-8 animate-in fade-in duration-500">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin relative z-10" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email</h2>
              <p className="text-gray-500">Please wait while we secure your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified Successfully!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {message}
              </p>
              <Link 
                to="/login" 
                className="flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 group"
              >
                Go to Login
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {message}
              </p>
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="flex items-center justify-center w-full bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-black transition-all"
                >
                  Back to Login
                </Link>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center w-full gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 py-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Try again
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Support Link */}
        <p className="text-center mt-8 text-sm text-gray-500">
          Having issues? <a href="mailto:support@simuai.com" className="text-blue-600 font-bold hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;