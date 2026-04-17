import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import ProfessionalInterviewSession from '../../components/ProfessionalInterviewSession';
import InterviewResults from '../../components/InterviewResults';
import { interviewSessionService } from '../../services/interviewSessionService';
import Loading from '../../components/Loading';

interface Question {
  id: number;
  text: string;
  category: 'technical' | 'behavioral' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedKeywords?: string[];
}

interface JobDetails {
  jobId: string;
  title: string;
  company: string;
  experienceLevel: string;
  requiredSkills: string[];
}

const ProfessionalInterview: React.FC = () => {
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [interviewResults, setInterviewResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterviewData();
  }, [jobId]);

  const loadInterviewData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock job details - replace with actual API call
      const mockJobDetails: JobDetails = {
        jobId: jobId || '1',
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Ethiopia',
        experienceLevel: 'senior',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS']
      };

      setJobDetails(mockJobDetails);

      // Generate questions using AI
      const generatedQuestions = await interviewSessionService.generateQuestions(mockJobDetails);
      setQuestions(generatedQuestions);
    } catch (err: any) {
      console.error('Error loading interview data:', err);
      setError(err.message || 'Failed to load interview data');
      toast.error('Failed to load interview questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewComplete = async (data: { responses: any[]; scores: any[]; overallScore: any }) => {
    try {
      setIsLoading(true);

      // Generate interview summary
      if (jobDetails) {
        const summary = await interviewSessionService.generateInterviewSummary(
          data.responses,
          jobDetails
        );

        setInterviewResults({
          responses: data.responses,
          scores: data.scores,
          overallScore: data.overallScore,
          summary,
          jobDetails,
          completedAt: new Date()
        });

        setInterviewComplete(true);
        toast.success('Interview completed successfully!');
      }
    } catch (err: any) {
      console.error('Error completing interview:', err);
      toast.error('Failed to generate interview summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to exit the interview? Your progress will be lost.')) {
      navigate('/candidate/interviews');
    }
  };

  const handleRetry = () => {
    setInterviewComplete(false);
    setInterviewResults(null);
    setQuestions([]);
    loadInterviewData();
  };

  if (isLoading && !interviewComplete) {
    return <Loading />;
  }

  if (error && !interviewComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">Error Loading Interview</h2>
          </div>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/candidate/interviews')}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
            >
              Go Back
            </button>
            <button
              onClick={loadInterviewData}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (interviewComplete && interviewResults) {
    return (
      <InterviewResults
        sessionType="Professional Interview"
        responses={interviewResults.responses}
        totalTime={interviewResults.responses.reduce((sum: number, r: any) => sum + (r.recordingTime || 0), 0)}
        onRetry={handleRetry}
        onHome={() => navigate('/candidate/interviews')}
      />
    );
  }

  if (!jobDetails || questions.length === 0) {
    return <Loading />;
  }

  return (
    <ProfessionalInterviewSession
      jobTitle={jobDetails.title}
      company={jobDetails.company}
      jobId={jobId || '1'}
      applicationId={applicationId || '1'}
      onComplete={handleInterviewComplete}
      onCancel={handleCancel}
    />
  );
};

export default ProfessionalInterview;
