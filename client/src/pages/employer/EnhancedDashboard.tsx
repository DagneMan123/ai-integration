import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ApplicantsList } from '../../components/ApplicantsList';
import { VideoResumeViewer } from '../../components/VideoResumeViewer';
import { X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { employerMenu } from '../../config/menuConfig';

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  return (
    <DashboardLayout menuItems={employerMenu} role="employer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Talent Discovery</h1>
          <p className="text-gray-600">Find and evaluate top candidates sorted by AI interview scores</p>
        </div>

        {/* Job Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select a Job to View Applicants
          </label>
          <input
            type="number"
            placeholder="Enter Job ID"
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applicants List */}
          <div className="lg:col-span-1">
            {selectedJobId ? (
              <ApplicantsList jobId={selectedJobId} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">Select a job to view applicants</p>
              </div>
            )}
          </div>

          {/* Video & Resume Viewer */}
          <div className="lg:col-span-2">
            {selectedApplicantId ? (
              <div className="relative">
                <button
                  onClick={() => setSelectedApplicantId(null)}
                  className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                <VideoResumeViewer
                  applicantId={selectedApplicantId}
                  onClose={() => setSelectedApplicantId(null)}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Select an applicant to view their video interview and resume
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedDashboard;
