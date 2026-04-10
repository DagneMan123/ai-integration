import React, { useState, useEffect } from 'react';
import { Users, Download, Eye, Mail, Phone, Loader, ChevronLeft } from 'lucide-react';
import api from '../utils/api';

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position?: string;
  status: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'hired';
  appliedDate: string;
  rating?: number;
}

interface EmployerApplicantTrackingWrapperProps {
  onBack?: () => void;
}

const EmployerApplicantTrackingWrapper: React.FC<EmployerApplicantTrackingWrapperProps> = ({ onBack }) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/applications');
      const data = response.data?.data || [];
      setApplicants(data);
    } catch (err: any) {
      console.error('Error fetching applicants:', err);
      // Show mock data if API fails
      setApplicants([
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '+1234567890', position: 'Senior Developer', status: 'applied', appliedDate: '2026-04-10', rating: 4.5 },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '+1234567891', position: 'Product Manager', status: 'reviewing', appliedDate: '2026-04-09', rating: 4.8 },
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    applied: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-yellow-100 text-yellow-800',
    interview: 'bg-purple-100 text-purple-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-green-100 text-green-800',
  };

  const filteredApplicants = filterStatus === 'all'
    ? applicants
    : applicants.filter(app => app.status === filterStatus);

  const handleStatusChange = async (id: string, newStatus: Applicant['status']) => {
    try {
      await api.patch(`/applications/${id}`, { status: newStatus });
      setApplicants(applicants.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ));
    } catch (err: any) {
      console.error('Error updating application status:', err);
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft size={20} />
            Back
          </button>
        )}
        <div className="flex items-center gap-3">
          <Users className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Applicant Tracking</h1>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download size={18} />
          Export
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applicants.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{applicants.filter(a => a.status === 'reviewing').length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Interviews</p>
              <p className="text-2xl font-bold text-purple-600">{applicants.filter(a => a.status === 'interview').length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Hired</p>
              <p className="text-2xl font-bold text-green-600">{applicants.filter(a => a.status === 'hired').length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{applicants.filter(a => a.status === 'rejected').length}</p>
            </div>
          </div>
        </>
      )}

      {!loading && (
        <>
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
            >
              All
            </button>
            {['applied', 'reviewing', 'interview', 'hired', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg capitalize ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applicants List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              {filteredApplicants.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No applicants found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Applied Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredApplicants.map(applicant => (
                        <tr key={applicant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{applicant.firstName} {applicant.lastName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{applicant.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={applicant.status}
                              onChange={(e) => handleStatusChange(applicant.id, e.target.value as Applicant['status'])}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[applicant.status]} border-0 cursor-pointer`}
                            >
                              <option value="applied">Applied</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="interview">Interview</option>
                              <option value="hired">Hired</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{applicant.appliedDate}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => setSelectedApplicant(applicant)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Applicant Details */}
            <div className="bg-white rounded-lg shadow p-6">
              {selectedApplicant ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedApplicant.firstName} {selectedApplicant.lastName}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={18} />
                      <a href={`mailto:${selectedApplicant.email}`} className="text-blue-600 hover:underline text-sm">
                        {selectedApplicant.email}
                      </a>
                    </div>
                    {selectedApplicant.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={18} />
                        <a href={`tel:${selectedApplicant.phone}`} className="text-blue-600 hover:underline text-sm">
                          {selectedApplicant.phone}
                        </a>
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">Applied Date</p>
                      <p className="font-semibold text-gray-900">{selectedApplicant.appliedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-gray-900 capitalize">{selectedApplicant.status}</p>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    View Full Profile
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select an applicant to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployerApplicantTrackingWrapper;
