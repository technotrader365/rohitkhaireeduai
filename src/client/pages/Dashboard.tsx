
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis } from 'recharts';
import { mockUser, mockRiskProfile, mockNudges, mockEvents } from '../store/mockStore';
import { useNavigate } from 'react-router-dom';
import { AIConsultant } from '../components/AIConsultant';
import { useCourses } from '../context/CourseContext';
import { serviceNow } from '../services/serviceNowService';
import { 
  Layout as LayoutIcon, X, Check, Grid, Clock, Calendar as CalendarIcon, 
  ArrowRight, Shield, Zap, TrendingUp, BookOpen, MoreHorizontal,
  Activity, Flame, ChevronRight, AlertCircle, Info, CheckCircle
} from 'lucide-react';

// Widget Configuration Types
type WidgetId = 'risk' | 'nudge' | 'courses' | 'analytics' | 'compliance' | 'deadlines';

interface WidgetConfig {
  id: WidgetId;
  label: string;
  enabled: boolean;
  colSpan: 'col-span-1' | 'col-span-2' | 'col-span-3';
}

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'risk', label: 'Success Metrics', enabled: true, colSpan: 'col-span-1' },
  { id: 'analytics', label: 'Engagement Trend', enabled: true, colSpan: 'col-span-2' },
  { id: 'nudge', label: 'AI Nudges', enabled: true, colSpan: 'col-span-1' },
  { id: 'courses', label: 'Active Courses', enabled: true, colSpan: 'col-span-2' },
  { id: 'deadlines', label: 'Upcoming Deadlines', enabled: true, colSpan: 'col-span-1' },
  { id: 'compliance', label: 'Compliance Status', enabled: true, colSpan: 'col-span-1' },
];

const activityData = [
  { day: 'Mon', score: 65 },
  { day: 'Tue', score: 72 },
  { day: 'Wed', score: 68 },
  { day: 'Thu', score: 85 },
  { day: 'Fri', score: 80 },
  { day: 'Sat', score: 90 },
  { day: 'Sun', score: 88 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { courses, loading, refreshData } = useCourses();
  const enrolledCourses = courses.filter(c => c.enrolled);

  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('dashboard_layout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (serviceNow.isConnected()) {
      refreshData();
    }
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleWidget = (id: WidgetId) => {
    const newWidgets = widgets.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(newWidgets);
    localStorage.setItem('dashboard_layout', JSON.stringify(newWidgets));
  };

  // --- Components ---

  const RiskWidget = () => {
    const healthScore = Math.round((mockRiskProfile.attendanceScore + mockRiskProfile.submissionRate) / 2);
    
    return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] relative overflow-hidden h-full flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="flex justify-between items-center z-10 mb-6">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Success Metrics
             </h3>
             <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                mockRiskProfile.overallRisk === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                mockRiskProfile.overallRisk === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
             }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                     mockRiskProfile.overallRisk === 'Low' ? 'bg-emerald-500' : 
                     mockRiskProfile.overallRisk === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></span>
                {mockRiskProfile.overallRisk} Risk
             </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
             <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                     <circle cx="72" cy="72" r="60" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                     <circle cx="72" cy="72" r="60" stroke="#4F46E5" strokeWidth="8" fill="transparent" 
                             strokeDasharray={`${2 * Math.PI * 60}`} 
                             strokeDashoffset={`${2 * Math.PI * 60 * (1 - healthScore / 100)}`} 
                             strokeLinecap="round"
                             className="transition-all duration-1000 ease-out" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-black text-slate-800 tracking-tighter">{healthScore}</span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Health Score</span>
                 </div>
             </div>
             
             <div className="flex-1 space-y-5">
                 <div>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm bg-indigo-500"></span> Attendance
                        </span>
                        <span className="font-bold text-slate-800">{mockRiskProfile.attendanceScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full w-0 animate-in slide-in-from-left duration-1000" style={{width: `${mockRiskProfile.attendanceScore}%`}}></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm bg-emerald-500"></span> Assignments
                        </span>
                        <span className="font-bold text-slate-800">{mockRiskProfile.submissionRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-0 animate-in slide-in-from-left duration-1000 delay-100" style={{width: `${mockRiskProfile.submissionRate}%`}}></div>
                    </div>
                 </div>
             </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white ${i===1?'bg-blue-400':i===2?'bg-purple-400':'bg-indigo-400'}`}>
                        {i === 1 ? 'A' : i === 2 ? 'B' : 'C'}
                    </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] text-slate-500 font-bold">+2</div>
             </div>
            <button onClick={() => navigate('/engagement')} className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">View Details</button>
        </div>
    </div>
    );
  };

  const NudgeWidget = () => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] h-full flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" /> AI Nudges
             </h3>
             <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {mockNudges.length} Alerts
             </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto custom-scroll pr-2 max-h-[250px]">
            {mockNudges.map(nudge => {
                const getStyle = (severity: string) => {
                    switch(severity) {
                        case 'high': return 'bg-rose-50 border-rose-100 text-rose-900';
                        case 'medium': return 'bg-amber-50 border-amber-100 text-amber-900';
                        default: return 'bg-emerald-50 border-emerald-100 text-emerald-900';
                    }
                };
                const getIcon = (type: string) => {
                    switch(type) {
                        case 'Risk': return <AlertCircle className="w-3.5 h-3.5" />;
                        case 'Opportunity': return <Zap className="w-3.5 h-3.5" />;
                        case 'Compliance': return <Shield className="w-3.5 h-3.5" />;
                        default: return <Info className="w-3.5 h-3.5" />;
                    }
                };
                
                return (
                    <div key={nudge.id} onClick={() => navigate('/engagement')} className={`p-4 rounded-2xl border ${getStyle(nudge.severity)} transition-all hover:scale-[1.02] cursor-pointer group`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5">
                                {getIcon(nudge.type)}
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{nudge.type}</span>
                            </div>
                            <span className="text-[10px] font-bold opacity-60 bg-white/50 px-1.5 py-0.5 rounded">{nudge.timestamp}</span>
                        </div>
                        <p className="text-xs font-bold leading-relaxed line-clamp-2 opacity-90">{nudge.message}</p>
                    </div>
                );
            })}
        </div>
        
        <button onClick={() => navigate('/engagement')} className="w-full mt-4 py-3 text-center text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all">
            View All Insights
        </button>
    </div>
  );

  const CoursesWidget = () => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Active Learning
            </h3>
            <button onClick={() => navigate('/courses')} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3"/>
            </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {loading && enrolledCourses.length === 0 ? (
                [1,2].map(i => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-4 animate-pulse h-32"></div>
                ))
            ) : enrolledCourses.length > 0 ? (
            enrolledCourses.slice(0, 4).map(course => ( 
                <div 
                    key={course.id} 
                    onClick={() => navigate('/courses')}
                    className="p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group bg-slate-50/30 flex flex-col justify-between"
                >
                    <div className="flex items-start gap-4">
                        <img src={course.thumbnail} alt={course.title} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                        <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{course.title}</h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">Next: {course.nextLesson || 'Continue Module'}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                            <span className="text-slate-400">{course.completedModules}/{course.totalModules} Mods</span>
                            <span className="text-indigo-600">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 group-hover:bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${course.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            ))) : (
                <div className="col-span-2 bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-300 mb-2"/>
                    <p className="text-slate-500 text-sm font-bold mb-2">No active enrollments.</p>
                    <button onClick={() => navigate('/courses')} className="text-indigo-600 font-bold text-xs hover:underline">Explore Catalog</button>
                </div>
            )}
        </div>
    </div>
  );

  const AnalyticsWidget = () => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" /> Engagement Pulse
                </h3>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors">
                <option>This Week</option>
                <option>Last Month</option>
            </select>
        </div>
        
        <div className="flex-1 min-h-[200px] w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                        dy={10}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#4F46E5" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        activeDot={{r: 6, strokeWidth: 0, fill: '#4F46E5'}}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  const ComplianceWidget = () => (
    <div className="group h-full flex flex-col bg-slate-900 rounded-[2rem] p-6 relative overflow-hidden text-white shadow-lg hover:scale-[1.02] transition-transform duration-300">
       <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
       <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
       
       <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400"/> Compliance
                 </h3>
                 <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]"></span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active</span>
                 </span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 rounded-full border-[3px] border-emerald-500/20 flex items-center justify-center mb-4 relative">
                     <Check className="w-8 h-8 text-emerald-400" />
                     <div className="absolute inset-0 border-[3px] border-emerald-400 rounded-full border-t-transparent animate-spin-slow"></div>
                </div>
                <p className="text-xl font-bold">Audit Passed</p>
                <p className="text-xs text-slate-400 mt-1">Next check in 14 days</p>
            </div>
            
            <button onClick={() => navigate('/compliance')} className="mt-4 w-full py-3 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-sm">
                View Report
            </button>
       </div>
    </div>
  );

  const DeadlinesWidget = () => {
    // Filter and sort deadlines
    const upcoming = mockEvents
      .filter(e => (e.type === 'deadline' || e.type === 'exam') && new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-500" /> Deadlines
                </h3>
                <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {upcoming.length} Pending
                </span>
            </div>
            
            <div className="space-y-3 flex-1 overflow-hidden">
                {upcoming.length > 0 ? (
                    upcoming.map(e => {
                        const daysLeft = Math.ceil((new Date(e.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isUrgent = daysLeft <= 2;
                        
                        return (
                             <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-rose-200 transition-colors group">
                                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${isUrgent ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}>
                                    <span className="text-[9px] uppercase font-bold">{new Date(e.date).toLocaleDateString('en-US', {month: 'short'})}</span>
                                    <span className="text-lg font-black leading-none">{new Date(e.date).getDate()}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{e.title}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                       {e.type === 'exam' ? '📝 Exam' : '⚠️ Submission'} • <span className={isUrgent ? 'text-rose-500 font-bold' : ''}>{daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}</span>
                                    </p>
                                </div>
                             </div>
                        );
                    })
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center py-6 opacity-60">
                        <CalendarIcon className="w-8 h-8 mb-2 opacity-50"/>
                        <p className="text-sm font-medium">No immediate deadlines.</p>
                        <p className="text-xs">Enjoy your free time!</p>
                    </div>
                )}
            </div>
            <button onClick={() => navigate('/calendar')} className="w-full mt-4 py-3 text-center text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all">View Full Calendar</button>
        </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
         <div>
            <div className="flex items-center gap-2 mb-3">
                 <span className="bg-white/80 backdrop-blur-sm border border-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> 12 Day Streak
                 </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
               {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{mockUser.name.split(' ')[0]}</span>.
            </h2>
            <p className="text-slate-500 mt-2 font-medium text-lg">
               Ready to conquer your <span className="text-indigo-600 font-bold">2 assignments</span> and <span className="text-indigo-600 font-bold">1 exam</span>?
            </p>
         </div>
         
         <div className="flex gap-3">
             <button 
               onClick={() => setIsCustomizing(true)}
               className="bg-white border border-slate-200 text-slate-500 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
               title="Customize Dashboard"
             >
                <LayoutIcon className="w-5 h-5" />
             </button>
             <button 
               onClick={() => navigate('/calendar')}
               className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
             >
                Study Plan
             </button>
         </div>
      </div>
      
      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
         {widgets.map(widget => {
            if (!widget.enabled) return null;
            
            // Map IDs to Components
            let Component = null;
            switch(widget.id) {
                case 'risk': Component = RiskWidget; break;
                case 'nudge': Component = NudgeWidget; break;
                case 'courses': Component = CoursesWidget; break;
                case 'analytics': Component = AnalyticsWidget; break;
                case 'compliance': Component = ComplianceWidget; break;
                case 'deadlines': Component = DeadlinesWidget; break;
            }

            if (!Component) return null;

            return (
                <div key={widget.id} className={`${widget.colSpan} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <Component />
                </div>
            );
         })}
      </div>

      <AIConsultant />

      {/* Customization Modal */}
      {isCustomizing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Personalize Dashboard</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Toggle widgets to focus on what matters.</p>
                    </div>
                    <button onClick={() => setIsCustomizing(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto custom-scroll">
                    {widgets.map(widget => (
                        <div 
                          key={widget.id} 
                          onClick={() => toggleWidget(widget.id)}
                          className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                              widget.enabled 
                              ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                    widget.enabled ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <Grid className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${widget.enabled ? 'text-indigo-900' : 'text-slate-600'}`}>{widget.label}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{widget.colSpan === 'col-span-2' ? 'Wide' : 'Standard'} Widget</p>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                widget.enabled ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
                            }`}>
                                {widget.enabled && <Check className="w-3 h-3 text-white" />}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button onClick={() => setIsCustomizing(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-slate-300">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
