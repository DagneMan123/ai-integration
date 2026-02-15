import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUsers, FiBriefcase, FiShield, FiArrowRight, FiTarget, FiStar, 
  FiCheckCircle, FiTrendingUp, FiAward, FiZap, FiGlobe, FiLock 
} from 'react-icons/fi';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Animated Background */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-32 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-block mb-6">
              <span className="bg-blue-500/30 text-blue-200 px-6 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-blue-400/30">
                🚀 AI-Powered Recruitment Platform
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight leading-tight">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
                Hiring is Here
              </span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto font-light leading-relaxed mb-12">
              SimuAI revolutionizes recruitment with cutting-edge artificial intelligence, 
              creating a fair, transparent, and efficient hiring ecosystem for Ethiopia and beyond.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link 
                to="/register" 
                className="bg-white text-blue-900 px-10 py-4 rounded-full font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Get Started Free <FiArrowRight />
              </Link>
              <Link 
                to="/jobs" 
                className="border-2 border-white/50 text-white px-10 py-4 rounded-full font-bold hover:bg-white/10 backdrop-blur-sm transition-all"
              >
                Explore Jobs
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-10 left-0 right-0 z-10">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 px-4">
            <StatCard number="10K+" label="Active Users" />
            <StatCard number="500+" label="Companies" />
            <StatCard number="95%" label="Success Rate" />
          </div>
        </div>
      </section>

      {/* Mission & Vision with Dashboard Preview */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="animate-slide-in-left">
              <div className="inline-block mb-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit">
                  <FiTarget /> Our Mission
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Empowering Talent Through AI
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                We're on a mission to transform the Ethiopian job market by providing a fair, 
                transparent, and highly efficient recruitment ecosystem. Every candidate deserves 
                a chance to showcase their true potential through unbiased AI-driven evaluation.
              </p>
              
              <div className="space-y-4 mb-8">
                <FeatureItem icon={<FiCheckCircle />} text="Unbiased AI-powered interviews" />
                <FeatureItem icon={<FiCheckCircle />} text="Real-time performance analytics" />
                <FeatureItem icon={<FiCheckCircle />} text="Instant feedback and reports" />
                <FeatureItem icon={<FiCheckCircle />} text="Secure and confidential process" />
              </div>

              <div className="flex gap-4 flex-wrap">
                <Badge icon={<FiStar />} text="Innovative" color="yellow" />
                <Badge icon={<FiAward />} text="Fair Evaluation" color="blue" />
                <Badge icon={<FiZap />} text="Future Ready" color="purple" />
              </div>
            </div>
            
            {/* Animated Dashboard Preview */}
            <div className="animate-slide-in-right">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Three Dashboard Experiences */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Three Specialized Dashboards
              </span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              One Platform, Three Experiences
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored workflows designed specifically for every stakeholder in the hiring journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <DashboardCard 
              icon={<FiUsers />} 
              title="For Candidates" 
              color="blue"
              features={[
                "AI Interview Practice",
                "Profile Builder",
                "Application Tracking",
                "Performance Analytics",
                "Interview Reports"
              ]}
              image={<CandidateDashboardSVG />}
            />
            
            <DashboardCard 
              icon={<FiBriefcase />} 
              title="For Employers" 
              color="green"
              features={[
                "AI Interview Setup",
                "Candidate Filtering",
                "Hiring Analytics",
                "Team Management",
                "Subscription Plans"
              ]}
              image={<EmployerDashboardSVG />}
            />
            
            <DashboardCard 
              icon={<FiShield />} 
              title="For Administrators" 
              color="purple"
              features={[
                "System Monitoring",
                "Company Verification",
                "Financial Analytics",
                "Activity Logs",
                "Platform Control"
              ]}
              image={<AdminDashboardSVG />}
            />
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SimuAI?</h2>
            <p className="text-xl text-gray-600">Powerful features that set us apart</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FiZap />}
              title="Lightning Fast"
              description="Complete interviews in minutes, not hours. Get instant AI-powered feedback."
              color="yellow"
            />
            <FeatureCard 
              icon={<FiLock />}
              title="Secure & Private"
              description="Bank-level encryption ensures your data is always safe and confidential."
              color="green"
            />
            <FeatureCard 
              icon={<FiGlobe />}
              title="Globally Accessible"
              description="Access from anywhere, anytime. Available 24/7 for your convenience."
              color="blue"
            />
            <FeatureCard 
              icon={<FiTrendingUp />}
              title="Data-Driven Insights"
              description="Make informed decisions with comprehensive analytics and reports."
              color="purple"
            />
            <FeatureCard 
              icon={<FiAward />}
              title="Fair Evaluation"
              description="Unbiased AI assessment ensures every candidate gets a fair chance."
              color="indigo"
            />
            <FeatureCard 
              icon={<FiCheckCircle />}
              title="Proven Results"
              description="95% success rate with thousands of successful placements."
              color="green"
            />
          </div>
        </div>
      </section>

      {/* Access Control Table */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Permissions</h2>
            <p className="text-xl text-gray-600">Clear role-based access control</p>
          </div>
          
          <div className="overflow-hidden rounded-2xl shadow-2xl bg-white border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                  <th className="px-8 py-5 text-left text-lg font-bold">Functionality</th>
                  <th className="px-8 py-5 text-center text-lg font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <FiUsers className="text-blue-400" /> Candidate
                    </div>
                  </th>
                  <th className="px-8 py-5 text-center text-lg font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <FiBriefcase className="text-green-400" /> Employer
                    </div>
                  </th>
                  <th className="px-8 py-5 text-center text-lg font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <FiShield className="text-purple-400" /> Admin
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <TableRow feature="AI Interview Access" can1={true} can2={false} can3={false} />
                <TableRow feature="Create Job Listings" can1={false} can2={true} can3={true} />
                <TableRow feature="View All Applications" can1={false} can2={true} can3={true} />
                <TableRow feature="Company Verification" can1={false} can2={false} can3={true} />
                <TableRow feature="Financial Analytics" can1={false} can2={false} can3={true} />
                <TableRow feature="Profile Management" can1={true} can2={true} can3={true} />
                <TableRow feature="Payment Processing" can1={true} can2={true} can3={true} />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="max-w-5xl mx-auto text-center text-white animate-scale-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-3xl mx-auto">
            Join thousands of professionals and companies leveraging AI for a better future
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center mb-12">
            <Link 
              to="/register" 
              className="bg-white text-blue-900 px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Get Started Free <FiArrowRight />
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              Sign In
            </Link>
          </div>

          <div className="flex gap-8 justify-center text-sm opacity-75">
            <span>✓ No credit card required</span>
            <span>✓ Free forever plan</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  );
};

// ===== SUB-COMPONENTS =====

const StatCard: React.FC<{ number: string; label: string }> = ({ number, label }) => (
  <div className="text-center animate-fade-in-up bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{number}</div>
    <div className="text-sm text-blue-200">{label}</div>
  </div>
);

const FeatureItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-gray-700">
    <div className="text-green-600 text-xl">{icon}</div>
    <span className="text-lg">{text}</span>
  </div>
);

const Badge: React.FC<{ icon: React.ReactNode; text: string; color: string }> = ({ icon, text, color }) => {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${colors[color as keyof typeof colors]}`}>
      {icon} {text}
    </div>
  );
};

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  color: 'blue' | 'green' | 'purple';
  features: string[];
  image: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, color, features, image }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600 border-blue-200',
    green: 'from-green-500 to-green-600 border-green-200',
    purple: 'from-purple-500 to-purple-600 border-purple-200',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden border-2 border-gray-100 animate-fade-in-up">
      <div className={`bg-gradient-to-br ${colorMap[color]} p-6 text-white`}>
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      
      <div className="p-6">
        {image}
        
        <ul className="space-y-3 mt-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-700">
              <FiCheckCircle className="text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Link 
          to="/register" 
          className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Explore Dashboard <FiArrowRight />
        </Link>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({ icon, title, description, color }) => {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
      <div className={`w-14 h-14 rounded-xl ${colors[color as keyof typeof colors]} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

interface TableRowProps {
  feature: string;
  can1: boolean;
  can2: boolean;
  can3: boolean;
}

const TableRow: React.FC<TableRowProps> = ({ feature, can1, can2, can3 }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-8 py-5 font-semibold text-gray-800">{feature}</td>
    <td className="px-8 py-5 text-center text-2xl">{can1 ? '✅' : '❌'}</td>
    <td className="px-8 py-5 text-center text-2xl">{can2 ? '✅' : '❌'}</td>
    <td className="px-8 py-5 text-center text-2xl">{can3 ? '✅' : '❌'}</td>
  </tr>
);

// ===== DASHBOARD SVG PREVIEWS =====

const DashboardPreview: React.FC = () => (
  <div className="relative group">
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-500">
      {/* Browser Window */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer"></div>
          </div>
          <div className="flex-1 ml-4">
            <div className="bg-gray-800 rounded px-3 py-1 text-xs text-gray-400 flex items-center gap-2">
              <span>🔒</span>
              <span>simuai.com/dashboard</span>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-2 bg-gray-700 rounded w-24 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3 transform hover:scale-110 transition-transform">
              <div className="h-2 bg-blue-400 rounded w-8 mb-2"></div>
              <div className="h-4 bg-blue-300 rounded w-12"></div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-3 transform hover:scale-110 transition-transform" style={{ transitionDelay: '0.1s' }}>
              <div className="h-2 bg-purple-400 rounded w-8 mb-2"></div>
              <div className="h-4 bg-purple-300 rounded w-12"></div>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg p-3 transform hover:scale-110 transition-transform" style={{ transitionDelay: '0.2s' }}>
              <div className="h-2 bg-pink-400 rounded w-8 mb-2"></div>
              <div className="h-4 bg-pink-300 rounded w-12"></div>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="bg-gray-900 rounded-lg p-4 mt-4">
            <div className="h-2 bg-gray-700 rounded w-20 mb-3"></div>
            <div className="flex items-end gap-2 h-24">
              <div className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t animate-pulse" style={{ height: '60%', animationDelay: '0s' }}></div>
              <div className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t animate-pulse" style={{ height: '80%', animationDelay: '0.2s' }}></div>
              <div className="flex-1 bg-gradient-to-t from-pink-600 to-pink-400 rounded-t animate-pulse" style={{ height: '45%', animationDelay: '0.4s' }}></div>
              <div className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t animate-pulse" style={{ height: '90%', animationDelay: '0.6s' }}></div>
              <div className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t animate-pulse" style={{ height: '70%', animationDelay: '0.8s' }}></div>
            </div>
          </div>
          
          {/* Activity List */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-3 bg-gray-900 rounded p-2 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="h-2 bg-gray-700 rounded flex-1"></div>
            </div>
            <div className="flex items-center gap-3 bg-gray-900 rounded p-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="h-2 bg-gray-700 rounded flex-1"></div>
            </div>
            <div className="flex items-center gap-3 bg-gray-900 rounded p-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <div className="h-2 bg-gray-700 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CandidateDashboardSVG: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 h-48 relative overflow-hidden group">
    {/* Animated Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 rounded-full filter blur-2xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
    
    <div className="relative space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <div className="h-3 bg-blue-400 rounded w-24 animate-pulse"></div>
          <div className="h-2 bg-blue-300 rounded w-16 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">
          AI
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/60 backdrop-blur-sm rounded p-2 transform hover:scale-105 transition-transform">
          <div className="h-2 bg-blue-500 rounded w-6 mb-1"></div>
          <div className="h-3 bg-blue-600 rounded w-8"></div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded p-2 transform hover:scale-105 transition-transform" style={{ transitionDelay: '0.1s' }}>
          <div className="h-2 bg-cyan-500 rounded w-6 mb-1"></div>
          <div className="h-3 bg-cyan-600 rounded w-8"></div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded p-2 transform hover:scale-105 transition-transform" style={{ transitionDelay: '0.2s' }}>
          <div className="h-2 bg-indigo-500 rounded w-6 mb-1"></div>
          <div className="h-3 bg-indigo-600 rounded w-8"></div>
        </div>
      </div>
      
      {/* Main Feature Card */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3 shadow-lg transform group-hover:scale-105 transition-transform">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-white/30 backdrop-blur-sm"></div>
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-white/60 rounded w-20"></div>
            <div className="h-1.5 bg-white/40 rounded w-16"></div>
          </div>
        </div>
        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
      </div>
      
      {/* Activity Items */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded p-1.5 animate-fade-in-up">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <div className="h-1.5 bg-blue-300 rounded flex-1"></div>
          <div className="h-1.5 bg-blue-200 rounded w-8"></div>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded p-1.5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="h-1.5 bg-blue-300 rounded flex-1"></div>
          <div className="h-1.5 bg-blue-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  </div>
);

const EmployerDashboardSVG: React.FC = () => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4 h-48 relative overflow-hidden group">
    {/* Animated Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-32 h-32 bg-green-400 rounded-full filter blur-2xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-400 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
    
    <div className="relative space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <div className="h-3 bg-green-400 rounded w-20 animate-pulse"></div>
          <div className="h-2 bg-green-300 rounded w-12 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">
          ⚡
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/60 backdrop-blur-sm rounded p-2.5 transform hover:scale-105 transition-transform">
          <div className="h-2 bg-green-500 rounded w-8 mb-1.5"></div>
          <div className="h-4 bg-green-600 rounded w-12"></div>
          <div className="h-1.5 bg-green-300 rounded w-16 mt-1"></div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded p-2.5 transform hover:scale-105 transition-transform" style={{ transitionDelay: '0.1s' }}>
          <div className="h-2 bg-emerald-500 rounded w-8 mb-1.5"></div>
          <div className="h-4 bg-emerald-600 rounded w-12"></div>
          <div className="h-1.5 bg-emerald-300 rounded w-16 mt-1"></div>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2.5 shadow-lg transform group-hover:scale-105 transition-transform">
        <div className="h-1.5 bg-white/40 rounded w-12 mb-2"></div>
        <div className="flex items-end gap-1 h-12">
          <div className="flex-1 bg-white/60 rounded-t animate-pulse" style={{ height: '50%', animationDelay: '0s' }}></div>
          <div className="flex-1 bg-white/60 rounded-t animate-pulse" style={{ height: '75%', animationDelay: '0.2s' }}></div>
          <div className="flex-1 bg-white/60 rounded-t animate-pulse" style={{ height: '60%', animationDelay: '0.4s' }}></div>
          <div className="flex-1 bg-white/60 rounded-t animate-pulse" style={{ height: '85%', animationDelay: '0.6s' }}></div>
          <div className="flex-1 bg-white/60 rounded-t animate-pulse" style={{ height: '70%', animationDelay: '0.8s' }}></div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex gap-1.5">
        <div className="flex-1 bg-white/50 backdrop-blur-sm rounded p-1.5 text-center transform hover:scale-105 transition-transform">
          <div className="h-1.5 bg-green-400 rounded w-full"></div>
        </div>
        <div className="flex-1 bg-white/50 backdrop-blur-sm rounded p-1.5 text-center transform hover:scale-105 transition-transform" style={{ transitionDelay: '0.1s' }}>
          <div className="h-1.5 bg-emerald-400 rounded w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboardSVG: React.FC = () => (
  <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg p-4 h-48 relative overflow-hidden group">
    {/* Animated Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 rounded-full filter blur-2xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
    
    <div className="relative space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <div className="h-3 bg-purple-400 rounded w-28 animate-pulse"></div>
          <div className="h-2 bg-purple-300 rounded w-20 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">
          ⚙️
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="bg-white/60 backdrop-blur-sm rounded p-1.5 transform hover:scale-110 transition-transform">
          <div className="h-2 bg-purple-500 rounded w-full mb-1"></div>
          <div className="h-2.5 bg-purple-600 rounded w-full"></div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded p-1.5 transform hover:scale-110 transition-transform" style={{ transitionDelay: '0.1s' }}>
          <div className="h-2 bg-pink-500 rounded w-full mb-1"></div>
          <div className="h-2.5 bg-pink-600 rounded w-full"></div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded p-1.5 transform hover:scale-110 transition-transform" style={{ transitionDelay: '0.2s' }}>
          <div className="h-2 bg-indigo-500 rounded w-full mb-1"></div>
          <div className="h-2.5 bg-indigo-600 rounded w-full"></div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded p-1.5 transform hover:scale-110 transition-transform" style={{ transitionDelay: '0.3s' }}>
          <div className="h-2 bg-violet-500 rounded w-full mb-1"></div>
          <div className="h-2.5 bg-violet-600 rounded w-full"></div>
        </div>
      </div>
      
      {/* Main Analytics Card */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2.5 shadow-lg transform group-hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-2">
          <div className="h-2 bg-white/40 rounded w-16"></div>
          <div className="h-2 bg-white/40 rounded w-8"></div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-white/30 backdrop-blur-sm rounded p-1.5">
            <div className="h-1.5 bg-white/60 rounded w-full mb-1"></div>
            <div className="h-2 bg-white/80 rounded w-full"></div>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded p-1.5">
            <div className="h-1.5 bg-white/60 rounded w-full mb-1"></div>
            <div className="h-2 bg-white/80 rounded w-full"></div>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded p-1.5">
            <div className="h-1.5 bg-white/60 rounded w-full mb-1"></div>
            <div className="h-2 bg-white/80 rounded w-full"></div>
          </div>
        </div>
      </div>
      
      {/* Activity Monitor */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded p-1.5 animate-fade-in-up">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <div className="h-1.5 bg-purple-300 rounded flex-1"></div>
          <div className="h-1.5 bg-purple-200 rounded w-6"></div>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded p-1.5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
          <div className="h-1.5 bg-purple-300 rounded flex-1"></div>
          <div className="h-1.5 bg-purple-200 rounded w-6"></div>
        </div>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded p-1.5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="h-1.5 bg-purple-300 rounded flex-1"></div>
          <div className="h-1.5 bg-purple-200 rounded w-6"></div>
        </div>
      </div>
    </div>
  </div>
);

export default About;
