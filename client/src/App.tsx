import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

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

// Candidate Pages
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/Profile';
import CandidateApplications from './pages/candidate/Applications';
import CandidateInterviews from './pages/candidate/Interviews';
import InterviewSession from './pages/candidate/InterviewSession';
import InterviewReport from './pages/candidate/InterviewReport';
import CandidatePayments from './pages/candidate/Payments';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerProfile from './pages/employer/Profile';
import EmployerJobs from './pages/employer/Jobs';
import CreateJob from './pages/employer/CreateJob';
import EditJob from './pages/employer/EditJob';
import JobCandidates from './pages/employer/JobCandidates';
import EmployerAnalytics from './pages/employer/Analytics';
import EmployerSubscription from './pages/employer/Subscription';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCompanies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';
import AdminPayments from './pages/admin/Payments';
import AdminAnalytics from './pages/admin/Analytics';
import AdminLogs from './pages/admin/Logs';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

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
                <CandidateDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/candidate/profile" 
            element={
              <PrivateRoute role="candidate">
                <CandidateProfile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/candidate/applications" 
            element={
              <PrivateRoute role="candidate">
                <CandidateApplications />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/candidate/interviews" 
            element={
              <PrivateRoute role="candidate">
                <CandidateInterviews />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/candidate/interview/:id" 
            element={
              <PrivateRoute role="candidate">
                <InterviewSession />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/candidate/interview/:id/report" 
            element={
              <PrivateRoute role="candidate">
                <InterviewReport />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/candidate/payments" 
            element={
              <PrivateRoute role="candidate">
                <CandidatePayments />
              </PrivateRoute>
            } 
          />
          
          {/* Employer Routes */}
          <Route 
            path="/employer/dashboard" 
            element={
              <PrivateRoute role="employer">
                <EmployerDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employer/profile" 
            element={
              <PrivateRoute role="employer">
                <EmployerProfile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employer/jobs" 
            element={
              <PrivateRoute role="employer">
                <EmployerJobs />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employer/jobs/create" 
            element={
              <PrivateRoute role="employer">
                <CreateJob />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employer/jobs/:id/edit" 
            element={
              <PrivateRoute role="employer">
                <EditJob />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employer/jobs/:id/candidates" 
            element={
              <PrivateRoute role="employer">
                <JobCandidates />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employer/analytics" 
            element={
              <PrivateRoute role="employer">
                <EmployerAnalytics />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employer/subscription" 
            element={
              <PrivateRoute role="employer">
                <EmployerSubscription />
              </PrivateRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <PrivateRoute role="admin">
                <AdminUsers />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/companies" 
            element={
              <PrivateRoute role="admin">
                <AdminCompanies />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/jobs" 
            element={
              <PrivateRoute role="admin">
                <AdminJobs />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/payments" 
            element={
              <PrivateRoute role="admin">
                <AdminPayments />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <PrivateRoute role="admin">
                <AdminAnalytics />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/logs" 
            element={
              <PrivateRoute role="admin">
                <AdminLogs />
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
