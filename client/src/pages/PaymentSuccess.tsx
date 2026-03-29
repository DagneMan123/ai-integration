import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../utils/api';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  Loader2,
  RefreshCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Securing your transaction...');
  const [countdown, setCountdown] = useState(5);
  const [txDetails, setTxDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      let txRef = searchParams.get('tx_ref') || localStorage.getItem('pendingPaymentTxRef');
      const interviewId = localStorage.getItem('pendingInterviewId');

      if (!txRef) {
        setStatus('error');
        setMessage('Transaction reference missing. Please contact SimuAI support.');
        setLoading(false);
        return;
      }

      try {
        const response = await paymentAPI.verifyPayment(txRef);

        if (response.data.success) {
          setTxDetails(response.data.data);
          setStatus('success');
          setMessage(interviewId ? 'Payment successful! Starting your interview...' : 'Your subscription is now active!');
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

          localStorage.removeItem('pendingPaymentTxRef');
          localStorage.removeItem('pendingPaymentTime');

          // Countdown to redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                // If interview ID exists, redirect to interview; otherwise go to subscription
                if (interviewId) {
                  localStorage.removeItem('pendingInterviewId');
                  navigate(`/candidate/interview/${interviewId}`);
                } else {
                  navigate('/employer/subscription');
                }
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || error.message || 'Server connection lost';
        
        // Handle timeout errors specifically
        if (errorMessage.includes('timeout') || error.code === 'ECONNABORTED') {
          setMessage('Payment verification is taking longer than expected. Please wait a moment and try again.');
        } else {
          setMessage(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl animate-pulse"></div>
           <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
        <p className="text-gray-500 font-medium animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        
        {/* Success Card */}
        {status === 'success' ? (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 p-8 md:p-10 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Confirmed!</h2>
            <p className="text-gray-500 font-medium mb-8">{message}</p>

            {/* Transaction Details (Professional Touch) */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-tight">Amount Paid</span>
                  <span className="text-gray-900 font-black">{txDetails?.amount || '...'} ETB</span>
               </div>
               <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="text-gray-400 font-bold uppercase tracking-tight">Ref Number</span>
                  <span className="text-gray-900 font-mono text-xs">{txDetails?.txRef?.slice(0, 15)}...</span>
               </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/employer/subscription')}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 group"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Redirecting in <span className="text-blue-600">{countdown}s</span>
              </p>
            </div>
          </div>
        ) : (
          /* Error Card */
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-rose-900/5 border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-rose-50/50">
              <XCircle className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Incomplete</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">{message}</p>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Verify Again
              </button>
              <button
                onClick={() => navigate('/employer/subscription')}
                className="w-full bg-white border border-gray-200 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                Back to Subscription
              </button>
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="mt-10 flex items-center justify-center gap-2 text-sm font-bold text-gray-400">
           <ShieldCheck className="w-4 h-4 text-emerald-500" />
           <p className="uppercase tracking-tighter">Verified Secure Transaction</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;