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
  TrendingUp,
  Zap,
  Eye,
  Lock,
  CreditCard,
  AlertCircle,
  BarChart2
} from 'lucide-react';

export interface MenuItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  submenu?: MenuItem[];
  isSection?: boolean;
  description?: string;
}

export const candidateMenu: MenuItem[] = [
  { 
    path: '/candidate/dashboard', 
    label: 'Dashboard', 
    icon: <LayoutDashboard size={20} />,
    description: 'Your career overview'
  },
  { 
    path: '/candidate/dashboard-enhanced', 
    label: 'Enhanced Dashboard', 
    icon: <TrendingUp size={20} />,
    description: 'AI scores & applications'
  },
  
  {
    label: 'Job Search',
    icon: <Briefcase size={20} />,
    isSection: true,
    submenu: [
      { path: '/jobs', label: 'Find Jobs', icon: <Search size={18} />, description: 'Browse opportunities' },
      { path: '/candidate/saved-jobs', label: 'Saved Jobs', icon: <Bookmark size={18} />, description: 'Your bookmarks' },
      { path: '/candidate/job-alerts', label: 'Job Alerts', icon: <Bell size={18} />, description: 'Stay updated' },
    ]
  },
  
  {
    label: 'Career Profile',
    icon: <UserCircle size={20} />,
    isSection: true,
    submenu: [
      { path: '/candidate/profile', label: 'My Profile', icon: <UserCircle size={18} />, description: 'Edit your info' },
      { path: '/candidate/resume', label: 'Resume & Documents', icon: <FileText size={18} />, description: 'Manage files' },
      { path: '/candidate/applications', label: 'My Applications', icon: <FileCheck size={18} />, description: 'Track status' },
    ]
  },
  
  {
    label: 'AI Interview Prep',
    icon: <Video size={20} />,
    isSection: true,
    submenu: [
      { path: '/candidate/invitations', label: 'Official Invitations', icon: <CheckCircle size={18} />, description: 'Pending interviews' },
      { path: '/candidate/practice', label: 'Practice Mode', icon: <Star size={18} />, description: 'Improve skills' },
      { path: '/candidate/system-check', label: 'System Check', icon: <Zap size={18} />, description: 'Verify setup' },
      { path: '/candidate/interview-history', label: 'Interview History', icon: <ClipboardList size={18} />, description: 'Past sessions' },
    ]
  },
  
  { 
    path: '/candidate/messages', 
    label: 'Messages', 
    icon: <MessageSquare size={20} />, 
    badge: 0,
    description: 'Employer communications'
  },
  
  {
    label: 'Account',
    icon: <Settings size={20} />,
    isSection: true,
    submenu: [
      { path: '/candidate/account-settings', label: 'Settings', icon: <Settings size={18} />, description: 'Preferences' },
      { path: '/candidate/security', label: 'Security', icon: <Lock size={18} />, description: 'Password & 2FA' },
      { path: '/candidate/help-center', label: 'Help Center', icon: <HelpCircle size={18} />, description: 'Support' },
    ]
  },
];

export const employerMenu: MenuItem[] = [
  { 
    path: '/employer/dashboard', 
    label: 'Recruitment Hub', 
    icon: <BarChart3 size={20} />,
    description: 'Overview & metrics'
  },
  { 
    path: '/employer/dashboard-enhanced', 
    label: 'Talent Discovery', 
    icon: <TrendingUp size={20} />,
    description: 'AI-sorted applicants'
  },
  
  {
    label: 'Hiring Management',
    icon: <Briefcase size={20} />,
    isSection: true,
    submenu: [
      { path: '/employer/jobs', label: 'Job Postings', icon: <Briefcase size={18} />, description: 'Create & manage' },
      { path: '/employer/job-candidates', label: 'Applicant Tracking', icon: <Users size={18} />, description: 'Review candidates' },
      { path: '/employer/interview-calendar', label: 'Interview Calendar', icon: <Calendar size={18} />, description: 'Schedule & track' },
    ]
  },
  
  {
    label: 'Company',
    icon: <Building2 size={20} />,
    isSection: true,
    submenu: [
      { path: '/employer/profile', label: 'Company Profile', icon: <Building2 size={18} />, description: 'Edit details' },
      { path: '/employer/analytics', label: 'Analytics', icon: <BarChart2 size={18} />, description: 'Performance data' },
      { path: '/employer/activity', label: 'Activity Log', icon: <Eye size={18} />, description: 'Recent actions' },
    ]
  },
  
  {
    label: 'Billing & Plan',
    icon: <CreditCard size={20} />,
    isSection: true,
    submenu: [
      { path: '/employer/subscription', label: 'Subscription Plan', icon: <ShieldCheck size={18} />, description: 'Upgrade plan' },
      { path: '/employer/payments', label: 'Payments', icon: <CreditCard size={18} />, description: 'Billing history' },
    ]
  },
  
  { 
    path: '/employer/inbox', 
    label: 'Inbox', 
    icon: <MessageSquare size={20} />, 
    badge: 5,
    description: 'Candidate messages'
  },
  
  {
    label: 'Settings',
    icon: <Settings size={20} />,
    isSection: true,
    submenu: [
      { path: '/employer/settings', label: 'Account Settings', icon: <Settings size={18} />, description: 'Preferences' },
      { path: '/employer/security', label: 'Security', icon: <Lock size={18} />, description: 'Password & 2FA' },
      { path: '/employer/notifications', label: 'Notifications', icon: <Bell size={18} />, description: 'Alert settings' },
    ]
  },
];

export const adminMenu: MenuItem[] = [
  { 
    path: '/admin/dashboard', 
    label: 'Command Center', 
    icon: <LayoutDashboard size={20} />,
    description: 'System overview'
  },
  { 
    path: '/admin/dashboard-enhanced', 
    label: 'System Health', 
    icon: <TrendingUp size={20} />,
    description: 'Monitoring & analytics'
  },
  
  {
    label: 'User Management',
    icon: <Users size={20} />,
    isSection: true,
    submenu: [
      { path: '/admin/users', label: 'User Directory', icon: <Users size={18} />, description: 'All users' },
      { path: '/admin/companies', label: 'Companies', icon: <Factory size={18} />, description: 'Verify & manage' },
      { path: '/admin/activity', label: 'User Activity', icon: <Eye size={18} />, description: 'Track actions' },
    ]
  },
  
  {
    label: 'Monitoring',
    icon: <AlertCircle size={20} />,
    isSection: true,
    submenu: [
      { path: '/admin/session-monitoring', label: 'Session Monitoring', icon: <ClipboardList size={18} />, description: 'Active sessions' },
      { path: '/admin/logs', label: 'Security & Audit', icon: <ShieldAlert size={18} />, description: 'System logs' },
      { path: '/admin/support-tickets', label: 'Support Tickets', icon: <MessageSquare size={18} />, badge: 3, description: 'User issues' },
    ]
  },
  
  {
    label: 'Analytics & Revenue',
    icon: <TrendingUp size={20} />,
    isSection: true,
    submenu: [
      { path: '/admin/analytics', label: 'System Analytics', icon: <BarChart3 size={18} />, description: 'Platform metrics' },
      { path: '/admin/payments', label: 'Revenue Tracker', icon: <Wallet size={18} />, description: 'Payment data' },
      { path: '/admin/jobs', label: 'Job Postings', icon: <Briefcase size={18} />, description: 'All jobs' },
    ]
  },
  
  {
    label: 'System',
    icon: <Settings size={20} />,
    isSection: true,
    submenu: [
      { path: '/admin/settings', label: 'Global Settings', icon: <Settings size={18} />, description: 'System config' },
      { path: '/admin/notifications', label: 'Notifications', icon: <Bell size={18} />, description: 'Alert settings' },
      { path: '/admin/security', label: 'Security', icon: <Lock size={18} />, description: 'Security settings' },
    ]
  },
];