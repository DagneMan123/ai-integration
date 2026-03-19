import React from 'react';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileCheck, 
  Video, 
  Wallet, 
  Building2, 
  Briefcase, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Factory, 
  ShieldAlert,
  Settings,
  ClipboardList,
  Calendar,
  MessageSquare,
  HelpCircle,
  Star
} from 'lucide-react';

export interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

// --- Candidate Menu (Enhanced) ---
export const candidateMenu: MenuItem[] = [
  { path: '/candidate/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/candidate/profile', label: 'Profile Settings', icon: <UserCircle size={20} /> },
  { path: '/candidate/applications', label: 'My Applications', icon: <FileCheck size={20} /> },
  { 
    path: '/candidate/interviews', 
    label: 'AI Interviews', 
    icon: <Video size={20} />, 
    badge: 2 
  },
  { 
    path: '/candidate/results', // Added: Important for AI feedback
    label: 'Interview Insights', 
    icon: <Star size={20} /> 
  },
  { path: '/candidate/payments', label: 'Billing & History', icon: <Wallet size={20} /> },
  { path: '/candidate/support', label: 'Help Center', icon: <HelpCircle size={20} /> },
];

// --- Employer Menu (Enhanced) ---
export const employerMenu: MenuItem[] = [
  { path: '/employer/dashboard', label: 'Recruitment Hub', icon: <BarChart3 size={20} /> },
  { path: '/employer/profile', label: 'Company Identity', icon: <Building2 size={20} /> },
  { path: '/employer/jobs', label: 'Manage Vacancies', icon: <Briefcase size={20} /> },
  { path: '/employer/candidates', // Added: Tracking applicants
    label: 'Applicant Tracking', 
    icon: <Users size={20} /> 
  },
  { path: '/employer/schedule', // Added: Scheduling meetings
    label: 'Interview Calendar', 
    icon: <Calendar size={20} /> 
  },
  { path: '/employer/subscription', label: 'Enterprise Plan', icon: <ShieldCheck size={20} /> },
  { path: '/employer/messages', label: 'Inbox', icon: <MessageSquare size={20} />, badge: 5 },
];

// --- Admin Menu (Enhanced) ---
export const adminMenu: MenuItem[] = [
  { path: '/admin/dashboard', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
  { path: '/admin/users', label: 'User Directory', icon: <Users size={20} /> },
  { path: '/admin/companies', label: 'Organization Audit', icon: <Factory size={20} /> },
  { path: '/admin/session-monitoring', // Changed: Now a full page
    label: 'Session Monitoring', 
    icon: <ClipboardList size={20} /> 
  },
  { path: '/admin/payments', label: 'Revenue Tracker', icon: <Wallet size={20} /> },
  { path: '/admin/analytics', label: 'System Analytics', icon: <BarChart3 size={20} /> },
  { path: '/admin/support-tickets', // Changed: Now a full page
    label: 'Support Tickets', 
    icon: <MessageSquare size={20} />, 
    badge: 3 
  },
  { path: '/admin/logs', label: 'Security & Audit', icon: <ShieldAlert size={20} /> },
  { path: '/admin/settings', label: 'Global Settings', icon: <Settings size={20} /> },
];