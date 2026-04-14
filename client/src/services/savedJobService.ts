import apiService from './apiService';

export interface SavedJob {
  id: number;
  userId: number;
  jobId: number;
  savedAt: string;
  job: {
    id: number;
    title: string;
    description: string;
    location: string;
    company: {
      id: number;
      name: string;
    };
  };
}

export const savedJobService = {
  // Get all saved jobs
  async getSavedJobs(): Promise<SavedJob[]> {
    return apiService.get<SavedJob[]>('/saved-jobs');
  },

  // Save a job
  async saveJob(jobId: number): Promise<SavedJob> {
    return apiService.post<SavedJob>('/saved-jobs', { jobId } as Record<string, unknown>);
  },

  // Remove a saved job
  async removeSavedJob(jobId: number): Promise<void> {
    return apiService.delete(`/saved-jobs/${jobId}`);
  },

  // Check if a job is saved
  async isJobSaved(jobId: number): Promise<{ isSaved: boolean }> {
    return apiService.get<{ isSaved: boolean }>(`/saved-jobs/check/${jobId}`);
  },
};

export default savedJobService;
