import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsAPI, paymentAPI } from '../../utils/api';
import { DashboardData } from '../../types';
import Loading from '../../components/Loading';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import { useDashboardCommunication } from '../../hooks/useDashboardCommunication';
import { useSessionMonitoring } from '../../hooks/useSessionMonitoring';
import { 
  Briefcase,
  Calendar, 
  Trophy, 
  RefreshCw, 
  Search, 
  ArrowRight, 
  UserCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Download,
  CheckCircle,
  Filter,
  ChevronDown
} from 'lucide-react';
import api from '../../utils/api';

const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pendingInterviewId, setPendingInterviewId] = useState<string | null>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Session monitoring
  useSessionMonitoring();

  // Dashboard communication
  useDashboardCommunication('candidate');

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await analyticsAPI.getCandidateDashboard();
      const dashboardData = response.data.data;
      setData(dashboardData);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to sync dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchBillingData = useCallback(async () => {
    try {
      setBillingLoading(true);
      setBillingError(null);
      const walletRes = await api.get('/wallet/balance');
      setWallet(walletRes.data.data || walletRes.data);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        ...(statusFilter && { status: statusFilter })
      });
      const historyRes = await api.get(`/payments/history?${params}`);
      setTransactions(historyRes.data.data || []);
      const analyticsRes = await api.get('/payments/analytics');
      setAnalytics(analyticsRes.data.data || analyticsRes.data);
    } catch (err: any) {
      setBillingError(err.response?.data?.error || 'Failed to load billing data');
      console.error('Error fetching billing data:', err);
    } finally {
      setBillingLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchDashboardData();
    fetchBillingData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchBillingData]);

  // Check for pending interview payment
  useEffect(() => {
    const interviewId = localStorage.getItem('pendingInterviewId');
    const showBilling = localStorage.getItem('showBillingSection');
    
    if (interviewId && showBilling === 'true') {
      setPendingInterviewId(interviewId);
      setShowPaymentPrompt(true);
      localStorage.removeItem('showBillingSection');
    }
  }, []);

  if (loading) return <Loading />;

  // Helper to ensure we show the correct count (handles both number and array responses)
  const getCount = (val: any) => {
    if (Array.isArray(val)) return val.length;
    return val || 0;
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

  const handleExport = async () => {
    try {
      const response = await api.get('/payments/export?format=csv', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `billing_history_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setBillingError('Failed to export transaction history');
      console.error('Error exporting:', err);
    }
  };

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="max-w-6xl mx-auto space-y-10 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back! 👋</h1>
            <p className="text-gray-500 font-medium mt-1">Review your latest interview progress and applications.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-2.5 text-gray-500 hover:text-blue-600 bg-white border border-gray-100 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/jobs"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Search className="w-5 h-5" />
              Explore Jobs
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Applications" 
            value={getCount(data?.applications)} 
            subtitle="Total jobs applied"
            icon={<Briefcase className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <StatCard 
            title="Interviews" 
            value={getCount(data?.interviews)} 
            subtitle="Scheduled sessions"
            icon={<Calendar className="w-6 h-6 text-emerald-600" />}
            color="emerald"
          />
          <StatCard 
            title="Avg Score" 
            value={data?.averageScore ? `${data.averageScore.toFixed(1)}%` : 'N/A'} 
            subtitle="Performance accuracy"
            icon={<Trophy className="w-6 h-6 text-purple-600" />}
            color="purple"
          />
        </div>

        {/* Main Content: Recent Interviews */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Interviews</h2>
              <p className="text-sm text-gray-500 font-medium">Detailed performance history</p>
            </div>
            <Link to="/candidate/interviews" className="text-sm font-bold text-blue-600 hover:underline underline-offset-4">
              Full History
            </Link>
          </div>

          <div className="p-6 md:p-8">
            {data?.recentInterviews && data.recentInterviews.length > 0 ? (
              <div className="grid gap-4">
                {data.recentInterviews.map((interview: any) => (
                  <div key={interview.id} className="group flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-5 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 border border-transparent rounded-2xl transition-all gap-4 md:gap-0">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{interview.jobTitle || 'Role Not Specified'}</h4>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{interview.companyName || 'Private Organization'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-8 justify-between md:justify-end">
                      <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {interview.date && !isNaN(Date.parse(interview.date)) 
                            ? new Date(interview.date).toLocaleDateString() 
                            : 'Pending Date'}
                        </p>
                        <p className="text-xs font-medium text-gray-400">Activity Date</p>
                      </div>
                      
                      {interview.score !== undefined && interview.score !== null && (
                        <div className="w-12 h-12 rounded-full border-4 border-blue-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-black text-blue-600">{interview.score}</span>
                        </div>
                      )}

                      <StatusBadge status={interview.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-200" />
                </div>
                <p className="text-gray-500 font-bold">No active sessions found</p>
                <p className="text-gray-400 text-sm">Apply for a job to start your AI interview.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <ActionCard 
            title="Professional Profile"
            desc="Keep your skills updated to match new job postings."
            link="/candidate/profile"
            icon={<UserCircle className="w-8 h-8 text-blue-600" />}
            btnText="Settings"
          />
          <ActionCard 
            title="Applications Tracker"
            desc="Track the status of all your current job submissions."
            link="/candidate/applications"
            icon={<Briefcase className="w-8 h-8 text-orange-600" />}
            btnText="View List"
          />
        </div>

        {/* Interview Payment Prompt Modal */}
        {showPaymentPrompt && pendingInterviewId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <CreditCard className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Interview</h2>
                <p className="text-gray-600 font-medium">1 credit required to begin</p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Cost</span>
                  <span className="text-2xl font-bold text-indigo-600">5 ETB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Your Balance</span>
                  <span className="text-lg font-bold text-gray-900">{wallet?.balance || 0} Credits</span>
                </div>
              </div>

              <div className="space-y-3">
                {wallet?.balance >= 1 ? (
                  <>
                    <button
                      onClick={() => {
                        setShowPaymentPrompt(false);
                        localStorage.removeItem('pendingInterviewId');
                        navigate(`/candidate/interview/${pendingInterviewId}`);
                      }}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                    >
                      Start Interview Now
                    </button>
                    <p className="text-xs text-center text-gray-500">You have enough credits</p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          setProcessingPayment(true);
                          setBillingError(null);
                          const response = await paymentAPI.initialize({
                            amount: 5,
                            creditAmount: 1,
                            type: 'interview',
                            description: 'Payment for AI Interview Session'
                          });
                          if (response.data?.data?.checkout_url) {
                            localStorage.setItem('pendingInterviewId', pendingInterviewId || '');
                            window.location.href = response.data.data.checkout_url;
                          } else {
                            setBillingError('Failed to initialize payment: No checkout URL received');
                          }
                        } catch (err: any) {
                          const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to initialize payment';
                          setBillingError(errorMessage);
                        } finally {
                          setProcessingPayment(false);
                        }
                      }}
                      disabled={processingPayment}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {processingPayment ? 'Processing...' : 'Pay & Start Interview'}
                    </button>
                    <p className="text-xs text-center text-gray-500">Secure payment via Chapa</p>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowPaymentPrompt(false);
                    localStorage.removeItem('pendingInterviewId');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing & History Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                Billing & History
              </h2>
              <p className="text-sm text-gray-500 font-medium">Manage your credits and payment history</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="p-8">
            {billingLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin">
                  <CreditCard className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            ) : (
              <>
                {/* Wallet Balance & Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Current Balance */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                    <p className="text-xs font-medium text-slate-600 mb-2">Current Balance</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {wallet?.balance || 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Credits available</p>
                  </div>

                  {/* Total Spent */}
                  {analytics && (
                    <>
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                        <p className="text-xs font-medium text-slate-600 mb-2">Total Spent</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(analytics.totalSpent)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">All payments</p>
                      </div>

                      {/* Successful Transactions */}
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <p className="text-xs font-medium text-slate-600 mb-2">Successful</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analytics.successfulTransactions}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Transactions</p>
                      </div>

                      {/* Average Value */}
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <p className="text-xs font-medium text-slate-600 mb-2">Average</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(analytics.averageValue)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Per transaction</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Transaction History */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Transactions</h3>
                    <div className="relative">
                      <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Filter size={16} />
                        Filter
                        <ChevronDown size={16} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {filterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            onClick={() => {
                              setStatusFilter('');
                              setFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              statusFilter === '' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => {
                              setStatusFilter('COMPLETED');
                              setFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              statusFilter === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Completed
                          </button>
                          <button
                            onClick={() => {
                              setStatusFilter('FAILED');
                              setFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              statusFilter === 'FAILED' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Failed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {tx.creditAmount} Credits
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(tx.paidAt || tx.createdAt)}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                tx.status
                              )}`}
                            >
                              {tx.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{tx.paymentMethod}</span>
                            <span className="font-medium">{formatCurrency(tx.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-600 py-8">No transactions yet</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Billing Sidebar - Removed */}
    </DashboardLayout>
  );
};

/* --- UI Sub-Components --- */

const StatCard = ({ title, value, subtitle, icon, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 border-blue-100",
    emerald: "bg-emerald-50 border-emerald-100",
    purple: "bg-purple-50 border-purple-100"
  };
  return (
    <div className={`p-6 rounded-[2rem] border shadow-sm ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>
          <h3 className="text-4xl font-black text-gray-900 mt-2">{value}</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toUpperCase();
  const styles: any = {
    COMPLETED: "bg-emerald-100 text-emerald-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    SCHEDULED: "bg-amber-100 text-amber-700",
    PENDING: "bg-gray-100 text-gray-600",
    REJECTED: "bg-red-100 text-red-700"
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight ${styles[normalizedStatus] || "bg-gray-100 text-gray-500"}`}>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
};

const ActionCard = ({ title, desc, link, icon, btnText }: any) => (
  <Link to={link} className="group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
    <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 font-medium mb-6 leading-relaxed">{desc}</p>
    <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-wider">
      {btnText}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
    </div>
  </Link>
);

export default CandidateDashboard;