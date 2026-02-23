
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course } from '../types';
import { mockCourses as initialCourses, mockUser } from '../store/mockStore';
import { serviceNow } from '../services/serviceNowService';

interface CourseContextType {
  courses: Course[];
  loading: boolean;
  enroll: (courseId: string) => void;
  markModuleComplete: (courseId: string) => void;
  refreshData: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(false);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>({}); // Map CourseID -> EnrollmentID

  const fetchData = async () => {
    // serviceNow.isConnected() is now always true due to default config
    setLoading(true);
    try {
      // 1. Get All Courses
      const snCourses = await serviceNow.getCourses();
      
      // 2. Get My Enrollments
      const snEnrollments = await serviceNow.getMyEnrollments(mockUser.email);
      
      // 3. Merge Data
      const mergedCourses = snCourses.map(c => {
        const enrollment = snEnrollments.find((e: any) => e.u_course.value === c.id);
        
        if (enrollment) {
          // Store mapping for updates later
          setEnrollmentMap(prev => ({...prev, [c.id]: enrollment.sys_id}));
          
          return {
            ...c,
            enrolled: true,
            progress: parseInt(enrollment.u_progress) || 0,
            completedModules: parseInt(enrollment.u_completed_modules) || 0
          };
        }
        return c;
      });

      setCourses(mergedCourses);
    } catch (err) {
      console.warn("Failed to sync with ServiceNow (falling back to local mock data):", err);
      // Fallback to mock on error ensures app is always usable
      setCourses(initialCourses); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleConfigUpdate = () => fetchData();
    window.addEventListener('sn_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('sn_config_updated', handleConfigUpdate);
  }, []);

  const enroll = async (courseId: string) => {
    // Optimistic Update
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: true } : c));

    if (serviceNow.isConnected()) {
      try {
        const result = await serviceNow.enrollStudent(mockUser.email, courseId);
        if (result?.result?.sys_id) {
          setEnrollmentMap(prev => ({...prev, [courseId]: result.result.sys_id}));
        }
      } catch (e) {
        console.error("Enrollment sync failed", e);
        // Revert on failure? For now, we keep optimistic state
      }
    }
  };

  const markModuleComplete = async (courseId: string) => {
    let newProgress = 0;
    let newModules = 0;

    // Optimistic Update
    setCourses(prev => prev.map(c => {
      if (c.id === courseId && c.completedModules < c.totalModules) {
        newModules = c.completedModules + 1;
        newProgress = Math.round((newModules / c.totalModules) * 100);
        return { ...c, completedModules: newModules, progress: newProgress };
      }
      return c;
    }));

    if (serviceNow.isConnected()) {
      const enrollmentId = enrollmentMap[courseId];
      if (enrollmentId) {
        try {
          await serviceNow.updateProgress(enrollmentId, newProgress, newModules);
        } catch (e) {
          console.error("Progress sync failed", e);
        }
      }
    }
  };

  return (
    <CourseContext.Provider value={{ courses, enroll, markModuleComplete, loading, refreshData: fetchData }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourses must be used within a CourseProvider');
  return context;
};
