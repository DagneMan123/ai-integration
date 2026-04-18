import React, { useState, useEffect } from 'react';
import { FileText, Video, Download, X } from 'lucide-react';
import { apiService } from '../services/apiService';

interface VideoResumeData {
  applicantId: number;
  name: string;
  videoUrl: string | null;
  resumeUrl: string | null;
  interviewScore: number | null;
}

interface VideoResumeViewerProps {
  applicantId: number;
  onClose?: () => void;
}

export const VideoResumeViewer: React.FC<VideoResumeViewerProps> = ({ applicantId, onClose }) => {
  const [data, setData] = useState<VideoResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideoResume();
  }, [applicantId]);

  const fetchVideoResume = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(
        `/dashboard-enhanced/employer/applicant/${applicantId}/video-resume`
      );
      if ((response as any)?.data?.data) {
        setData((response as any).data.data);
      }
    } catch (err) {
      setError('Failed to load video and resume');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{data.name}</h2>
          {data.interviewScore !== null && (
            <p className="text-sm text-gray-600 mt-1">
              Interview Score: <span className="font-semibold text-blue-600">{data.interviewScore}%</span>
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            Interview Video
          </h3>
          {data.videoUrl ? (
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={data.videoUrl}
                controls
                className="w-full h-96 object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No video available</p>
              </div>
            </div>
          )}
        </div>

        {/* Resume Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Resume
          </h3>
          {data.resumeUrl ? (
            <div className="bg-gray-50 rounded-lg h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 font-semibold mb-4">Resume Document</p>
              <a
                href={data.resumeUrl}
                download
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </a>
              <a
                href={data.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View in new tab
              </a>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No resume available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
