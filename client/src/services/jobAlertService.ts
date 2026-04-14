import apiService from './apiService';

export interface JobAlert {
  id: number;
  userId: number;
  jobId?: number;
  keyword: string;
  location?: string;
  experienceLevel?: string;
  jobType?: string;
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobAlertRequest {
  keyword: string;
  location?: string;
  experienceLevel?: string;
  jobType?: string;
}

export interface UpdateJobAlertRequest {
  keyword?: string;
  location?: string;
  experienceLevel?: string;
  jobType?: string;
  isActive?: boolean;
}

export const jobAlertService = {
  // Get all job alerts
  async getJobAlerts(): Promise<JobAlert[]> {
    return apiService.get<JobAlert[]>('/job-alerts');
  },

  // Create a job alert
  async createJobAlert(data: CreateJobAlertRequest): Promise<JobAlert> {
    return apiService.post<JobAlert>('/job-alerts', data as unknown as Record<string, unknown>);
  },

  // Update a job alert
  async updateJobAlert(id: number, data: UpdateJobAlertRequest): Promise<JobAlert> {
    return apiService.put<JobAlert>(`/job-alerts/${id}`, data as unknown as Record<string, unknown>);
  },

  // Delete a job alert
  async deleteJobAlert(id: number): Promise<void> {
    return apiService.delete(`/job-alerts/${id}`);
  },

  // Get matching jobs for an alert
  async getMatchingJobs(alertId: number): Promise<any[]> {
    return apiService.get<any[]>(`/job-alerts/${alertId}/matching-jobs`);
  },
};

export default jobAlertService;
