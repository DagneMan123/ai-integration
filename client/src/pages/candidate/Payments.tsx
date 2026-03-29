import React, { useEffect, useState } from 'react';
import { paymentAPI } from '../../utils/api';
import { Payment } from '../../types';
import Loading from '../../components/Loading';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  ArrowUpRight, 
  Receipt,
  Wallet
} from 'lucide-react';

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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string, icon: any, label: string }> = {
      completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Successful' },
      failed: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <XCircle className="w-4 h-4" />, label: 'Failed' },
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="w-4 h-4" />, label: 'Processing' },
      refunded: { color: 'bg-slate-50 text-slate-700 border-slate-100', icon: <ArrowUpRight className="w-4 h-4" />, label: 'Refunded' },
    };
    return configs[status] || { color: 'bg-gray-50 text-gray-700 border-gray-100', icon: <CreditCard className="w-4 h-4" />, label: status };
  };

  // የኢትዮጵያ ብር ፎርማት (ETB)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payment History</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your subscriptions and transaction records</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Summary Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Spent</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {formatCurrency(payments.reduce((acc, curr) => curr.status === 'completed' ? acc + curr.amount : acc, 0))}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Successful</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {payments.filter(p => p.status === 'completed').length} Transactions
            </h3>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Recent Activities</h2>
          </div>

          {payments.length > 0 ? (
            payments.map((payment) => {
              const { color, icon, label } = getStatusConfig(payment.status);
              return (
                <div 
                  key={payment._id} 
                  className="group bg-white rounded-[2rem] border border-gray-100 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Left: Info */}
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${
                        payment.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}>
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {payment.description || 'Premium Service Purchase'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 font-medium">
                          <span className="text-xs font-mono text-gray-400 uppercase">
                            #{String(payment.transactionRef || payment.id || 'N/A').slice(-8)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Action */}
                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border mt-1.5 ${color}`}>
                          {icon}
                          {label}
                        </span>
                      </div>
                      
                      {payment.status === 'completed' && (
                        <button 
                          title="Download Receipt"
                          className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                <CreditCard className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No transactions yet</h2>
              <p className="text-gray-500 font-medium">Your payment history will appear here once you make a purchase.</p>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-12 p-6 bg-blue-50/50 rounded-3xl border border-blue-50 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Secure Payments</h4>
            <p className="text-xs text-gray-500 font-medium">All transactions are encrypted and processed securely via industry-standard payment gateways.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePayments;