import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../../utils/api';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader,
  ArrowRight,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const InterviewPayment: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CREDITS_REQUIRED = 1;
  const COST_ETB = 5; // 1 credit = 5 ETB

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch interview details
        const interviewRes = await api.get(`/interviews/${interviewId}`);
        setInterview(interviewRes.data.data || interviewRes.data);

        // Fetch wallet balance
        const walletRes = await api.get('/wallet/balance');
        setWallet(walletRes.data.data || walletRes.data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('Failed to load interview details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [interviewId]);

  const handleInitiatePayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Store interview ID for post-payment redirect
      localStorage.setItem('pendingInterviewId', interviewId || '');

      // Initialize payment for 1 credit
      const response = await paymentAPI.initialize({
        amount: COST_ETB,
        creditAmount: CREDITS_REQUIRED,
        type: 'interview',
        description: `Payment for AI Interview Session`
      });

      if (response.data?.data?.checkout_url) {
        setPaymentInitialized(true);
        // Redirect to Chapa payment gateway
        window.location.href = response.data.data.checkout_url;
      } else {
        setError('Failed to initialize payment');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Failed to initialize payment');
      toast.error('Payment initialization failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipPayment = () => {
    // If user has sufficient credits, skip to interview
    if (wallet?.balance >= CREDITS_REQUIRED) {
      navigate(`/candidate/interview/${interviewId}`);
    } else {
      setError('Insufficient credits. Please complete payment.');
    }
  };

  if (loading) return <Loading />;

  const hasSufficientCredits = wallet?.balance >= CREDITS_REQUIRED;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
            <CreditCard className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Ready to Start Your Interview?
          </h1>
          <p className="text-gray-600 font-medium">
            Complete payment to begin your AI-powered interview session
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          
          {/* Interview Details */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Interview Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Interview ID</span>
                <span className="font-mono text-sm font-bold text-gray-900">{interviewId?.slice(0, 8)}...</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Interview Type</span>
                <span className="font-bold text-gray-900">{interview?.interviewMode || 'AI Evaluation'}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-indigo-900 font-medium">Credits Required</span>
                <span className="font-bold text-indigo-600">{CREDITS_REQUIRED} Credit</span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Credits to Purchase</span>
                <span className="font-bold text-gray-900">{CREDITS_REQUIRED}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Rate per Credit</span>
                <span className="font-bold text-gray-900">{COST_ETB} ETB</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-black text-indigo-600">{COST_ETB} ETB</span>
              </div>
            </div>

            {/* Current Balance */}
            <div className={`p-4 rounded-xl border-2 ${
              hasSufficientCredits 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  hasSufficientCredits ? 'text-emerald-900' : 'text-amber-900'
                }`}>
                  Current Balance
                </span>
                <span className={`text-xl font-black ${
                  hasSufficientCredits ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {wallet?.balance || 0} Credits
                </span>
              </div>
              {hasSufficientCredits && (
                <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  You have sufficient credits to start the interview
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">What's Included</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">AI-Powered Evaluation</p>
                  <p className="text-sm text-gray-600">Real-time feedback and scoring</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Secure Session</p>
                  <p className="text-sm text-gray-600">Anti-cheat monitoring included</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Instant Results</p>
                  <p className="text-sm text-gray-600">Get your score immediately after completion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white space-y-3">
            {hasSufficientCredits ? (
              <>
                <button
                  onClick={handleSkipPayment}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Start Interview Now
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 font-medium">
                  You have enough credits to start immediately
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={handleInitiatePayment}
                  disabled={processing || paymentInitialized}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing || paymentInitialized ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {paymentInitialized ? 'Redirecting to Payment...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {COST_ETB} ETB to Start
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 font-medium">
                  Secure payment powered by Chapa
                </p>
              </>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">
            🔒 Your payment is secure and encrypted. No charges will be made until you confirm.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPayment;
