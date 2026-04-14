import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Search, 
  Download, 
  ExternalLink
} from 'lucide-react';
import api from '../../utils/api';
import Loading from '../../components/Loading';

interface Payment {
  id: number;
  txRef: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  description?: string;
}

interface Analytics {
  totalRevenue: number;
  pendingAmount: number;
  completedCount: number;
  failedCount: number;
}

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [paymentsRes, analyticsRes] = await Promise.all([
        api.get('/payments/all'),
        api.get('/admin/payments/analytics')
      ]);

      // Process payments
      let paymentData = paymentsRes.data?.data || [];
      if (!Array.isArray(paymentData)) {
        paymentData = [paymentData];
      }

      const formattedPayments = paymentData
        .filter((p: any) => p && typeof p === 'object')
        .map((p: any) => ({
          id: p.id || p._id,
          txRef: p.txRef || p.id || 'N/A',
          amount: parseFloat(p.amount) || 0,
          status: p.status || 'PENDING',
          method: p.method || 'Unknown',
          createdAt: p.createdAt || new Date().toISOString(),
          user: p.user,
          description: p.description
        }));

      setPayments(formattedPayments);

      // Process analytics
      if (analyticsRes.data?.data) {
        const data = analyticsRes.data.data;
        setAnalytics({
          totalRevenue: parseFloat(data.totalRevenue) || 0,
          pendingAmount: parseFloat(data.pendingAmount) || 0,
          completedCount: data.completedCount || 0,
          failedCount: data.failedCount || 0
        });
      }
    } catch (err: any) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    return payments.filter(payment => {
      const matchesSearch = 
        payment.txRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Monitoring</h1>
            <p className="text-gray-500">Manage transactions and financial health</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Revenue" 
                value={analytics ? formatCurrency(analytics.totalRevenue) : 'ETB 0'} 
                trend={`${payments.length} transactions`}
                isPositive={null}
                icon={<DollarSign className="text-emerald-600" />} 
              />
              <StatCard 
                title="Pending Payments" 
                value={analytics ? formatCurrency(analytics.pendingAmount) : 'ETB 0'} 
                trend={`${payments.filter(p => p.status === 'PENDING').length} pending`}
                isPositive={null}
                icon={<CreditCard className="text-blue-600" />} 
              />
              <StatCard 
                title="Successful Trans." 
                value={analytics?.completedCount || 0} 
                trend={`${((analytics?.completedCount || 0) / (payments.length || 1) * 100).toFixed(0)}%`}
                isPositive={true}
                icon={<ArrowUpRight className="text-green-600" />} 
              />
              <StatCard 
                title="Failed Attempts" 
                value={analytics?.failedCount || 0} 
                trend={`${((analytics?.failedCount || 0) / (payments.length || 1) * 100).toFixed(0)}%`}
                isPositive={false}
                icon={<ArrowDownLeft className="text-red-600" />} 
              />
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-t-xl border-x border-t border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by Transaction ID or User..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                >
                  <option value="all">All Methods</option>
                  <option value="Chapa">Chapa</option>
                  <option value="TeleBirr">TeleBirr</option>
                  <option value="CBE Birr">CBE Birr</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Transaction ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {getFilteredPayments().length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    getFilteredPayments().map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-blue-600">{payment.txRef}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-400">{payment.user?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(payment.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, trend, isPositive, icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      {isPositive !== null && (
        <span className={`text-xs font-bold px-2 py-1 rounded ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {trend}
        </span>
      )}
      {isPositive === null && <span className="text-xs text-gray-400 font-medium">{trend}</span>}
    </div>
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
  </div>
);

export default AdminPayments;