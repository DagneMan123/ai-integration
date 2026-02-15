import React from 'react';

const EmployerSubscription: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription & Credits</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Plan</h3>
            <p className="text-3xl font-bold text-primary mb-4">ETB 999/mo</p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ 10 Job Postings</li>
              <li>✓ 100 AI Credits</li>
              <li>✓ Basic Analytics</li>
            </ul>
            <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition">
              Subscribe
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
            <p className="text-3xl font-bold text-primary mb-4">ETB 2,999/mo</p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ Unlimited Job Postings</li>
              <li>✓ 500 AI Credits</li>
              <li>✓ Advanced Analytics</li>
            </ul>
            <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition">
              Subscribe
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p className="text-3xl font-bold text-primary mb-4">Custom</p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ Everything in Pro</li>
              <li>✓ Unlimited AI Credits</li>
              <li>✓ Dedicated Support</li>
            </ul>
            <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerSubscription;
