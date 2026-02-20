import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Loading from './components/Loading';

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
const CandidateApplications = lazy(() => import('./pages/candidate/Applications'));
const CandidateInterviews = lazy(() => import('./pages/candidate/Interviews'));
const InterviewSession = lazy(() => import('./pages/candidate/InterviewSession'));
const InterviewReport = lazy(() => import('./pages/candidate/InterviewReport'));
const CandidatePayments = lazy(() => import('./pages/candidate/Payments'));

const EmployerDashboard = lazy(() => import('./pages/employer/Dashboard'));
const EmployerProfile = lazy(() => import('./pages/employer/Profile'));
const EmployerJobs = lazy(() => import('./pages/employer/Jobs'));
const CreateJob = lazy(() => import('./pages/employer/CreateJob'));
const EditJob = lazy(() => import('./pages/employer/EditJob'));
const JobCandidates = lazy(() => import('./pages/employer/JobCandidates'));
const EmployerAnalytics = lazy(() => import('./pages/employer/Analytics'));
const EmployerSubscription = lazy(() => import('./pages/employer/Subscription'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminCompanies = lazy(() => import('./pages/admin/Companies'));
const AdminJobs = lazy(() => import('./pages/admin/Jobs'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminLogs = lazy(() => import('./pages/admin/Logs'));

const App: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster position="top-right" />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Register />} 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
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
          
          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
