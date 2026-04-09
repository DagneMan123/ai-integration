/**
 * 1. Enums ለተሻለ ጥራት (Better Type Safety)
 */
export enum UserRole {
  CANDIDATE = 'candidate',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

export enum JobStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft',
  PAUSED = 'paused',
}

export enum InterviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum HiringDecision {
  STRONGLY_RECOMMEND = 'strongly_recommend',
  RECOMMEND = 'recommend',
  NEUTRAL = 'neutral',
  NOT_RECOMMEND = 'not_recommend',
}

/**
 * 2. Base Metadata Interface (DRY Principle)
 * ሁሉንም ID እና Date የሚይዙ ነገሮች እዚህ ይጠቃለላሉ
 */
interface BaseEntity {
  id: string;
  _id: string; // MongoDB ID (required)
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  skills?: string;
  experience?: string;
  education?: string;
  bio?: string;
}

/**
 * Auth Response Interface
 */
export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  message?: string;
}

/**
 * 3. Skill Type (ለሥራና ለአመልካች አንድ አይነት እንዲሆን)
 */
export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'expert';
  yearsOfExperience?: number;
}

export interface Job extends BaseEntity {
  title: string;
  description: string;
  company: Company; // Populated by default in professional apps
  companyId?: string; // For reference
  experienceLevel: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'monthly' | 'yearly';
  };
  salaryMin?: number; // Alternative format
  salaryMax?: number; // Alternative format
  skills: string[];
  requiredSkills?: string[]; // Alternative format
  jobType: 'full-time' | 'part-time' | 'contract' | 'remote';
  interviewMode?: 'audio' | 'video' | 'text'; // Interview mode
  interviewType?: 'audio' | 'video' | 'text'; // Alternative format
  status: JobStatus;
  isApproved: boolean;
  views: number;
  applicationCount: number;
  strictness?: 'low' | 'medium' | 'high'; // Anti-cheat strictness level
}

export interface Company extends Omit<BaseEntity, 'updatedAt'> {
  userId: string;
  name: string;
  logo?: string;
  industry: string;
  description?: string;
  website?: string;
  address?: string;
  isVerified: boolean;
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'past_due' | 'canceled';
    endDate: string;
  };
  aiCredits: number;
}

export interface Application extends BaseEntity {
  job: string | Job;
  jobId?: string; // Alternative format
  candidate: string | User;
  coverLetter?: string;
  resumeUrl: string;
  status: 'pending' | 'reviewing' | 'interviewing' | 'hired' | 'rejected' | 'accepted';
  isShortlisted: boolean;
  interviewScore?: number;
  aiMatchScore: number; // AI ሲቪውን ከሥራው ጋር ያወዳደረበት ውጤት
}

export interface Interview extends BaseEntity {
  job: string | Job;
  jobId?: string; // Alternative format
  candidate: string | User;
  applicationId: string;
  questions: Question[];
  responses: InterviewResponse[];
  status: InterviewStatus;
  aiEvaluation?: AIEvaluation;
  overallScore?: number;
  evaluation?: any;
  integrityScore?: number;
  startedAt?: string;
  completedAt?: string;
  timeLimit: number; // በደቂቃ
  interviewMode?: 'audio' | 'video' | 'text'; // Interview mode
  proctoringLogs: Array<{ type: string; timestamp: string }>; // ለታማኝነት (Anti-cheat)
}

export interface Question {
  id: string;
  text: string;
  type: 'behavioral' | 'technical' | 'coding';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedKeywords: string[];
}

export interface InterviewResponse {
  questionId: string;
  answerText: string;
  audioUrl?: string;
  videoUrl?: string;
  timeTaken: number; // በሰከንድ
  aiConfidenceScore: number; // AI መልሱ ትክክል መሆኑን ያረጋገጠበት
}

export interface AIEvaluation {
  overallScore: number;
  metrics: {
    technicalAccuracy: number;
    communicationClarity: number;
    confidenceLevel: number;
    problemSolving: number;
    culturalFit: number;
  };
  skillBreakdown: Array<{
    skill: string;
    score: number;
    feedback: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  behavioralTraits: string[]; // የአመልካቹ ባህሪ ትንተና
  summary: string;
  hiringDecision: HiringDecision;
}

export interface Payment extends BaseEntity {
  userId: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'credit_topup';
  status: 'pending' | 'completed' | 'failed';
  transactionRef?: string;
  transactionId?: string;
  chapaReference?: string;
  paymentMethod?: string;
  provider?: 'chapa' | 'telebirr' | 'stripe';
  description?: string;
  creditAmount?: number;
  paidAt?: string;
  metadata?: Record<string, any>;
}

/**
 * Auth State Interface
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}
export interface DashboardData {
  stats: {
    totalApplications?: number;
    totalInterviews?: number;
    totalJobs?: number;
    activeJobs?: number;
    pendingApplications?: number;
    completedInterviews?: number;
    hiredCandidates?: number;
    totalCandidates?: number;
    totalUsers?: number;
    totalRevenue?: number;
  };
  // Candidate-specific properties
  applications?: number;
  interviews?: number;
  averageScore?: number;
  recentInterviews?: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    scheduledAt: string;
    status: string;
  }>;
  // Employer-specific properties
  jobs?: number;
  activeJobs?: number;
  recentApplications?: Array<{
    id: string;
    candidateName: string;
    jobTitle: string;
    candidateEmail: string;
    status: string;
    appliedAt: string;
  }>;
  // Admin-specific properties
  totalUsers?: number;
  totalJobs?: number;
  totalInterviews?: number;
  totalRevenue?: number;
  pendingCompanies?: number;
  pendingJobs?: number;
  // General properties
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status?: string;
  }>;
  upcomingInterviews?: Array<{
    id: string;
    jobTitle: string;
    candidateName?: string;
    scheduledAt: string;
    status: string;
  }>;
  topJobs?: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
  }>;
}

/**
 * Generic API Wrapper (Professional Pattern)
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}