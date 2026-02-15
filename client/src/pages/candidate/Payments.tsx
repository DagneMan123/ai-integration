import React, { useEffect, useState } from 'react';
import { paymentAPI } from '../../utils/api';
import { Payment } from '../../types';
import Loading from '../../components/Loading';
import { FiCreditCard, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const CandidatePayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getPaymentHistory();
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-green-600" />;
      case 'failed':
        return <FiXCircle className="text-red-600" />;
      case 'pending':
        return <FiClock className="text-yellow-600" />;
      default:
        return <FiCreditCard className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <div key={payment._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                      {getStatusIcon(payment.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {payment.description}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Transaction ID: {payment.transactionRef}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      ETB {payment.amount.toFixed(2)}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <FiCreditCard className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No payment history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatePayments;
