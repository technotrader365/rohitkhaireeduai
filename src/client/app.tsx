
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { CareerPathways } from './pages/CareerPathways';
import { ComplianceCheck } from './pages/ComplianceCheck';
import { ComplianceReview } from './pages/ComplianceReview';
import { GradingReview } from './pages/GradingReview';
import { EngagementHub } from './pages/EngagementHub';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Courses } from './pages/Courses';
import { Landing } from './pages/Landing';
import { Calendar } from './pages/Calendar';
import { AssessmentManager } from './pages/AssessmentManager';
import { StudentInsights } from './pages/StudentInsights';
import { StudentAssessments } from './pages/StudentAssessments';
import { CourseProvider } from './context/CourseContext';
import { UserProvider, useUser } from './context/UserContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = localStorage.getItem('user_session');
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RoleRoute: React.FC<{ children: React.ReactNode, role: 'teacher' | 'student' }> = ({ children, role }) => {
  const { user } = useUser();
  
  // Admin role bypasses restriction and can view both
  if (user.role === 'admin') {
    return <>{children}</>;
  }

  if (user.role !== role) {
    // Redirect based on what they *should* be seeing
    return <Navigate to={user.role === 'student' ? '/dashboard' : '/teacher-dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/signup" element={<Auth mode="signup" />} />
      
      {/* Student Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><RoleRoute role="student"><Dashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/career" element={<ProtectedRoute><RoleRoute role="student"><CareerPathways /></RoleRoute></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute><RoleRoute role="student"><ComplianceCheck /></RoleRoute></ProtectedRoute>} />
      <Route path="/grading" element={<ProtectedRoute><RoleRoute role="student"><GradingReview /></RoleRoute></ProtectedRoute>} />
      <Route path="/engagement" element={<ProtectedRoute><RoleRoute role="student"><EngagementHub /></RoleRoute></ProtectedRoute>} />
      <Route path="/student-assessments" element={<ProtectedRoute><RoleRoute role="student"><StudentAssessments /></RoleRoute></ProtectedRoute>} />

      {/* Teacher Routes - Admin can see these too */}
      <Route path="/teacher-dashboard" element={<ProtectedRoute><RoleRoute role="teacher"><TeacherDashboard /></RoleRoute></ProtectedRoute>} />
      <Route path="/assessments" element={<ProtectedRoute><RoleRoute role="teacher"><AssessmentManager /></RoleRoute></ProtectedRoute>} />
      <Route path="/student-insights" element={<ProtectedRoute><RoleRoute role="teacher"><StudentInsights /></RoleRoute></ProtectedRoute>} />
      <Route path="/compliance-review" element={<ProtectedRoute><RoleRoute role="teacher"><ComplianceReview /></RoleRoute></ProtectedRoute>} />

      {/* Shared Routes */}
      <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <UserProvider>
      <CourseProvider>
        <HashRouter>
          <Layout>
            <AppRoutes />
          </Layout>
        </HashRouter>
      </CourseProvider>
    </UserProvider>
  );
};

export default App;
