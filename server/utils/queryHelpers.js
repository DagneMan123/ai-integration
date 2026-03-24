/**
 * Query Helpers - Automatic Data Fetching
 * Provides reusable functions to automatically include related data
 */

const { prisma } = require('../config/database');

/**
 * Standard include configuration for Interview queries
 * Automatically includes job and company data
 */
const INTERVIEW_INCLUDE = {
  job: {
    include: {
      company: true
    }
  }
};

/**
 * Standard include configuration for Application queries
 * Automatically includes job and candidate data
 */
const APPLICATION_INCLUDE = {
  job: {
    include: {
      company: true
    }
  },
  candidate: true
};

/**
 * Standard include configuration for Job queries
 * Automatically includes company data
 */
const JOB_INCLUDE = {
  company: true
};

/**
 * Transform interview data to match frontend expectations
 * @param {Object} interview - Raw interview from database
 * @returns {Object} Formatted interview
 */
const formatInterview = (interview) => {
  if (!interview) return null;
  
  return {
    _id: interview.id,
    id: interview.id,
    job: interview.job,
    jobId: interview.jobId,
    candidateId: interview.candidateId,
    applicationId: interview.applicationId,
    questions: interview.questions || [],
    responses: interview.responses || [],
    status: interview.status?.toLowerCase() || 'pending',
    aiEvaluation: interview.evaluation || null,
    startedAt: interview.startedAt,
    completedAt: interview.completedAt,
    interviewMode: interview.interviewMode || 'text',
    createdAt: interview.startedAt || interview.createdAt,
    updatedAt: interview.updatedAt,
    proctoringLogs: interview.antiCheatData || [],
    overallScore: interview.overallScore,
    feedback: interview.feedback,
    integrityScore: interview.integrityScore,
    integrityRisk: interview.integrityRisk
  };
};

/**
 * Transform multiple interviews
 * @param {Array} interviews - Array of raw interviews
 * @returns {Array} Array of formatted interviews
 */
const formatInterviews = (interviews) => {
  return interviews.map(formatInterview);
};

/**
 * Transform application data to match frontend expectations
 * @param {Object} application - Raw application from database
 * @returns {Object} Formatted application
 */
const formatApplication = (application) => {
  if (!application) return null;
  
  return {
    _id: application.id,
    id: application.id,
    job: application.job,
    jobId: application.jobId,
    candidate: application.candidate,
    candidateId: application.candidateId,
    status: application.status?.toLowerCase() || 'pending',
    coverLetter: application.coverLetter,
    resumeUrl: application.resumeUrl,
    appliedAt: application.appliedAt,
    updatedAt: application.updatedAt,
    createdAt: application.appliedAt || application.createdAt
  };
};

/**
 * Transform multiple applications
 * @param {Array} applications - Array of raw applications
 * @returns {Array} Array of formatted applications
 */
const formatApplications = (applications) => {
  return applications.map(formatApplication);
};

/**
 * Transform job data to match frontend expectations
 * @param {Object} job - Raw job from database
 * @returns {Object} Formatted job
 */
const formatJob = (job) => {
  if (!job) return null;
  
  return {
    _id: job.id,
    id: job.id,
    title: job.title,
    description: job.description,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    location: job.location,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    requiredSkills: job.requiredSkills || [],
    interviewType: job.interviewType,
    status: job.status?.toLowerCase() || 'active',
    company: job.company,
    companyId: job.companyId,
    createdBy: job.createdBy,
    createdById: job.createdById,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  };
};

/**
 * Transform multiple jobs
 * @param {Array} jobs - Array of raw jobs
 * @returns {Array} Array of formatted jobs
 */
const formatJobs = (jobs) => {
  return jobs.map(formatJob);
};

/**
 * Fetch interview with automatic job data
 * @param {number|string} interviewId - Interview ID
 * @returns {Promise<Object>} Formatted interview with job data
 */
const fetchInterviewWithJob = async (interviewId) => {
  const id = parseInt(interviewId);
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: INTERVIEW_INCLUDE
  });
  return formatInterview(interview);
};

/**
 * Fetch multiple interviews with automatic job data
 * @param {Object} where - Prisma where clause
 * @param {Object} options - Additional options (orderBy, take, skip)
 * @returns {Promise<Array>} Array of formatted interviews with job data
 */
const fetchInterviewsWithJob = async (where, options = {}) => {
  const interviews = await prisma.interview.findMany({
    where,
    include: INTERVIEW_INCLUDE,
    ...options
  });
  return formatInterviews(interviews);
};

/**
 * Fetch application with automatic job and candidate data
 * @param {number} applicationId - Application ID
 * @returns {Promise<Object>} Formatted application with job and candidate data
 */
const fetchApplicationWithJob = async (applicationId) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: APPLICATION_INCLUDE
  });
  return formatApplication(application);
};

/**
 * Fetch multiple applications with automatic job and candidate data
 * @param {Object} where - Prisma where clause
 * @param {Object} options - Additional options (orderBy, take, skip)
 * @returns {Promise<Array>} Array of formatted applications with job and candidate data
 */
const fetchApplicationsWithJob = async (where, options = {}) => {
  const applications = await prisma.application.findMany({
    where,
    include: APPLICATION_INCLUDE,
    ...options
  });
  return formatApplications(applications);
};

/**
 * Fetch job with automatic company data
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Formatted job with company data
 */
const fetchJobWithCompany = async (jobId) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: JOB_INCLUDE
  });
  return formatJob(job);
};

/**
 * Fetch multiple jobs with automatic company data
 * @param {Object} where - Prisma where clause
 * @param {Object} options - Additional options (orderBy, take, skip)
 * @returns {Promise<Array>} Array of formatted jobs with company data
 */
const fetchJobsWithCompany = async (where, options = {}) => {
  const jobs = await prisma.job.findMany({
    where,
    include: JOB_INCLUDE,
    ...options
  });
  return formatJobs(jobs);
};

module.exports = {
  // Include configurations
  INTERVIEW_INCLUDE,
  APPLICATION_INCLUDE,
  JOB_INCLUDE,
  
  // Format functions
  formatInterview,
  formatInterviews,
  formatApplication,
  formatApplications,
  formatJob,
  formatJobs,
  
  // Fetch functions with automatic includes
  fetchInterviewWithJob,
  fetchInterviewsWithJob,
  fetchApplicationWithJob,
  fetchApplicationsWithJob,
  fetchJobWithCompany,
  fetchJobsWithCompany
};
