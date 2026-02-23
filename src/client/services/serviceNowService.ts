
import { Course, Assessment, Nudge, StudentProfileFull, CalendarEvent, Submission } from '../types';
import { mockStudentsList } from '../store/mockStore';

/**
 * ServiceNow Table API Service
 * Handles CRUD operations for Student Management
 * Optimized for ServiceNow Portal iFrame Integration
 */

interface ServiceNowConfig {
  instance: string;
  username: string;
  token: string;
}

// Default credentials provided for immediate connection
const DEFAULT_CONFIG: ServiceNowConfig = {
  instance: 'dev265902',
  username: 'admin',
  token: 'yx/jUn3LGV=6'
};

const getStoredConfig = (): ServiceNowConfig => {
  const config = localStorage.getItem('sn_config');
  return config ? JSON.parse(config) : DEFAULT_CONFIG;
};

export const saveConfig = (config: ServiceNowConfig) => {
  localStorage.setItem('sn_config', JSON.stringify(config));
  // Trigger a window event so contexts can reload
  window.dispatchEvent(new Event('sn_config_updated'));
};

const snFetch = async (endpoint: string, options: RequestInit = {}) => {
  const config = getStoredConfig();
  // We always have config now due to defaults, but check sanity
  if (!config.instance) throw new Error("ServiceNow Instance not configured.");

  const auth = btoa(`${config.username}:${config.token}`);
  // Handle full URL provided or relative path
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://${config.instance}.service-now.com/api/now/table/${endpoint}`;
  
  console.log(`[ServiceNow] Calling: ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ServiceNow] Error ${response.status}:`, errorText);
      // specific error for missing table to allow graceful fallback
      if (response.status === 404 && errorText.includes('entit')) { 
         throw new Error(`ServiceNow Table Not Found. Please ensure Update Set is applied.`);
      }
      throw new Error(`ServiceNow Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("SN Fetch Error:", error);
    throw error;
  }
};

export const serviceNow = {
  // Always returns true now as we have default credentials
  isConnected: () => true,

  // --- Courses ---
  getCourses: async (): Promise<Course[]> => {
    const data = await snFetch('u_edu_course?sysparm_limit=20');
    return data.result.map((r: any) => ({
      id: r.sys_id,
      sys_id: r.sys_id,
      title: r.u_title,
      instructor: r.u_instructor,
      progress: 0, 
      totalModules: parseInt(r.u_total_modules) || 10,
      completedModules: 0,
      thumbnail: r.u_thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      category: r.u_category,
      enrolled: false,
      description: r.u_description,
      recommended: r.u_recommended === 'true',
      skills: r.u_skills ? r.u_skills.split(',') : [],
      rating: parseFloat(r.u_rating) || 4.8,
      studentsEnrolled: 0
    }));
  },

  // --- Enrollments ---
  getMyEnrollments: async (email: string) => {
    const data = await snFetch(`u_edu_enrollment?sysparm_query=u_student_email=${email}`);
    return data.result;
  },

  enrollStudent: async (email: string, courseSysId: string) => {
    return snFetch('u_edu_enrollment', {
      method: 'POST',
      body: JSON.stringify({
        u_student_email: email,
        u_course: courseSysId,
        u_progress: 0,
        u_completed_modules: 0,
        u_active: true
      })
    });
  },

  updateProgress: async (enrollmentSysId: string, progress: number, modules: number) => {
    return snFetch(`u_edu_enrollment/${enrollmentSysId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        u_progress: progress,
        u_completed_modules: modules
      })
    });
  },
  
  // --- Events ---
  getEvents: async (email: string): Promise<CalendarEvent[]> => {
    // Fetch events for specific student
    const data = await snFetch(`u_edu_event?sysparm_query=u_student_email=${email}^ORDERBYu_date`);
    return data.result.map((r: any) => ({
      id: r.sys_id,
      title: r.u_title,
      date: new Date(r.u_date),
      type: r.u_type || 'study',
      courseId: r.u_course?.value || '',
      description: r.u_description || 'Synced from ServiceNow',
      duration: '1h'
    }));
  },

  createEvent: async (event: Partial<CalendarEvent>, email: string) => {
    return snFetch('u_edu_event', {
       method: 'POST',
       body: JSON.stringify({
         u_title: event.title,
         u_date: event.date?.toISOString().split('T')[0], // Simple date
         u_type: event.type,
         u_student_email: email,
         u_description: event.description
       })
    });
  },

  // --- Students (For Teacher) ---
  getStudents: async (): Promise<StudentProfileFull[]> => {
    const data = await snFetch('u_edu_student_profile?sysparm_limit=50');
    return data.result.map((r: any) => ({
      id: r.sys_id,
      name: r.u_student_email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase()),
      email: r.u_student_email,
      avatar: r.u_student_email.substring(0,2).toUpperCase(),
      gpa: parseFloat(r.u_gpa) || 0.0,
      attendance: parseInt(r.u_attendance_score) || 0,
      missedDeadlines: 0, // Mock for now
      strongestSkill: r.u_strongest_skill || 'General',
      weakestSkill: r.u_weakest_skill || 'None',
      recentGrades: []
    }));
  },

  // --- Assessments ---
  getAssessments: async (): Promise<Assessment[]> => {
    const data = await snFetch('u_edu_assessment?sysparm_limit=50^ORDERBYu_due_date');
    return data.result.map((r: any) => ({
      id: r.sys_id,
      courseId: r.u_course?.value || 'Unknown',
      title: r.u_title,
      dueDate: r.u_due_date,
      totalPoints: parseInt(r.u_total_points),
      avgScore: parseInt(r.u_avg_score) || 0,
      status: r.u_status,
      questions: 10,
      type: r.u_type || 'Quiz'
    }));
  },

  createAssessment: async (assessment: Partial<Assessment>) => {
    return snFetch('u_edu_assessment', {
      method: 'POST',
      body: JSON.stringify({
        u_title: assessment.title,
        u_total_points: assessment.totalPoints,
        u_due_date: assessment.dueDate,
        u_status: assessment.status || 'Draft',
        u_type: assessment.type || 'Quiz'
      })
    });
  },

  // --- Submissions ---
  getSubmissions: async (email: string): Promise<Submission[]> => {
    const data = await snFetch(`u_edu_submission?sysparm_query=u_student_email=${email}`);
    return data.result.map((r: any) => ({
      id: r.sys_id,
      assessmentId: r.u_assessment?.value,
      studentId: r.u_student_email, // Approximate mapping
      submittedAt: r.u_submitted_at,
      status: r.u_status,
      score: r.u_score ? parseInt(r.u_score) : undefined,
      feedback: r.u_feedback,
      attachmentName: r.u_attachment_name
    }));
  },

  createSubmission: async (submission: Partial<Submission>, email: string) => {
    return snFetch('u_edu_submission', {
      method: 'POST',
      body: JSON.stringify({
        u_student_email: email,
        u_assessment: submission.assessmentId,
        u_submitted_at: new Date().toISOString(),
        u_status: submission.status || 'Submitted',
        u_score: submission.score,
        u_feedback: submission.feedback,
        u_attachment_name: submission.attachmentName
      })
    });
  },

  // --- Nudges ---
  getNudges: async (email: string): Promise<Nudge[]> => {
     const data = await snFetch(`u_edu_nudge?sysparm_query=u_student_email=${email}^u_active=true`);
     return data.result.map((r: any) => ({
       id: r.sys_id,
       type: r.u_type,
       severity: r.u_severity,
       message: r.u_message,
       actionLabel: r.u_action_label,
       timestamp: 'Today',
       actionLink: '#',
       details: r.u_details || 'AI Analysis: Action required based on recent patterns.'
     }));
  },

  // --- Compliance & Grading ---
  getLatestCompliance: async (email: string) => {
    // In a real scenario, filter by u_student_email.
    // Here we just fetch latest one for demo purposes if field not exact match
    const data = await snFetch(`u_edu_compliance?sysparm_query=u_student=${email}^ORDERBYDESCsys_created_on&sysparm_limit=1`);
    if (data.result && data.result.length > 0) {
        const r = data.result[0];
        return {
            isCompliant: r.u_compliant === 'true',
            score: parseInt(r.u_score),
            observations: r.u_observations ? r.u_observations.split('\n') : [],
            recommendations: r.u_recommendations || 'No specific recommendations.',
            date: r.sys_created_on
        };
    }
    return null;
  },

  getAllComplianceRecords: async () => {
    const data = await snFetch('u_edu_compliance?sysparm_limit=50^ORDERBYDESCsys_created_on');
    return data.result.map((r: any) => ({
       id: r.sys_id,
       studentName: r.u_student,
       isCompliant: r.u_compliant === 'true',
       score: parseInt(r.u_score) || 0,
       reason: r.u_recommendations || 'System Check',
       date: r.sys_created_on
    }));
  },

  saveComplianceRecord: (data: any) => snFetch('u_edu_compliance', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  saveGradingRecord: (data: any) => snFetch('u_edu_exam_review', { 
    method: 'POST',
    body: JSON.stringify(data)
  })
};
