import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiUsers, FiBriefcase, FiTrendingUp } from 'react-icons/fi';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">AI-Powered Interview Platform</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Transform your hiring process with intelligent interview automation
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Get Started Free
            </Link>
            <Link 
              to="/jobs" 
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition text-lg"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Three Specialized Dashboards
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            SimuAI provides role-based dashboards for Candidates, Employers, and Administrators
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Candidate Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Browse jobs, take AI interviews, and track your applications
              </p>
              <ul className="text-sm text-gray-600 text-left space-y-2">
                <li>✓ AI-powered interviews</li>
                <li>✓ Detailed evaluation reports</li>
                <li>✓ Application tracking</li>
                <li>✓ Profile management</li>
              </ul>
            </div>
            <div className="text-center p-6 border-2 border-green-200 rounded-xl hover:border-green-500 transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBriefcase className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Employer Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Post jobs, configure AI interviews, and evaluate candidates
              </p>
              <ul className="text-sm text-gray-600 text-left space-y-2">
                <li>✓ Job posting & management</li>
                <li>✓ AI interview configuration</li>
                <li>✓ Candidate evaluation</li>
                <li>✓ Hiring analytics</li>
              </ul>
            </div>
            <div className="text-center p-6 border-2 border-purple-200 rounded-xl hover:border-purple-500 transition">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-3xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Admin Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Manage users, verify companies, and monitor the platform
              </p>
              <ul className="text-sm text-gray-600 text-left space-y-2">
                <li>✓ User management</li>
                <li>✓ Company verification</li>
                <li>✓ Payment monitoring</li>
                <li>✓ System analytics</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link 
              to="/about" 
              className="inline-block text-primary hover:text-primary-dark font-semibold"
            >
              Learn more about each dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Original Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            Why Choose SimuAI?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">AI-Powered Evaluation</h3>
              <p className="text-gray-600">
                Get instant, unbiased candidate assessments using advanced AI technology
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-3xl text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Matching</h3>
              <p className="text-gray-600">
                Match candidates with jobs based on skills, experience, and cultural fit
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBriefcase className="text-3xl text-warning" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Streamlined Process</h3>
              <p className="text-gray-600">
                Reduce hiring time by 70% with automated interview scheduling and evaluation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-5xl font-bold text-primary mb-2">10,000+</h3>
              <p className="text-gray-600 text-lg">Interviews Conducted</p>
            </div>
            <div className="p-6">
              <h3 className="text-5xl font-bold text-primary mb-2">500+</h3>
              <p className="text-gray-600 text-lg">Companies Trust Us</p>
            </div>
            <div className="p-6">
              <h3 className="text-5xl font-bold text-primary mb-2">95%</h3>
              <p className="text-gray-600 text-lg">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of companies using SimuAI</p>
          <Link 
            to="/register" 
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition text-lg"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
