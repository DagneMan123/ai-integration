import React from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Search, 
  Download, 
  ExternalLink
} from 'lucide-react';

// የናሙና የክፍያ መረጃዎች
const PAYMENTS = [
  { id: "TXN-9921", employer: "Tikvah Tech", amount: 2500, status: "Completed", method: "Chapa", date: "Oct 24, 2023", type: "Premium Post" },
  { id: "TXN-9922", employer: "Abyssinia Bank", amount: 5000, status: "Pending", method: "TeleBirr", date: "Oct 23, 2023", type: "Featured Employer" },
  { id: "TXN-9923", employer: "Zala Soft", amount: 1200, status: "Failed", method: "CBE Birr", date: "Oct 22, 2023", type: "Standard Post" },
  { id: "TXN-9924", employer: "Hulu Jobs", amount: 3000, status: "Completed", method: "Credit Card", date: "Oct 21, 2023", type: "Bulk Listing" },
];

const AdminPayments: React.FC = () => {
  return (
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

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Revenue" value="ETB 145,200" trend="+12.5%" isPositive={true} icon={<DollarSign className="text-emerald-600" />} />
          <StatCard title="Pending Payments" value="ETB 12,400" trend="5 Transactions" isPositive={null} icon={<CreditCard className="text-blue-600" />} />
          <StatCard title="Successful Trans." value="1,240" trend="+8%" isPositive={true} icon={<ArrowUpRight className="text-green-600" />} />
          <StatCard title="Failed Attempts" value="14" trend="-2%" isPositive={false} icon={<ArrowDownLeft className="text-red-600" />} />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-t-xl border-x border-t border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Transaction ID or Employer..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              <option>All Methods</option>
              <option>Chapa</option>
              <option>TeleBirr</option>
              <option>CBE Birr</option>
            </select>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Employer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PAYMENTS.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-blue-600">{payment.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{payment.employer}</div>
                    <div className="text-xs text-gray-400">{payment.type}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {payment.amount.toLocaleString()} ETB
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${payment.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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