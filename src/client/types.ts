
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
}

export interface Course {
  id: string; // Will be sys_id if from SNow
  title: string;
  instructor: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  thumbnail: string;
  category: string;
  nextLesson?: string;
  enrolled: boolean;
  description: string;
  recommended?: boolean;
  skills?: string[];
  rating?: number;
  studentsEnrolled?: number;
  sys_id?: string; // ServiceNow specific
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date; // JS Date object for easier manipulation in UI
  type: 'exam' | 'deadline' | 'study' | 'social';
  courseId?: string;
  duration?: string; // e.g., "2h"
  description?: string;
}

export interface Nudge {
  id: string;
  type: 'Risk' | 'Opportunity' | 'Compliance';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionLink?: string;
  details?: string;
}

export interface StudentRiskProfile {
  overallRisk: 'Low' | 'Medium' | 'High';
  attendanceScore: number;
  submissionRate: number;
  engagementTrend: 'up' | 'down' | 'stable';
}

export interface ComplianceResult {
  isCompliant: boolean;
  score: number;
  observations: string[];
  recommendations: string;
}

export interface CareerRecommendation {
  role: string;
  matchScore: number;
  requiredSkills: string[];
  timeline: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string; // ISO Date string
  totalPoints: number;
  avgScore?: number;
  status: 'Draft' | 'Published' | 'Graded';
  questions: number;
  type?: 'Quiz' | 'Assignment'; // Added type
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  submittedAt: string; // ISO Date string
  status: 'Pending' | 'Graded' | 'Submitted';
  score?: number;
  feedback?: string;
  attachmentName?: string;
}

// Data shape for the teacher to analyze a specific student
export interface StudentProfileFull {
  id: string;
  name: string;
  email: string;
  avatar: string;
  gpa: number;
  attendance: number;
  missedDeadlines: number;
  strongestSkill: string;
  weakestSkill: string;
  recentGrades: number[];
}
