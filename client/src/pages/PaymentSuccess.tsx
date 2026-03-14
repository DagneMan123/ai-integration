import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying payment & generating AI response...');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Try to get tx_ref from URL first (if Chapa passes it)
        let txRef = searchParams.get('tx_ref');
        
        // If not in URL, get from localStorage (fallback)
        if (!txRef) {
          txRef = localStorage.getItem('pendingPaymentTxRef');
        }

        const chapaStatus = searchParams.get('status');

        if (!txRef) {
          setStatus('error');
          setMessage('No transaction reference found. Please contact support.');
          setLoading(false);
          return;
        }

        // Call backend to verify payment (server-side verification)
        try {
          const response = await paymentAPI.verifyPayment(txRef);

          if (response.data.success) {
            setStatus('success');
            setMessage('Payment verified! Redirecting...');
            toast.success('Payment verified successfully!');
            
            // Clear localStorage
            localStorage.removeItem('pendingPaymentTxRef');
            localStorage.removeItem('pendingPaymentTime');

            // Redirect to appropriate page after 2 seconds
            setTimeout(() => {
              navigate('/employer/subscription');
            }, 2000);
          } else {
            const errorMsg = response.data.message || 'Payment verification failed';
            
            // Check if it's a duplicate payment error
            if (errorMsg.includes('already completed')) {
              setStatus('success');
              setMessage('Payment already processed. Redirecting...');
              toast.success('Payment already completed!');
              localStorage.removeItem('pendingPaymentTxRef');
              localStorage.removeItem('pendingPaymentTime');
              
              setTimeout(() => {
                navigate('/employer/subscription');
              }, 2000);
            } else {
              setStatus('error');
              setMessage(errorMsg);
              toast.error(errorMsg);
            }
          }
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.message;
          
          // Handle session expired - retry with fresh token
          if (errorMsg.includes('Token expired') || errorMsg.includes('expired') || error.response?.status === 401) {
            if (retryCount < 2) {
              setMessage('Session expired, retrying...');
              setRetryCount(retryCount + 1);
              
              // Wait 1 second and retry
              setTimeout(() => {
                verifyPayment();
              }, 1000);
              return;
            } else {
              setStatus('error');
              setMessage('Session expired. Please login again and check your payment status.');
              toast.error('Session expired. Please login again.');
            }
          } else {
            setStatus('error');
            setMessage(errorMsg || 'Payment verification failed');
            toast.error('Payment verification failed');
          }
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please contact support.');
        toast.error('Payment verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-lg text-gray-700">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {status === 'success' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/employer/subscription')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Back to Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
