
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleComplete = () => {
    localStorage.setItem('onboarded', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]"></div>
      
      <div className="max-w-xl w-full glass-dark p-12 rounded-[3rem] shadow-2xl border-white/10 relative z-10 animate-in zoom-in-95 duration-700">
        <div className="mb-10 flex justify-between items-center">
           <div className="flex gap-2">
             {[1, 2, 3].map(s => (
               <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-cyan-400' : 'w-4 bg-slate-800'}`}></div>
             ))}
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step {step} of 3</span>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <h2 className="text-4xl font-black tracking-tighter">Initialize Your <span className="gradient-text-snapx italic">Academy Profile</span></h2>
             <p className="text-slate-400 leading-relaxed">Welcome to the SnapX Intelligence Suite. We're ready to sync your learning patterns with our neural engine.</p>
             <div className="space-y-4 pt-4">
                <input placeholder="Preferred Learning Discipline" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-cyan-400 outline-none transition-all" />
                <input placeholder="Academic Target GPA" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-cyan-400 outline-none transition-all" />
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <h2 className="text-4xl font-black tracking-tighter italic">Career <span className="text-violet-400">Ambition</span></h2>
             <p className="text-slate-400">Our AI needs to know your "North Star". Where do you want to be in 2 years?</p>
             <div className="grid grid-cols-2 gap-4 pt-4">
                {['Fullstack Dev', 'AI Researcher', 'Product Design', 'Cybersec'].map(role => (
                  <button key={role} className="p-4 rounded-2xl border border-white/10 hover:border-violet-400 hover:bg-violet-400/5 transition-all text-xs font-bold">{role}</button>
                ))}
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
             <div className="w-24 h-24 gradient-snapx rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-violet-500/40">🚀</div>
             <h2 className="text-4xl font-black tracking-tighter">Systems <span className="text-emerald-400">Green</span></h2>
             <p className="text-slate-400">Your profile is synced. We've established a persistent link to your ServiceNow workspace.</p>
          </div>
        )}

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-8 py-4 rounded-2xl border border-white/10 font-bold text-sm hover:bg-white/5">Back</button>
          )}
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : handleComplete()} 
            className="flex-1 gradient-snapx py-4 rounded-2xl font-black text-white shadow-xl shadow-violet-500/20 active:scale-95 transition-all"
          >
            {step === 3 ? 'Launch Academy' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
