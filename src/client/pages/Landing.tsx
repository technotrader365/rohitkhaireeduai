
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-x-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center relative z-50">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <span className="font-bold text-xl tracking-tight text-slate-900">EduPulse AI</span>
         </div>
         <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-4 py-2">Log in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary px-6 py-2 rounded-xl text-sm">Get Started</button>
         </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-32 flex flex-col items-center justify-center min-h-[85vh]">
         
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
         </div>

         {/* Floating Context Images (Hidden on mobile, visible on large screens) */}
         <div className="absolute inset-0 w-full h-full pointer-events-none hidden xl:block max-w-[1600px] mx-auto">
            {/* Top Left - Students Collaborating */}
            <div className="absolute top-[15%] left-[2%] w-72 h-48 rounded-2xl shadow-2xl transform -rotate-6 animate-in fade-in zoom-in duration-1000 delay-100 border-4 border-white overflow-hidden">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80" className="w-full h-full object-cover" alt="Collaborating" />
            </div>

            {/* Bottom Left - Focused Study */}
            <div className="absolute bottom-[20%] left-[8%] w-64 h-64 rounded-2xl shadow-2xl transform rotate-3 animate-in fade-in zoom-in duration-1000 delay-300 border-4 border-white overflow-hidden">
                <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80" className="w-full h-full object-cover" alt="Studying" />
            </div>

            {/* Top Right - Success Metric */}
            <div className="absolute top-[18%] right-[5%] bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] transform rotate-3 animate-in fade-in zoom-in duration-1000 delay-200 max-w-[200px] border border-slate-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl mb-3">🚀</div>
                <p className="text-3xl font-black text-slate-900">94%</p>
                <p className="text-xs text-slate-500 font-medium leading-tight">Graduates land jobs within 3 months</p>
            </div>

            {/* Middle Right - Active Learning */}
            <div className="absolute top-[45%] right-[2%] w-80 h-56 rounded-2xl shadow-2xl transform -rotate-3 animate-in fade-in zoom-in duration-1000 delay-500 border-4 border-white overflow-hidden">
                <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80" className="w-full h-full object-cover" alt="Active Learning" />
            </div>
            
            {/* Bottom Right - AI Mentor Badge */}
            <div className="absolute bottom-[15%] right-[15%] bg-slate-900 text-white p-5 rounded-2xl shadow-2xl transform rotate-6 animate-in fade-in zoom-in duration-1000 delay-700 max-w-[220px]">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">🧠</div>
                   <span className="font-bold text-sm">AI Mentor</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">"Your performance in Data Structures has improved by 15% this week!"</p>
            </div>
         </div>

         {/* Central Content */}
         <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-[-50px]">
            <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-indigo-100 animate-in zoom-in inline-block">
              Student Success Platform v2.0
            </span>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
               Proactive engagement driven by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Artificial Intelligence</span>
            </h1>
            
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
               Detect early risks, automate compliance checks, and provide personalized career pathways. The comprehensive OS for modern universities.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button onClick={() => navigate('/signup')} className="btn-primary px-8 py-4 rounded-xl text-lg shadow-xl shadow-indigo-200 transition-transform hover:scale-105">
                  Launch Platform
               </button>
               <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all hover:scale-105">
                  Student Login
               </button>
            </div>
         </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 bg-white">
         {[
            { title: 'Nudge AI', desc: 'Early warning system for attendance and grades.', icon: '🤖' },
            { title: 'Career Intelligence', desc: 'Match skills to market roles instantly.', icon: '🚀' },
            { title: 'Compliance', desc: 'Automated study-from-home audits.', icon: '🛡️' }
         ].map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
               <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mb-6">{f.icon}</div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
               <p className="text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
         ))}
      </div>
    </div>
  );
};
