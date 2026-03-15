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
  PlayCircle
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      
      {/* 1. Hero Section - The First Impression */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b border-gray-50">
        {/* Background Blur Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-400 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center lg:text-left flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest animate-fade-in">
              <Zap className="w-3 h-3 fill-current" /> AI-Native Recruitment
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Hire the best <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                10x faster
              </span> with AI.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              SimuAI automates the entire screening process. From AI-proctored interviews to deep neural evaluation reports.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/register" className="group flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">
                Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/jobs" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                <PlayCircle className="w-5 h-5 text-blue-600" /> Watch Demo
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 text-slate-400 text-sm font-bold uppercase tracking-tighter">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Card Required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel Anytime</span>
            </div>
          </div>

          {/* Hero Image/Mockup Placeholder */}
          <div className="flex-1 w-full max-w-[600px] relative animate-in fade-in zoom-in duration-1000">
            <div className="aspect-square bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-[3rem] shadow-2xl overflow-hidden p-4 rotate-3 hover:rotate-0 transition-transform duration-500">
               <div className="w-full h-full bg-slate-900 rounded-[2rem] border border-white/20 flex items-center justify-center p-8">
                  {/* Dashboard Preview Drawing */}
                  <div className="w-full space-y-4">
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="grid grid-cols-3 gap-2">
                       <div className="h-20 bg-blue-500/20 rounded-xl" />
                       <div className="h-20 bg-emerald-500/20 rounded-xl" />
                       <div className="h-20 bg-purple-500/20 rounded-xl" />
                    </div>
                    <div className="h-32 bg-white/5 rounded-2xl" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trusted By Section (Social Proof) */}
      <section className="py-12 bg-white border-b border-gray-50 text-center">
         <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Trusted by industry leaders</p>
         <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
            <h3 className="text-2xl font-black">TECH-ETHIO</h3>
            <h3 className="text-2xl font-black">ABYSSINIA</h3>
            <h3 className="text-2xl font-black">SAFARICOM</h3>
            <h3 className="text-2xl font-black">ZALA-SOFT</h3>
         </div>
      </section>

      {/* 3. Three Experience Dashboards */}
      <section className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Ecosystem</h2>
          <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Tailored experiences for everyone.</p>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <DashboardCard 
            icon={<Users className="w-6 h-6 text-blue-600" />}
            title="Candidates"
            desc="Practice AI interviews, build your neural profile, and land your dream job."
            color="blue"
            features={["AI Practice Mode", "Evaluation Reports", "Quick Apply"]}
          />
          <DashboardCard 
            icon={<Briefcase className="w-6 h-6 text-emerald-600" />}
            title="Employers"
            desc="Screen thousands of candidates in minutes with AI proctoring and grading."
            color="emerald"
            features={["Job Management", "Neural Screening", "Hiring Funnels"]}
          />
          <DashboardCard 
            icon={<ShieldCheck className="w-6 h-6 text-purple-600" />}
            title="Administrators"
            desc="Complete oversight of the platform, company verifications, and financial health."
            color="purple"
            features={["User Management", "Platform Audits", "Payment Oversight"]}
          />
        </div>
      </section>

      {/* 4. Why SimuAI (Core Features) */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <FeatureItem icon={<BrainCircuit className="text-blue-600" />} title="Neural Grading" desc="AI understands context, not just keywords." />
            <FeatureItem icon={<ShieldCheck className="text-emerald-600" />} title="Anti-Cheat" desc="Proprietary AI proctoring ensures integrity." />
            <FeatureItem icon={<BarChart3 className="text-purple-600" />} title="Data Insights" desc="Make decisions based on 100+ data points." />
            <FeatureItem icon={<Zap className="text-amber-500" />} title="Instant Setup" desc="Go live with a job post in under 2 minutes." />
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-black text-slate-900 leading-tight">The recruitment machine your team deserves.</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Stop wasting hours on manual screening. SimuAI's engine evaluates candidates with precision, giving you more time to focus on building your team.
            </p>
            <div className="pt-4">
               <Link to="/about" className="text-blue-600 font-black flex items-center gap-2 hover:gap-4 transition-all">
                  Learn about our methodology <ArrowRight className="w-5 h-5" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to hire smarter?</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join 500+ companies transforming their talent acquisition with SimuAI.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/register" className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all active:scale-95">Get Started Free</Link>
             <Link to="/contact" className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all border border-slate-700">Book a Demo</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

/* --- Sub-Components --- */

const DashboardCard = ({ icon, title, desc, color, features }: any) => {
  const colors: any = {
    blue: "bg-blue-50 border-blue-100 shadow-blue-100",
    emerald: "bg-emerald-50 border-emerald-100 shadow-emerald-100",
    purple: "bg-purple-50 border-purple-100 shadow-purple-100"
  };
  return (
    <div className={`p-10 rounded-[2.5rem] border bg-white shadow-sm hover:shadow-xl transition-all group ${colors[color]}`}>
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium mb-8 leading-relaxed">{desc}</p>
      <ul className="space-y-3 text-left">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-2.5 text-sm font-bold text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <div className="p-6 rounded-3xl hover:bg-slate-50 transition-colors group">
    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-lg font-black text-slate-900 mb-1">{title}</h4>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

export default Home;