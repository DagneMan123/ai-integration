import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Download } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { candidateMenu } from '../../config/menuConfig';
import Loading from '../../components/Loading';
import { interviewAPI } from '../../utils/api';

const InterviewHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await interviewAPI.getCandidateInterviews();
      if (response.data.success) {
        let completed = response.data.data?.filter((i: any) => i.status === 'COMPLETED') || [];
        // Deduplicate by jobId to remove redundant records
        completed = Array.from(
          new Map(completed.map((inv: any) => [inv.jobId, inv])).values()
        );
        setHistory(completed);
      }
    } catch (error) {
      console.error('Error fetching interview history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (interviewId: number) => {
    try {
      const response = await interviewAPI.getReport(interviewId.toString());
      if (response.data.success) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(response.data.data, null, 2)));
        element.setAttribute('download', `interview-report-${interviewId}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout menuItems={candidateMenu} role="candidate">
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Interview History</h1>
            <p className="text-gray-500 font-medium mt-1">Review your past interview sessions</p>
          </div>

          {/* History List */}
          {history.length > 0 ? (
            <div className="grid gap-4">
              {history.map((interview) => (
                <div key={interview.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{typeof interview.job === 'object' ? (interview.job?.title || 'Interview') : 'Interview'}</h3>
                      <p className="text-gray-600 font-medium">{typeof interview.job === 'object' ? (interview.job?.company?.name || 'Company') : 'Company'}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(interview.completedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Score: {interview.overallScore || 0}%
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadReport(interview.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-500 font-bold text-lg">No interview history</p>
              <p className="text-gray-400">Your completed interviews will appear here</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewHistory;
