export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export interface Job {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  companyId?: Company;
  company?: Company;
  experienceLevel?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requiredSkills?: string[];
  skills?: string[];
  jobType?: string;
  interviewType?: string;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'PAUSED' | 'EXPIRED' | 'active' | 'closed' | 'draft';
  isApproved?: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  userId: string;
  name: string;
  logo?: string;
  industry: string;
  description?: string;
  website?: string;
  isVerified: boolean;
  subscription?: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  aiCredits: number;
  createdAt: string;
}

export interface Application {
  _id: string;
  jobId: string | Job;
  candidateId: string | User;
  coverLetter?: string;
  resume?: string;
  status: 'pending' | 'reviewing' | 'interviewing' | 'interviewed' | 'accepted' | 'rejected' | 'withdrawn';
  isShortlisted: boolean;
  interviewScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  _id: string;
  jobId: string | Job;
  candidateId: string | User;
  applicationId: string;
  questions: Question[];
  responses: Response[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  aiEvaluation?: AIEvaluation;
  startedAt?: string;
  completedAt?: string;
  timeLimit: number;
  currentQuestionIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  text: string;
  type: 'behavioral' | 'technical' | 'coding' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  keywords?: string[];
}

export interface Response {
  questionIndex: number;
  question: string;
  answer: string;
  timeTaken: number;
  score?: number;
  feedback?: string;
}

export interface AIEvaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  skillScores: Array<{
    skill: string;
    score: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  hiringDecision: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';
}

export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  type: 'subscription' | 'credits' | 'interview' | 'premium_report';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionRef: string;
  chapaReference?: string;
  description: string;
  metadata?: Record<string, any>;
  paidAt?: string;
  createdAt: string;
}

export interface DashboardData {
  totalApplications?: number;
  totalInterviews?: number;
  averageScore?: number;
  recentInterviews?: Interview[];
  totalJobs?: number;
  activeJobs?: number;
  totalUsers?: number;
  totalRevenue?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

// Auth response types
export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
  message?: string;
}
