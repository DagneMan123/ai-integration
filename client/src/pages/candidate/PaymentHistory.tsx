import React, { useState, useEffect } from 'react';
import {
  Download,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import api from '../../utils/api';

interface Transaction {
  id: number;
  txRef: string;
  amount: number;
  creditAmount: number;
  status: string;
  paymentMethod: string;
  paidAt: string;
  createdAt: string;
}

interface Analytics {
  totalSpent: number;
  successfulTransactions: number;
  averageValue: number;
  creditsRemaining: number;
}

const PaymentHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics
      const analyticsRes = await api.get('/payments/analytics');
      setAnalytics(analyticsRes.data.data || analyticsRes.data);

      // Fetch transactions
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter })
      });

      const historyRes = await api.get(`/payments/history?${params}`);
      setTransactions(historyRes.data.data || []);
      setTotalPages(historyRes.data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load payment history');
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/payments/export?format=csv', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payment_history_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setError('Failed to export payment history');
      console.error('Error exporting:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return 'text-emerald-600 bg-emerald-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return <CheckCircle size={16} />;
      case 'FAILED':
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Payment History</h1>
              <p className="text-slate-600 mt-1">Manage your subscriptions and transaction records</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-600 hover:text-red-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Spent */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600">Total Spent</p>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(analytics.totalSpent)}
              </p>
              <p className="text-xs text-slate-500 mt-2">All successful payments</p>
            </div>

            {/* Successful Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600">Successful Transactions</p>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle size={20} className="text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {analytics.successfulTransactions}
              </p>
              <p className="text-xs text-slate-500 mt-2">Completed payments</p>
            </div>

            {/* Average Value */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600">Average Value</p>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp size={20} className="text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(analytics.averageValue)}
              </p>
              <p className="text-xs text-slate-500 mt-2">Per transaction</p>
            </div>

            {/* Credits Remaining */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600">Credits Remaining</p>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp size={20} className="text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {analytics.creditsRemaining.toFixed(0)}
              </p>
              <p className="text-xs text-slate-500 mt-2">Available credits</p>
            </div>
          </div>
        )}

        {/* Recent Activities Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Activities</h2>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Filter size={16} />
                Filter
                <ChevronDown size={16} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setFilterOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      statusFilter === '' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    All Transactions
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('COMPLETED');
                      setFilterOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      statusFilter === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('FAILED');
                      setFilterOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      statusFilter === 'FAILED' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Failed
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('PENDING');
                      setFilterOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      statusFilter === 'PENDING' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader size={32} className="animate-spin text-indigo-600" />
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-900">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            {formatDate(tx.paidAt || tx.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-600">{tx.txRef}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                          {tx.creditAmount} credits
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                          {tx.paymentMethod}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${getStatusColor(tx.status)}`}>
                            {getStatusIcon(tx.status)}
                            <span className="font-medium capitalize">{tx.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <AlertCircle size={32} className="text-slate-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No transactions yet</h3>
              <p className="text-slate-600">Your payment history will appear here once you make a purchase.</p>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <CheckCircle size={20} className="text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">🔒 Secure Payments</h4>
            <p className="text-sm text-blue-800">
              All transactions are encrypted and processed securely through Chapa. Your payment information is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
