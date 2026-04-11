import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  BrainCircuit,
  PlayCircle,
  Sparkles
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      
      {/* 1. Hero Section - The First Impression */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-40 pointer-events-none">
            <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-300 rounded-full blur-[150px]" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-current" /> AI-Powered Recruitment Platform
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Hire Top Talent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
                10x Faster
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              SimuAI automates candidate screening with AI-proctored interviews, neural grading, and deep evaluation reports. Focus on hiring, not filtering.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register" className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95">
                Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/jobs" className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:border-blue-300 hover:bg-blue-50 transition-all">
                <PlayCircle className="w-5 h-5 text-blue-600" /> Watch Demo
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm font-semibold pt-4">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> No Credit Card Required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Cancel Anytime</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> 14-Day Free Trial</span>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="relative max-w-5xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl overflow-hidden p-6 border border-blue-500/20">
              <div className="w-full h-full bg-slate-900 rounded-xl border border-white/10 flex items-center justify-center p-8">
                <div className="w-full space-y-4">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-24 bg-blue-500/20 rounded-lg" />
                    <div className="h-24 bg-emerald-500/20 rounded-lg" />
                    <div className="h-24 bg-purple-500/20 rounded-lg" />
                  </div>
                  <div className="h-40 bg-white/5 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trusted By Section (Social Proof) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
         <div className="max-w-7xl mx-auto px-6 text-center">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-10">Trusted by leading companies</p>
           <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60">
              {/* Companies will be fetched from database */}
              <p className="text-slate-500">Loading companies...</p>
           </div>
         </div>
      </section>

      {/* 3. Three Experience Dashboards */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Platform Ecosystem</h2>
          <p className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Built for everyone.</p>
          <p className="text-lg text-slate-600 font-medium mt-4 max-w-2xl mx-auto">Tailored experiences for candidates, employers, and administrators.</p>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <DashboardCard 
            icon={<Users className="w-6 h-6 text-blue-600" />}
            title="For Candidates"
            desc="Practice with AI, get detailed feedback, and land your dream job with confidence."
            color="blue"
            features={["AI Practice Interviews", "Neural Evaluation Reports", "Quick Apply"]}
          />
          <DashboardCard 
            icon={<Briefcase className="w-6 h-6 text-emerald-600" />}
            title="For Employers"
            desc="Screen thousands of candidates efficiently with AI proctoring and intelligent grading."
            color="emerald"
            features={["Smart Job Management", "Neural Screening", "Hiring Analytics"]}
          />
          <DashboardCard 
            icon={<ShieldCheck className="w-6 h-6 text-purple-600" />}
            title="For Administrators"
            desc="Complete platform oversight, company verification, and financial management."
            color="purple"
            features={["User Management", "Platform Audits", "Payment Oversight"]}
          />
        </div>
      </section>

      {/* 4. Why SimuAI (Core Features) */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <FeatureItem icon={<BrainCircuit className="text-blue-600 w-6 h-6" />} title="Neural Grading" desc="AI understands context and nuance, not just keywords." />
              <FeatureItem icon={<ShieldCheck className="text-emerald-600 w-6 h-6" />} title="Anti-Cheat AI" desc="Proprietary proctoring ensures interview integrity." />
              <FeatureItem icon={<BarChart3 className="text-purple-600 w-6 h-6" />} title="Deep Analytics" desc="Make decisions based on 100+ data points per candidate." />
              <FeatureItem icon={<Zap className="text-amber-500 w-6 h-6" />} title="Instant Setup" desc="Launch your first job posting in under 2 minutes." />
            </div>
            <div className="space-y-6">
              <h2 className="text-5xl font-black text-slate-900 leading-tight">Why companies choose SimuAI.</h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Stop wasting hours on manual screening. Our AI engine evaluates candidates with precision, giving your team more time to focus on what matters: building great teams.
              </p>
              <div className="pt-4">
                <Link to="/about" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-4 transition-all text-lg">
                  Learn about our methodology <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-[120px] opacity-20" />
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Ready to transform hiring?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">Join 500+ companies using SimuAI to hire smarter, faster, and with confidence.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-lg">Get Started Free</Link>
              <Link to="/about" className="bg-blue-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-400 transition-all border border-blue-400">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

/* --- Sub-Components --- */

const DashboardCard = ({ icon, title, desc, color, features }: any) => {
  const colors: any = {
    blue: "bg-blue-50 border-blue-200 shadow-blue-100",
    emerald: "bg-emerald-50 border-emerald-200 shadow-emerald-100",
    purple: "bg-purple-50 border-purple-200 shadow-purple-100"
  };
  return (
    <div className={`p-8 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all group ${colors[color]}`}>
      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 font-medium mb-6 leading-relaxed">{desc}</p>
      <ul className="space-y-2.5 text-left">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <div className="p-6 rounded-2xl hover:bg-white transition-colors group">
    <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-sm text-slate-600 font-medium leading-relaxed">{desc}</p>
  </div>
);

export default Home;