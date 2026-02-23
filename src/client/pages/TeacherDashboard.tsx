
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis } from 'recharts';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { serviceNow } from '../services/serviceNowService';

export const TeacherDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    avg: 78,
    atRisk: 3,
    totalStudents: 60,
    loading: false
  });

  const [riskData, setRiskData] = useState([
    { level: 'High Risk', count: 3 },
    { level: 'Medium', count: 12 },
    { level: 'Low Risk', count: 45 },
  ]);

  useEffect(() => {
    if (serviceNow.isConnected()) {
      setStats(prev => ({ ...prev, loading: true }));
      serviceNow.getStudents().then(students => {
        const total = students.length;
        if (total === 0) return;

        const low = students.filter(s => s.gpa >= 3.0).length;
        const medium = students.filter(s => s.gpa >= 2.0 && s.gpa < 3.0).length;
        const high = students.filter(s => s.gpa < 2.0).length;
        
        const avgAtt = Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / total);

        setStats({
          avg: avgAtt,
          atRisk: high,
          totalStudents: total,
          loading: false
        });

        setRiskData([
          { level: 'High Risk', count: high },
          { level: 'Medium', count: medium },
          { level: 'Low Risk', count: low },
        ]);
      }).finally(() => setStats(prev => ({ ...prev, loading: false })));
    }
  }, []);

  const classPerformanceData = [
    { day: 'Mon', avg: 75 },
    { day: 'Tue', avg: 78 },
    { day: 'Wed', avg: 76 },
    { day: 'Thu', avg: 82 },
    { day: 'Fri', avg: stats.avg },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="relative z-10">
             <div className="flex justify-between">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome, {user.name}</h2>
                {stats.loading && <span className="text-xs font-bold text-indigo-500 animate-pulse">Syncing...</span>}
             </div>
             <p className="text-slate-500 text-sm mb-6">Here is your Class Performance Overview.</p>
             
             <div className="flex gap-8">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Avg Attendance</p>
                  <p className="text-3xl font-black text-slate-900">{stats.avg}%</p>
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">At Risk</p>
                  <div className={`inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-xs font-bold border ${stats.atRisk > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                     <span className={`w-2 h-2 rounded-full ${stats.atRisk > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                     {stats.atRisk} Students
                  </div>
               </div>
             </div>
           </div>
           <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-50 to-transparent"></div>
        </div>

        {/* Quick Actions */}
        <div className="w-full md:w-1/3 grid grid-cols-2 gap-4">
           <button onClick={() => navigate('/assessments')} className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200 transition-all flex flex-col justify-center items-center gap-2">
              <span className="text-3xl">📝</span>
              <span className="text-xs font-bold">New Quiz</span>
           </button>
           <button onClick={() => navigate('/student-insights')} className="bg-white hover:bg-slate-50 text-slate-900 p-6 rounded-3xl border border-slate-200 transition-all flex flex-col justify-center items-center gap-2">
              <span className="text-3xl">🧠</span>
              <span className="text-xs font-bold">AI Insights</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-80">
           <h3 className="font-bold text-slate-800 mb-4">Class Performance Trend</h3>
           <ResponsiveContainer width="100%" height="90%">
             <AreaChart data={classPerformanceData}>
                <defs>
                   <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="avg" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-80">
           <h3 className="font-bold text-slate-800 mb-4">Risk Distribution (GPA)</h3>
           <ResponsiveContainer width="100%" height="90%">
             <BarChart data={riskData}>
                <XAxis dataKey="level" tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
      
      {/* ... keeping the rest similar for layout purposes ... */}
    </div>
  );
};
