import React, { useState } from 'react';
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

// Mock Data for Verification Requests
const MOCK_COMPANIES = [
  {
    id: '1',
    name: 'TechFlow Solutions',
    sector: 'Software Development',
    email: 'hr@techflow.io',
    status: 'pending',
    dateRequested: '2023-10-24',
    documentUrl: '#'
  },
  {
    id: '2',
    name: 'Global Finance Corp',
    sector: 'Banking & Finance',
    email: 'admin@gfc.com',
    status: 'verified',
    dateRequested: '2023-10-20',
    documentUrl: '#'
  },
  {
    id: '3',
    name: 'Apex Marketing',
    sector: 'Digital Advertising',
    email: 'verify@apex.com',
    status: 'rejected',
    dateRequested: '2023-10-18',
    documentUrl: '#'
  }
];

const AdminCompanies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Requests</p>
            <h4 className="text-2xl font-black text-slate-900">12</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Partners</p>
            <h4 className="text-2xl font-black text-slate-900">842</h4>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg flex items-center gap-4">
          <div className="p-3 bg-white/10 text-white rounded-2xl">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Accounts</p>
            <h4 className="text-2xl font-black">864</h4>
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
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry/Sector</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_COMPANIES.map((company) => (
                <tr key={company.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{company.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {company.sector}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusStyle(company.status)}`}>
                      {company.status === 'verified' && <CheckCircle2 size={12} />}
                      {company.status === 'rejected' && <XCircle size={12} />}
                      {company.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                      <FileText size={16} />
                      License_Doc.pdf
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
              ))}
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
    </div>
  );
};

export default AdminCompanies;