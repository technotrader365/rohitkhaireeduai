
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const NavItem: React.FC<{ to: string; label: string; icon: string }> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-1 ${
        isActive 
          ? 'bg-slate-900 text-white shadow-md' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, switchRole } = useUser();
  
  // Routes where layout is hidden
  if (['/login', '/signup', '/'].includes(location.pathname)) return <>{children}</>;

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Professional Sidebar */}
      <aside className="w-64 fixed h-full bg-white border-r border-slate-200 z-50 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">EduPulse AI</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {user.role === 'student' ? (
            <>
              <div>
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student Success</h3>
                <NavItem to="/dashboard" label="Dashboard" icon="📊" />
                <NavItem to="/courses" label="My Courses" icon="📚" />
                <NavItem to="/student-assessments" label="Assessments & Grades" icon="📝" />
                <NavItem to="/calendar" label="Schedule" icon="📅" />
                <NavItem to="/engagement" label="Nudge Alerts" icon="🔔" />
              </div>

              <div>
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Tools</h3>
                <NavItem to="/career" label="Career Pathways" icon="🚀" />
                <NavItem to="/compliance" label="Compliance Check" icon="🛡️" />
                <NavItem to="/grading" label="Exam Review" icon="✨" />
              </div>
            </>
          ) : (
            // Admin View (Combines Teacher capabilities + Admin access)
            <>
              <div>
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Admin / Educator</h3>
                <NavItem to="/teacher-dashboard" label="Overview" icon="📊" />
                <NavItem to="/courses" label="Course Manager" icon="📚" />
                <NavItem to="/calendar" label="Class Schedule" icon="📅" />
                <NavItem to="/assessments" label="Assessments" icon="📝" />
                <NavItem to="/student-insights" label="Student Insights" icon="🧠" />
                <NavItem to="/compliance-review" label="Compliance Audits" icon="🛡️" />
              </div>

              <div>
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student View Access</h3>
                <NavItem to="/dashboard" label="Student Dashboard" icon="👁️" />
                <NavItem to="/compliance" label="My Compliance" icon="✅" />
                <NavItem to="/engagement" label="Engagement Hub" icon="🔔" />
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 mb-2">
             <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                {user.avatar}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={switchRole}
              className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Switch Role
            </button>
            <button 
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
           <div>
              <h2 className="text-lg font-bold text-slate-800">
                {location.pathname.replace('/', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
              </h2>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                 ● System Operational
              </span>
              <button onClick={() => navigate('/settings')} className="text-slate-400 hover:text-indigo-600 transition-colors">⚙️</button>
           </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
