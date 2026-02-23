
import React, { useState, useEffect } from 'react';
import { suggestStudentGoals } from '../services/geminiService';

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const perf = "GPA 3.8, missed 2 labs, strong in frontend, weak in database optimization.";
      const data = await suggestStudentGoals(perf);
      setGoals(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter">Target <span className="gradient-text-snapx italic">Mastery</span></h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.3em] mt-2">AI-Optimized Growth Objectives</p>
        </div>
        <button onClick={fetchSuggestions} className="px-6 py-3 glass-dark rounded-2xl font-bold text-xs hover:text-cyan-400 transition-all border border-white/5">Regenerate Roadmap</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 glass-dark rounded-[2.5rem] animate-pulse"></div>)
        ) : (
          goals.map((g, i) => (
            <div key={i} className="group glass-dark p-8 rounded-[2.5rem] border-white/5 hover:border-cyan-400/30 transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl group-hover:bg-cyan-400/10"></div>
               <div className="flex justify-between items-start mb-6">
                 <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-3 py-1 bg-cyan-400/10 rounded-lg">{g.category}</span>
                 <span className="text-2xl">🎯</span>
               </div>
               <h3 className="text-xl font-bold text-white mb-4 leading-tight">{g.title}</h3>
               <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
                  <span>📅</span> Target: {g.targetDate}
               </div>
               <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-400 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest">Commit to Goal</button>
            </div>
          ))
        )}
      </div>

      <div className="glass-dark p-12 rounded-[3rem] border-white/5">
         <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
            <span className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">✓</span>
            Current Progress
         </h3>
         <div className="space-y-8">
            {[
              { title: 'Fullstack Microservices Mastery', progress: 65, status: 'On Track' },
              { title: 'Algorithms & Complexity (CS301)', progress: 20, status: 'Attention Needed' },
            ].map((p, i) => (
              <div key={i} className="space-y-3">
                 <div className="flex justify-between text-sm font-bold">
                    <span>{p.title}</span>
                    <span className={p.status === 'On Track' ? 'text-emerald-400' : 'text-amber-400'}>{p.status}</span>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full gradient-snapx transition-all duration-1000 shadow-[0_0_10px_rgba(124,58,237,0.5)]" style={{width: `${p.progress}%`}}></div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
