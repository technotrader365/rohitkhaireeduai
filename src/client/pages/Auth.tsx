
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Auth: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('user_session', 'token_123');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80" 
            alt="Students studying" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/40 to-indigo-900/10"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">EduPulse AI</h1>
          <p className="text-indigo-200 font-medium">Student Success Platform</p>
        </div>
        
        <div className="relative z-10 max-w-md">
           <h2 className="text-3xl font-bold mb-6 leading-tight">"Empowering the next generation of innovators with AI-driven insights."</h2>
           <div className="flex gap-2">
              <div className="w-12 h-1 bg-white rounded-full"></div>
              <div className="w-4 h-1 bg-white/30 rounded-full"></div>
              <div className="w-4 h-1 bg-white/30 rounded-full"></div>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
           <div className="mb-8">
             <h3 className="text-2xl font-bold text-slate-900 mb-2">
               {mode === 'login' ? 'Welcome Back' : 'Create Account'}
             </h3>
             <p className="text-slate-500 text-sm">
               {mode === 'login' ? 'Access your personalized learning dashboard.' : 'Join the AI-enhanced student success network.'}
             </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="student@university.edu"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 rounded-xl text-sm font-bold flex justify-center items-center gap-2 mt-6"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {mode === 'login' ? 'Sign In' : 'Get Started'}
              </button>
           </form>

           <div className="mt-8 text-center text-sm">
             <span className="text-slate-500">
               {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
             </span>
             <button 
               onClick={() => navigate(mode === 'login' ? '/signup' : '/login')}
               className="ml-2 font-bold text-indigo-600 hover:underline"
             >
               {mode === 'login' ? 'Sign up' : 'Log in'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
