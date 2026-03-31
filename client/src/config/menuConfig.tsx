import React from 'react';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileCheck, 
  Video, 
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
  Star,
  Wallet,
  Search,
  Bookmark,
  Bell,
  FileText,
  CheckCircle,
  LogOut
} from 'lucide-react';

export interface MenuItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  submenu?: MenuItem[];
  isSection?: boolean;
}

// --- Candidate Menu (Professional Hierarchical Structure) ---
export const candidateMenu: MenuItem[] = [
  // 1. Dashboard
  { path: '/candidate/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  
  // 2. Jobs Section
  {
    label: 'Jobs',
    icon: <Briefcase size={20} />,
    isSection: true,
    submenu: [
      { path: '/jobs', label: 'Find Jobs', icon: <Search size={18} /> },
      { path: '/candidate/saved-jobs', label: 'Saved Jobs', icon: <Bookmark size={18} /> },
      { path: '/candidate/job-alerts', label: 'Job Alerts', icon: <Bell size={18} /> },
    ]
  },
  
  // 3. My Career Section
  {
    label: 'My Career',
    icon: <UserCircle size={20} />,
    isSection: true,
    submenu: [
      { path: '/candidate/profile', label: 'My Profile', icon: <UserCircle size={18} /> },
      { path: '/candidate/resume', label: 'Resume & Documents', icon: <FileText size={18} /> },
      { path: '/candidate/applications', label: 'My Applications', icon: <FileCheck size={18} /> },
    ]
  },
  
  // 4. AI Interviews Section
  {
    label: 'AI Interviews',
    icon: <Video size={20} />,
    isSection: true,
    submenu: [
      { path: '/candidate/invitations', label: 'Official Invitations', icon: <CheckCircle size={18} /> },
      { path: '/candidate/practice', label: 'Practice Mode', icon: <Star size={18} /> },
      { path: '/candidate/system-check', label: 'System Check', icon: <Settings size={18} /> },
      { path: '/candidate/interview-history', label: 'Interview History', icon: <ClipboardList size={18} /> },
    ]
  },
  
  // 5. Messages
  { path: '/candidate/messages', label: 'Messages', icon: <MessageSquare size={20} />, badge: 0 },
  
  // 6. Settings & Support Section
  {
    label: 'Settings & Support',
    icon: <Settings size={20} />,
    isSection: true,
    submenu: [
      { path: '/candidate/account-settings', label: 'Account Settings', icon: <Settings size={18} /> },
      { path: '/candidate/help-center', label: 'Help Center', icon: <HelpCircle size={18} /> },
      { path: '/logout', label: 'Logout', icon: <LogOut size={18} /> },
    ]
  },
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