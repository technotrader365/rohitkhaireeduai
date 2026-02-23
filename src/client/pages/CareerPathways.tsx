
import React, { useState, useEffect } from 'react';
import { getCareerIntelligence } from '../services/geminiService';
import { CareerRecommendation } from '../types';

export const CareerPathways: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulating a student profile summary passed to the AI
      const profile = "Final year Computer Science student, strong in React and TypeScript, enjoys problem-solving, GPA 3.8, interested in user experience.";
      const data = await getCareerIntelligence(profile);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No career paths found");
      }
      setRecommendations(data);
    } catch (err) {
      console.error(err);
      setError("Unable to generate career insights. Please check your connection and API key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Career Intelligence</h2>
          <p className="text-slate-500">AI-driven pathfinding based on your skills and performance.</p>
        </div>
        <button 
          onClick={fetchRecommendations}
          disabled={loading}
          className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </header>

      {error ? (
        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center">
          <p className="text-red-600 font-bold mb-2">⚠ AI Service Error</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button onClick={fetchRecommendations} className="text-xs font-bold text-red-700 underline">Try Again</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse h-64">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4"></div>
              <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-6"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                <div className="h-3 bg-slate-100 rounded-full w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((path, i) => (
            <div key={i} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all cursor-default">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Match</p>
                  <p className="text-lg font-bold text-indigo-600">{path.matchScore}%</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">{path.role}</h3>
              <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
                <span>⏱️</span> Expected timeline: {path.timeline}
              </p>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase">Top Skills Required</p>
                <div className="flex flex-wrap gap-2">
                  {path.requiredSkills.map((skill, si) => (
                    <span key={si} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full mt-8 py-3 rounded-xl border border-indigo-100 text-indigo-600 text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all">
                Explore Pathway
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Aggregated Opportunities</h3>
          <p className="text-indigo-100 max-w-lg mb-6">
            We've scanned LinkedIn, Indeed, and the university job board to find roles that match your AI Career Path.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-sm font-bold">Frontend Intern @ TechCorp</p>
              <p className="text-xs text-white/70 mt-1">Remote • Closes in 3 days</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-sm font-bold">Junior Web Dev @ CreativeLab</p>
              <p className="text-xs text-white/70 mt-1">Sydney, AU • Competitive</p>
            </div>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-5%] text-[10rem] opacity-10">💼</div>
      </div>
    </div>
  );
};
