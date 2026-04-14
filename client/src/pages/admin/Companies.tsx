import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminMenu } from '../../config/menuConfig';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  MoreVertical,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import Loading from '../../components/Loading';

interface Company {
  id: string;
  name: string;
  sector: string;
  email: string;
  status: 'pending' | 'verified' | 'rejected';
  dateRequested: string;
  documentUrl?: string;
}

const AdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/admin/companies');
        const data = response.data?.data || [];
        
        const formattedCompanies = data.map((company: any) => ({
          id: company.id,
          name: company.name,
          sector: company.industry || 'N/A',
          email: company.email,
          status: company.isVerified ? 'verified' : 'pending',
          dateRequested: new Date(company.createdAt).toLocaleDateString(),
          documentUrl: company.registrationDocument
        }));
        
        setCompanies(formattedCompanies);
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <DashboardLayout menuItems={adminMenu} role="admin">
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Organization Audit</h1>
          <p className="text-slate-500 font-medium">Verify and manage company credentials and platform access</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search organizations..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {loading && <Loading />}

      {!loading && !error && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Requests</p>
                <h4 className="text-2xl font-black text-slate-900">
                  {companies.filter((c: any) => c.status === 'pending').length}
                </h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Partners</p>
                <h4 className="text-2xl font-black text-slate-900">
                  {companies.filter((c: any) => c.status === 'verified').length}
                </h4>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg flex items-center gap-4">
              <div className="p-3 bg-white/10 text-white rounded-2xl">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Accounts</p>
                <h4 className="text-2xl font-black">{companies.length}</h4>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Recent Verification Requests</h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Live Update</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {companies.filter(c => 
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-8 text-center text-slate-500">
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    companies.filter(c => 
                      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((company: any) => (
                      <tr key={company.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                              {company.name ? company.name.charAt(0) : '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{company.name || 'N/A'}</p>
                              <p className="text-xs text-slate-500 font-medium">{company.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {company.sector || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(company.status)}`}>
                            {company.status === 'verified' && <CheckCircle2 size={12} />}
                            {company.status === 'rejected' && <XCircle size={12} />}
                            {company.status || 'pending'}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                            <FileText size={16} />
                            {company.documentUrl || 'No document'}
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {company.status === 'pending' && (
                              <>
                                <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Approve">
                                  <CheckCircle2 size={18} />
                                </button>
                                <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Reject">
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer info */}
            <div className="p-6 bg-slate-50/30 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 italic">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-medium tracking-wide">
                  All organization data is encrypted and compliant with international privacy standards (GDPR/NDPR).
                </span>
              </div>
            </div>
          </div>
        </>
      )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCompanies;
