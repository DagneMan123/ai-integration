import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { SidebarProvider } from './context/SidebarContext';
import Loading from './components/Loading';
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

// Lazy load dashboard pages for better performance
const CandidateDashboard = lazy(() => import('./pages/candidate/Dashboard'));
const CandidateProfile = lazy(() => import('./pages/candidate/Profile'));
const CandidateSettings = lazy(() => import('./pages/candidate/Settings'));
const CandidateSecurity = lazy(() => import('./pages/candidate/Security'));
const CandidateNotifications = lazy(() => import('./pages/candidate/Notifications'));
const CandidateActivity = lazy(() => import('./pages/candidate/Activity'));
const CandidateApplications = lazy(() => import('./pages/candidate/Applications'));
const CandidateInterviews = lazy(() => import('./pages/candidate/Interviews'));
const InterviewPayment = lazy(() => import('./pages/candidate/InterviewPayment'));
const InterviewSession = lazy(() => import('./pages/candidate/InterviewSession'));
const InterviewReport = lazy(() => import('./pages/candidate/InterviewReport'));
const CandidatePayments = lazy(() => import('./pages/candidate/Payments'));
// const PaymentHistory = lazy(() => import('./pages/candidate/PaymentHistory'));
const InterviewInsights = lazy(() => import('./pages/candidate/InterviewInsights'));
const HelpCenter = lazy(() => import('./pages/candidate/HelpCenter'));
const SavedJobs = lazy(() => import('./pages/candidate/SavedJobs'));
const JobAlerts = lazy(() => import('./pages/candidate/JobAlerts'));
const Resume = lazy(() => import('./pages/candidate/Resume'));
const Invitations = lazy(() => import('./pages/candidate/Invitations'));
const Practice = lazy(() => import('./pages/candidate/Practice'));
const Assessment = lazy(() => import('./pages/candidate/Assessment'));
const SystemCheck = lazy(() => import('./pages/candidate/SystemCheck'));
const InterviewHistory = lazy(() => import('./pages/candidate/InterviewHistory'));
const CandidateMessages = lazy(() => import('./pages/candidate/Messages'));
const AccountSettings = lazy(() => import('./pages/candidate/AccountSettings'));
const GettingStarted = lazy(() => import('./pages/candidate/GettingStarted'));
const InterviewTips = lazy(() => import('./pages/candidate/InterviewTips'));
const Troubleshooting = lazy(() => import('./pages/candidate/Troubleshooting'));
const InterviewStart = lazy(() => import('./pages/candidate/InterviewStart'));

const EmployerDashboard = lazy(() => import('./pages/employer/Dashboard'));
const EmployerProfile = lazy(() => import('./pages/employer/Profile'));
const EmployerSettings = lazy(() => import('./pages/employer/Settings'));
const EmployerSecurity = lazy(() => import('./pages/employer/Security'));
const EmployerNotifications = lazy(() => import('./pages/employer/Notifications'));
const EmployerActivity = lazy(() => import('./pages/employer/Activity'));
const EmployerJobs = lazy(() => import('./pages/employer/Jobs'));
const CreateJob = lazy(() => import('./pages/employer/CreateJob'));
const EditJob = lazy(() => import('./pages/employer/EditJob'));
const JobCandidates = lazy(() => import('./pages/employer/JobCandidates'));
const EmployerAnalytics = lazy(() => import('./pages/employer/Analytics'));
const EmployerSubscription = lazy(() => import('./pages/employer/Subscription'));
const ApplicantTracking = lazy(() => import('./pages/employer/ApplicantTracking'));
const InterviewCalendar = lazy(() => import('./pages/employer/InterviewCalendar'));
const Inbox = lazy(() => import('./pages/employer/Inbox'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminCompanies = lazy(() => import('./pages/admin/Companies'));
const AdminJobs = lazy(() => import('./pages/admin/Jobs'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminLogs = lazy(() => import('./pages/admin/Logs'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminSecurity = lazy(() => import('./pages/admin/Security'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminActivity = lazy(() => import('./pages/admin/Activity'));
const SessionMonitoring = lazy(() => import('./pages/admin/SessionMonitoring'));
const SupportTickets = lazy(() => import('./pages/admin/SupportTickets'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));

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
            <Route 
              path="/payment/success" 
              element={
                <PrivateRoute>
                  <Suspense fallback={<Loading />}>
                    <PaymentSuccess />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            
            {/* Candidate Routes */}
            <Route 
              path="/candidate/dashboard" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateDashboard />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/profile" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateProfile />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/settings" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateSettings />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/security" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateSecurity />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/notifications" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateNotifications />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/activity" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateActivity />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/applications" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateApplications />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/interviews" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateInterviews />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/interview/:interviewId/payment" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <InterviewPayment />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/interview/:id" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <InterviewSession />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/interview/start/:jobId/:applicationId" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <InterviewStart />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/interview/:id/report" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <InterviewReport />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/payments" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidatePayments />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            {/* Payment History Route - Temporarily disabled */}
            {/* <Route 
              path="/candidate/payment-history" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <PaymentHistory />
                  </Suspense>
                </PrivateRoute>
              } 
            /> */}
            <Route 
              path="/candidate/results" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <InterviewInsights />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/support" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <HelpCenter />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/saved-jobs" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <SavedJobs />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/job-alerts" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <JobAlerts />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/resume" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <Resume />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/invitations" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <Invitations />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/practice" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <Practice />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/assessment" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <Assessment />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/system-check" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <SystemCheck />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/interview-history" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <InterviewHistory />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/messages" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <CandidateMessages />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/account-settings" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <AccountSettings />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/getting-started" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <GettingStarted />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/interview-tips" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <InterviewTips />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/candidate/troubleshooting" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <Troubleshooting />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/help-center" 
              element={
                <PrivateRoute role="candidate">
                  <Suspense fallback={<Loading />}>
                    <HelpCenter />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            
            {/* Employer Routes */}
            <Route 
              path="/employer/dashboard" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerDashboard />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/profile" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerProfile />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/settings" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerSettings />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/security" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerSecurity />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/notifications" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerNotifications />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/activity" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerActivity />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/jobs" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerJobs />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/jobs/create" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <CreateJob />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/jobs/:id/edit" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EditJob />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/jobs/:id/candidates" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <JobCandidates />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/analytics" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerAnalytics />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/subscription" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <EmployerSubscription />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/candidates" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <ApplicantTracking />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/schedule" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <InterviewCalendar />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/employer/messages" 
              element={
                <PrivateRoute role="employer">
                  <Suspense fallback={<Loading />}>
                    <Inbox />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminDashboard />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminSettings />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/security" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminSecurity />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminNotifications />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/activity" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminActivity />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminUsers />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/companies" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminCompanies />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/jobs" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminJobs />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/payments" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminPayments />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminAnalytics />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/logs" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <AdminLogs />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/session-monitoring" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <SessionMonitoring />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/support-tickets" 
              element={
                <PrivateRoute role="admin">
                  <Suspense fallback={<Loading />}>
                    <SupportTickets />
                  </Suspense>
                </PrivateRoute>
              } 
            />
            
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
