import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { SidebarProvider } from './context/SidebarContext';
import GlobalSidebars from './components/GlobalSidebars';
import Chatbot from './components/Chatbot';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Import all pages directly (no lazy loading to avoid chunk timeout)
import CandidateDashboard from './pages/candidate/Dashboard';
import EnhancedDashboard from './pages/candidate/EnhancedDashboard';
import CandidateProfile from './pages/candidate/Profile';
import CandidateSettings from './pages/candidate/Settings';
import CandidateSecurity from './pages/candidate/Security';
import CandidateNotifications from './pages/candidate/Notifications';
import CandidateActivity from './pages/candidate/Activity';
import CandidateApplications from './pages/candidate/Applications';
import CandidateInterviews from './pages/candidate/Interviews';
import InterviewPayment from './pages/candidate/InterviewPayment';
import InterviewSession from './pages/candidate/InterviewSession';
import InterviewReport from './pages/candidate/InterviewReport';
import CandidatePayments from './pages/candidate/Payments';
import InterviewInsights from './pages/candidate/InterviewInsights';
import HelpCenter from './pages/candidate/HelpCenter';
import SavedJobs from './pages/candidate/SavedJobs';
import JobAlerts from './pages/candidate/JobAlerts';
import Resume from './pages/candidate/Resume';
import Invitations from './pages/candidate/Invitations';
import Practice from './pages/candidate/Practice';
import Assessment from './pages/candidate/Assessment';
import SystemCheck from './pages/candidate/SystemCheck';
import InterviewHistory from './pages/candidate/InterviewHistory';
import CandidateMessages from './pages/candidate/Messages';
import AccountSettings from './pages/candidate/AccountSettings';
import GettingStarted from './pages/candidate/GettingStarted';
import InterviewTips from './pages/candidate/InterviewTips';
import Troubleshooting from './pages/candidate/Troubleshooting';
import InterviewStart from './pages/candidate/InterviewStart';

import EmployerDashboard from './pages/employer/Dashboard';
import EmployerProfile from './pages/employer/Profile';
import EmployerSettings from './pages/employer/Settings';
import EmployerSecurity from './pages/employer/Security';
import EmployerNotifications from './pages/employer/Notifications';
import EmployerActivity from './pages/employer/Activity';
import EmployerJobs from './pages/employer/Jobs';
import CreateJob from './pages/employer/CreateJob';
import EditJob from './pages/employer/EditJob';
import JobCandidates from './pages/employer/JobCandidates';
import EmployerAnalytics from './pages/employer/Analytics';
import EmployerSubscription from './pages/employer/Subscription';
import ApplicantTracking from './pages/employer/ApplicantTracking';
import InterviewCalendar from './pages/employer/InterviewCalendar';
import Inbox from './pages/employer/Inbox';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCompanies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';
import AdminPayments from './pages/admin/Payments';
import AdminAnalytics from './pages/admin/Analytics';
import AdminLogs from './pages/admin/Logs';
import AdminSettings from './pages/admin/Settings';
import AdminSecurity from './pages/admin/Security';
import AdminNotifications from './pages/admin/Notifications';
import AdminActivity from './pages/admin/Activity';
import SessionMonitoring from './pages/admin/SessionMonitoring';
import SupportTickets from './pages/admin/SupportTickets';
import PaymentSuccess from './pages/PaymentSuccess';

const App: React.FC = () => {
  const { user, _hasHydrated } = useAuthStore();

  return (
    <SidebarProvider>
      <ChunkErrorBoundary>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Toaster position="top-right" />
            <GlobalSidebars />
          
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={_hasHydrated && user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={_hasHydrated && user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Register />} 
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              
              {/* Payment Routes */}
              <Route path="/payment/success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
              
              {/* Candidate Routes */}
              <Route path="/candidate/dashboard" element={<PrivateRoute role="candidate"><CandidateDashboard /></PrivateRoute>} />
              <Route path="/candidate/enhanced-dashboard" element={<PrivateRoute role="candidate"><EnhancedDashboard /></PrivateRoute>} />
              <Route path="/candidate/profile" element={<PrivateRoute role="candidate"><CandidateProfile /></PrivateRoute>} />
              <Route path="/candidate/settings" element={<PrivateRoute role="candidate"><CandidateSettings /></PrivateRoute>} />
              <Route path="/candidate/security" element={<PrivateRoute role="candidate"><CandidateSecurity /></PrivateRoute>} />
              <Route path="/candidate/notifications" element={<PrivateRoute role="candidate"><CandidateNotifications /></PrivateRoute>} />
              <Route path="/candidate/activity" element={<PrivateRoute role="candidate"><CandidateActivity /></PrivateRoute>} />
              <Route path="/candidate/applications" element={<PrivateRoute role="candidate"><CandidateApplications /></PrivateRoute>} />
              <Route path="/candidate/interviews" element={<PrivateRoute role="candidate"><CandidateInterviews /></PrivateRoute>} />
              <Route path="/candidate/interview/:interviewId/payment" element={<PrivateRoute role="candidate"><InterviewPayment /></PrivateRoute>} />
              <Route path="/candidate/interview/:id" element={<PrivateRoute role="candidate"><InterviewSession /></PrivateRoute>} />
              <Route path="/candidate/interview-session/:id" element={<PrivateRoute role="candidate"><InterviewSession /></PrivateRoute>} />
              <Route path="/candidate/interview/start/:jobId/:applicationId" element={<PrivateRoute role="candidate"><InterviewStart /></PrivateRoute>} />
              <Route path="/candidate/interview/:id/report" element={<PrivateRoute role="candidate"><InterviewReport /></PrivateRoute>} />
              <Route path="/candidate/payments" element={<PrivateRoute role="candidate"><CandidatePayments /></PrivateRoute>} />
              <Route path="/candidate/results" element={<PrivateRoute role="candidate"><InterviewInsights /></PrivateRoute>} />
              <Route path="/candidate/saved-jobs" element={<PrivateRoute role="candidate"><SavedJobs /></PrivateRoute>} />
              <Route path="/candidate/job-alerts" element={<PrivateRoute role="candidate"><JobAlerts /></PrivateRoute>} />
              <Route path="/candidate/resume" element={<PrivateRoute role="candidate"><Resume /></PrivateRoute>} />
              <Route path="/candidate/invitations" element={<PrivateRoute role="candidate"><Invitations /></PrivateRoute>} />
              <Route path="/candidate/practice" element={<PrivateRoute role="candidate"><Practice /></PrivateRoute>} />
              <Route path="/assessment" element={<PrivateRoute role="candidate"><Assessment /></PrivateRoute>} />
              <Route path="/candidate/system-check" element={<PrivateRoute role="candidate"><SystemCheck /></PrivateRoute>} />
              <Route path="/candidate/interview-history" element={<PrivateRoute role="candidate"><InterviewHistory /></PrivateRoute>} />
              <Route path="/candidate/messages" element={<PrivateRoute role="candidate"><CandidateMessages /></PrivateRoute>} />
              <Route path="/candidate/account-settings" element={<PrivateRoute role="candidate"><AccountSettings /></PrivateRoute>} />
              <Route path="/candidate/getting-started" element={<PrivateRoute role="candidate"><GettingStarted /></PrivateRoute>} />
              <Route path="/candidate/interview-tips" element={<PrivateRoute role="candidate"><InterviewTips /></PrivateRoute>} />
              <Route path="/candidate/troubleshooting" element={<PrivateRoute role="candidate"><Troubleshooting /></PrivateRoute>} />
              <Route path="/help-center" element={<PrivateRoute role="candidate"><HelpCenter /></PrivateRoute>} />
              
              {/* Employer Routes */}
              <Route path="/employer/dashboard" element={<PrivateRoute role="employer"><EmployerDashboard /></PrivateRoute>} />
              <Route path="/employer/profile" element={<PrivateRoute role="employer"><EmployerProfile /></PrivateRoute>} />
              <Route path="/employer/settings" element={<PrivateRoute role="employer"><EmployerSettings /></PrivateRoute>} />
              <Route path="/employer/security" element={<PrivateRoute role="employer"><EmployerSecurity /></PrivateRoute>} />
              <Route path="/employer/notifications" element={<PrivateRoute role="employer"><EmployerNotifications /></PrivateRoute>} />
              <Route path="/employer/activity" element={<PrivateRoute role="employer"><EmployerActivity /></PrivateRoute>} />
              <Route path="/employer/jobs" element={<PrivateRoute role="employer"><EmployerJobs /></PrivateRoute>} />
              <Route path="/employer/jobs/create" element={<PrivateRoute role="employer"><CreateJob /></PrivateRoute>} />
              <Route path="/employer/jobs/:id/edit" element={<PrivateRoute role="employer"><EditJob /></PrivateRoute>} />
              <Route path="/employer/jobs/:id/candidates" element={<PrivateRoute role="employer"><JobCandidates /></PrivateRoute>} />
              <Route path="/employer/analytics" element={<PrivateRoute role="employer"><EmployerAnalytics /></PrivateRoute>} />
              <Route path="/employer/subscription" element={<PrivateRoute role="employer"><EmployerSubscription /></PrivateRoute>} />
              <Route path="/employer/candidates" element={<PrivateRoute role="employer"><ApplicantTracking /></PrivateRoute>} />
              <Route path="/employer/schedule" element={<PrivateRoute role="employer"><InterviewCalendar /></PrivateRoute>} />
              <Route path="/employer/messages" element={<PrivateRoute role="employer"><Inbox /></PrivateRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/settings" element={<PrivateRoute role="admin"><AdminSettings /></PrivateRoute>} />
              <Route path="/admin/security" element={<PrivateRoute role="admin"><AdminSecurity /></PrivateRoute>} />
              <Route path="/admin/notifications" element={<PrivateRoute role="admin"><AdminNotifications /></PrivateRoute>} />
              <Route path="/admin/activity" element={<PrivateRoute role="admin"><AdminActivity /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />
              <Route path="/admin/companies" element={<PrivateRoute role="admin"><AdminCompanies /></PrivateRoute>} />
              <Route path="/admin/jobs" element={<PrivateRoute role="admin"><AdminJobs /></PrivateRoute>} />
              <Route path="/admin/payments" element={<PrivateRoute role="admin"><AdminPayments /></PrivateRoute>} />
              <Route path="/admin/analytics" element={<PrivateRoute role="admin"><AdminAnalytics /></PrivateRoute>} />
              <Route path="/admin/logs" element={<PrivateRoute role="admin"><AdminLogs /></PrivateRoute>} />
              <Route path="/admin/session-monitoring" element={<PrivateRoute role="admin"><SessionMonitoring /></PrivateRoute>} />
              <Route path="/admin/support-tickets" element={<PrivateRoute role="admin"><SupportTickets /></PrivateRoute>} />
              
              {/* 404 - Redirect to home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Chatbot />
          </div>
        </Router>
      </ChunkErrorBoundary>
    </SidebarProvider>
  );
};

export default App;
