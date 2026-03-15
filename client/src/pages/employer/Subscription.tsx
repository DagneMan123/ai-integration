import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  color: 'blue' | 'indigo' | 'purple';
  isPopular?: boolean;
  description: string;
}

const EmployerSubscription: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Starter Plan',
      price: 999,
      description: 'Perfect for small startups and local businesses.',
      features: ['10 Job Postings', '100 AI Interview Credits', 'Basic Candidate Analytics', 'Email Support'],
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 2999,
      description: 'Scale your hiring with unlimited power and AI.',
      features: ['Unlimited Job Postings', '500 AI Interview Credits', 'Advanced Matching Analytics', 'Priority 24/7 Support', 'Custom Branding'],
      color: 'indigo',
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 0,
      description: 'Custom solutions for large scale organizations.',
      features: ['Everything in Pro', 'Unlimited AI Credits', 'Dedicated Account Manager', 'API Access', 'Custom AI Prompting'],
      color: 'purple'
    }
  ];

  useEffect(() => { fetchSubscription(); }, []);

  const fetchSubscription = async () => {
    try {
      const response = await paymentAPI.getSubscription();
      setSubscription(response.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === 'enterprise') {
      toast.success('Our sales team will contact you shortly!');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentAPI.initializePayment({
        amount: plan.price,
        type: 'subscription',
        description: `${plan.name} - Monthly Subscription`
      });

      if (response.data.success && response.data.data.checkoutUrl) {
        const txRef = response.data.data.txRef;
        if (txRef) {
          localStorage.setItem('pendingPaymentTxRef', txRef);
          localStorage.setItem('pendingPaymentTime', Date.now().toString());
        }
        window.location.href = response.data.data.checkoutUrl;
      }
    } catch (error: any) {
      toast.error('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSubscription) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Credit Balance */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscription & Plans</h1>
            <p className="text-gray-500 font-medium mt-2">Empower your HR team with AI-driven recruitment.</p>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                   <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Credits</p>
                   <p className="text-xl font-black text-gray-900">{subscription?.credits || 0} AI Units</p>
                </div>
             </div>
             <button className="text-xs font-bold text-blue-600 hover:underline">Top up</button>
          </div>
        </div>

        {/* Current Active Plan Banner */}
        {subscription?.plan && subscription.plan !== 'free' && (
          <div className="mb-12 bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <ShieldCheck className="absolute -right-6 -top-6 w-48 h-48 opacity-10" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div className="text-center md:text-left">
                <span className="px-4 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Active Subscription</span>
                <h2 className="text-3xl font-black mt-2 capitalize">{subscription.plan} Member</h2>
                <p className="text-indigo-100 mt-1 font-medium italic text-sm">Next billing date: {new Date(subscription.endDate).toLocaleDateString()}</p>
              </div>
              <button className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
                Manage Billing
              </button>
            </div>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              isCurrent={subscription?.plan === plan.id}
              loading={loading}
              onSubscribe={() => handleSubscribe(plan)}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900">Common Questions</h2>
            <p className="text-gray-500 font-medium mt-2">Everything you need to know about SimuAI billing.</p>
          </div>
          
          <FAQItem 
            question="Can I upgrade or downgrade anytime?" 
            answer="Yes, your subscription is flexible. When you upgrade, you'll get immediate access to new features. Downgrades take effect at the end of your billing cycle."
          />
          <FAQItem 
            question="What are AI Interview Credits?" 
            answer="Each credit allows SimuAI to generate, proctor, and evaluate one candidate interview session using our advanced neural models."
          />
          <div className="pt-10 flex flex-col items-center gap-4">
             <div className="flex items-center gap-4 grayscale opacity-50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secure Payments via</span>
                <img src="/chapa-logo.png" alt="Chapa" className="h-4" />
                <img src="/telebirr-logo.png" alt="Telebirr" className="h-5" />
             </div>
             <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> Encrypted, secure transaction processing.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

/* --- Sub-Components --- */

const PlanCard = ({ plan, isCurrent, loading, onSubscribe }: any) => {
  const isIndigo = plan.color === 'indigo';

  return (
    <div className={`relative bg-white rounded-[2.5rem] border p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 flex flex-col ${
      plan.isPopular ? 'border-indigo-600 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' : 'border-gray-100'
    }`}>
      {plan.isPopular && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
          Most Popular
        </span>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-xs text-gray-400 font-medium leading-relaxed">{plan.description}</p>
      </div>

      <div className="mb-8">
        {plan.price > 0 ? (
          <div className="flex items-end gap-1">
            <span className="text-sm font-bold text-gray-400 mb-2">ETB</span>
            <span className="text-4xl font-black text-gray-900">{plan.price.toLocaleString()}</span>
            <span className="text-sm font-bold text-gray-400 mb-2">/mo</span>
          </div>
        ) : (
          <span className="text-3xl font-black text-gray-900">Custom</span>
        )}
      </div>

      <div className="space-y-4 mb-10 flex-1">
        {plan.features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isIndigo ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
              <Check className="w-2.5 h-2.5 stroke-[4px]" />
            </div>
            <span className="text-sm font-semibold text-gray-600">{f}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onSubscribe}
        disabled={loading || isCurrent}
        className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
          isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
          isIndigo ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700' : 
          'bg-gray-900 text-white hover:bg-black'
        }`}
      >
        {isCurrent ? 'Current Plan' : (
          <>
            {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Plan'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 group cursor-pointer hover:border-blue-200 transition-colors">
    <div className="flex items-center justify-between">
      <h4 className="font-bold text-gray-900">{question}</h4>
      <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-hover:rotate-180" />
    </div>
    <p className="mt-3 text-sm text-gray-500 font-medium leading-relaxed hidden group-hover:block animate-in fade-in slide-in-from-top-2">
      {answer}
    </p>
  </div>
);

export default EmployerSubscription;