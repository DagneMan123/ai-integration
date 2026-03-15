import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, ArrowRight, Target, Star, 
  CheckCircle2, Award, MousePointer2, Rocket, BrainCircuit
} from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      
      {/* 1. Hero Section - Refined with Framer Motion */}
      <section className="relative bg-[#050a1f] text-white py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" 
          />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-blue-500/20 mb-8">
              <SparkleIcon /> The Future of Recruitment
            </span>
            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
              Simulate Success. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Hire Excellence.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
              SimuAI is Ethiopia's first AI-native talent ecosystem, bridging the gap between potential and opportunity through unbiased neural evaluation.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link to="/register" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group">
                Get Started Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/jobs" className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/10 backdrop-blur-md transition-all">
                Browse Careers
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Process Section - "How it Works" (Yemikerew wosagn hulu) */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-3">The Process</h2>
            <p className="text-4xl font-black text-slate-900">How SimuAI Works</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-12">
            <ProcessStep number="01" title="Create Profile" desc="Build your professional identity with our AI-assisted builder." icon={<Users />} />
            <ProcessStep number="02" title="Find Roles" desc="Discover opportunities matched to your specific skill set." icon={<Target />} />
            <ProcessStep number="03" title="AI Interview" desc="Take a live session proctored by our proprietary AI model." icon={<BrainCircuit />} />
            <ProcessStep number="04" title="Get Hired" desc="Receive instant feedback and connect with top employers." icon={<Award />} />
          </div>
        </div>
      </section>

      {/* 3. Specialized Dashboards (Already good in your code, keeping the logic) */}
      <section className="py-24 px-4 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
           <div className="grid md:grid-cols-3 gap-8">
              <DashboardFeatureCard 
                title="Candidates" 
                desc="A personalized career cockpit for job seekers."
                features={["AI Practice Mode", "Insightful Reports"]}
                color="blue"
              />
              <DashboardFeatureCard 
                title="Employers" 
                desc="The ultimate talent screening powerhouse."
                features={["Automated Grading", "Talent Funnels"]}
                color="emerald"
              />
              <DashboardFeatureCard 
                title="Administrators" 
                desc="Global control and system oversight."
                features={["Financial Tracking", "User Audits"]}
                color="purple"
              />
           </div>
        </div>
      </section>

      {/* 4. Social Proof Section (Yemikerew) */}
      <section className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto border-y border-slate-100 py-20">
          <div className="grid md:grid-cols-3 gap-16 items-center">
            <div className="md:col-span-1">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 italic">"SimuAI cut our hiring time by 70%."</h3>
              <p className="text-slate-500 font-bold">— Head of HR, Abyssinia Tech</p>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale">
               {/* Place company logos here */}
               <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
               <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
               <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
               <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA - High Conversion */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
             <Rocket className="w-64 h-64 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">Ready to hire better?</h2>
          <p className="text-xl text-slate-400 mb-12 relative z-10">Join 500+ companies transforming their talent acquisition.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
            <Link to="/register" className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black hover:bg-slate-100 transition-all shadow-xl">Create Account</Link>
            <Link to="/contact" className="bg-white/10 text-white px-12 py-5 rounded-2xl font-black hover:bg-white/20 backdrop-blur-sm transition-all">Request Demo</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

/* --- Sub-Components --- */

const ProcessStep = ({ number, title, desc, icon }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="group space-y-4"
  >
    <div className="flex items-end justify-between">
      <div className="p-4 bg-slate-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <span className="text-5xl font-black text-slate-100 group-hover:text-blue-50 transition-colors">{number}</span>
    </div>
    <h4 className="text-xl font-black text-slate-900">{title}</h4>
    <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const DashboardFeatureCard = ({ title, desc, features, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600"
  };
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}>
         <MousePointer2 className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 font-medium mb-6">{desc}</p>
      <ul className="space-y-3">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
};

const SparkleIcon = () => (
  <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default About;