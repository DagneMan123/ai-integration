import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  color: string;
}

const EmployerSubscription: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 999,
      features: ['10 Job Postings', '100 AI Credits', 'Basic Analytics'],
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 2999,
      features: ['Unlimited Job Postings', '500 AI Credits', 'Advanced Analytics'],
      color: 'green'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 0,
      features: ['Everything in Pro', 'Unlimited AI Credits', 'Dedicated Support'],
      color: 'purple'
    }
  ];

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await paymentAPI.getSubscription();
      setSubscription(response.data.data);
    } catch (error) {
      console.error('Failed to fetch subscription', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === 'enterprise') {
      toast.success('Please contact our sales team for enterprise plans');
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
        // Redirect to Chapa checkout
        window.location.href = response.data.data.checkoutUrl;
      } else {
        toast.error('Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setLoading(true);
    try {
      await paymentAPI.cancelSubscription();
      toast.success('Subscription cancelled successfully');
      fetchSubscription();
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSubscription) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Credits</h1>
          <p className="text-gray-600">Choose the perfect plan for your business</p>
        </div>

        {/* Current Subscription Status */}
        {subscription && subscription.plan && subscription.plan !== 'free' && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                <p className="text-gray-600 mt-1">
                  You are currently on the <span className="font-semibold capitalize">{subscription.plan}</span> plan
                </p>
                {subscription.endDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Renews on {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const colorClasses = {
              blue: 'border-blue-500 bg-blue-50',
              green: 'border-green-500 bg-green-50',
              purple: 'border-purple-500 bg-purple-50'
            };

            const buttonClasses = {
              blue: 'bg-blue-600 hover:bg-blue-700',
              green: 'bg-green-600 hover:bg-green-700',
              purple: 'bg-purple-600 hover:bg-purple-700'
            };

            const isCurrentPlan = subscription?.plan === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-lg shadow-md p-6 border-t-4 ${colorClasses[plan.color as keyof typeof colorClasses]} transition transform hover:scale-105`}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                
                {plan.price > 0 ? (
                  <p className="text-3xl font-bold text-gray-900 mb-4">
                    ETB {plan.price.toLocaleString()}
                    <span className="text-sm text-gray-600">/month</span>
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mb-4">Custom Pricing</p>
                )}

                <ul className="space-y-2 text-gray-700 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading || isCurrentPlan}
                  className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                    isCurrentPlan
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `${buttonClasses[plan.color as keyof typeof buttonClasses]} disabled:opacity-50`
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major payment methods through Chapa, including bank transfers, mobile money, and card payments.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Yes, you can start with our free plan and upgrade whenever you're ready.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I cancel?</h3>
              <p className="text-gray-600">Your subscription will be cancelled at the end of the current billing period. You'll retain access until then.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerSubscription;
