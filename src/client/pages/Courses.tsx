
import React, { useState, useEffect } from 'react';
import { useCourses } from '../context/CourseContext';
import { useUser } from '../context/UserContext';
import { Course, Assessment, Submission } from '../types';
import { serviceNow } from '../services/serviceNowService';
import { mockAssessments, mockSubmissions } from '../store/mockStore';
import { Search, Users, Star, Edit, Check, ArrowRight, BookOpen, StickyNote, Sparkles, Award, FileText, AlertCircle, Clock } from 'lucide-react';

export const Courses: React.FC = () => {
  const { courses, enroll, markModuleComplete } = useCourses();
  const { user } = useUser();
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [view, setView] = useState<'my-courses' | 'catalog'>('my-courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Advanced Features State
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'assessments'>('content');
  const [notes, setNotes] = useState('');
  
  // Assessment State
  const [courseAssessments, setCourseAssessments] = useState<Assessment[]>([]);
  const [courseSubmissions, setCourseSubmissions] = useState<Submission[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const isAdmin = user.role === 'admin' || user.role === 'teacher';

  // --- Filtering Logic ---
  // 1. Base list based on view mode
  const baseList = view === 'my-courses' 
    ? courses.filter(c => isAdmin ? true : c.enrolled)
    : courses.filter(c => !c.enrolled); // Catalog shows unenrolled

  // 2. Apply Search
  const filteredCourses = baseList.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Special Sections for Catalog View (if no search)
  const showRecommendations = view === 'catalog' && !searchQuery;
  const recommendedCourses = showRecommendations 
    ? courses.filter(c => !c.enrolled && c.recommended).slice(0, 3) 
    : [];
  
  const catalogList = showRecommendations
    ? filteredCourses.filter(c => !recommendedCourses.find(r => r.id === c.id))
    : filteredCourses;

  const handleEnroll = (courseId: string) => {
    enroll(courseId);
    const updatedCourse = courses.find(c => c.id === courseId);
    if (updatedCourse) setActiveCourse({ ...updatedCourse, enrolled: true });
  };

  const saveEdit = () => {
    setEditingId(null);
  };

  useEffect(() => {
    if (activeCourse) {
       const saved = localStorage.getItem(`notes_${activeCourse.id}_${activeCourse.completedModules}`);
       setNotes(saved || '');
       setActiveTab('content'); // Reset tab on course switch
    }
  }, [activeCourse]);

  // Fetch assessments when tab changes to assessments
  useEffect(() => {
    if (activeCourse && activeTab === 'assessments') {
        setLoadingAssessments(true);
        const fetchData = async () => {
             let allAssessments: Assessment[] = [];
             let allSubmissions: Submission[] = [];

             if (serviceNow.isConnected()) {
                 try {
                    const [fetchedAssessments, fetchedSubmissions] = await Promise.all([
                        serviceNow.getAssessments(),
                        serviceNow.getSubmissions(user.email)
                    ]);
                    allAssessments = fetchedAssessments;
                    allSubmissions = fetchedSubmissions;
                 } catch (e) {
                     console.error("Failed to fetch assessments", e);
                 }
             } else {
                 allAssessments = mockAssessments;
                 allSubmissions = mockSubmissions;
             }

             setCourseAssessments(allAssessments.filter(a => a.courseId === activeCourse.id));
             setCourseSubmissions(allSubmissions);
             setLoadingAssessments(false);
        };
        fetchData();
    }
  }, [activeCourse, activeTab, user.email]);

  const saveNotes = (text: string) => {
    setNotes(text);
    if (activeCourse) {
        localStorage.setItem(`notes_${activeCourse.id}_${activeCourse.completedModules}`, text);
    }
  };

  const CourseCard = ({ course, isRecommended }: { course: Course, isRecommended?: boolean }) => (
    <div className={`card-pro group overflow-hidden flex flex-col h-full relative transform transition-all hover:scale-[1.02] ${isRecommended ? 'ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-100' : ''}`}>
       
       <div className="h-40 relative p-6 flex flex-col justify-between transition-all group-hover:h-32">
          <div className="absolute inset-0">
             <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/20"></div>
          </div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                    {course.category}
                </span>
                {course.recommended && !course.enrolled && (
                    <span className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-yellow-300" /> Recommended
                    </span>
                )}
            </div>
          </div>

          {isAdmin && editingId === course.id ? (
             <div className="relative z-10 bg-white p-2 rounded-lg flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Editing...</span>
                <button onClick={saveEdit} className="p-1 bg-emerald-500 text-white rounded"><Check className="w-3 h-3"/></button>
             </div>
          ) : (
            <div className="relative z-10 h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl text-white border border-white/20">
               🎓
            </div>
          )}
       </div>
       
       <div className="p-6 flex-1 flex flex-col relative">
          {isAdmin && editingId === course.id ? (
            <input className="font-bold text-lg mb-2 border rounded p-1 w-full" defaultValue={course.title} />
          ) : (
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex justify-between items-start leading-snug">
               {course.title}
               {isAdmin && (
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(course.id); }} className="text-slate-400 hover:text-indigo-600">
                     <Edit className="w-4 h-4"/>
                  </button>
               )}
            </h3>
          )}
          
          <p className="text-sm text-slate-500 mb-4">by {course.instructor}</p>
          
          {/* Enhanced Stats */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mb-4 group-hover:opacity-40 transition-opacity">
             <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{course.rating || '4.8'}</span>
             </div>
             <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.studentsEnrolled?.toLocaleString() || '1.2k'} Enrolled</span>
             </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-6 leading-relaxed group-hover:opacity-0 transition-opacity">{course.description}</p>
          
          {/* Hover Overlay Content */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 bg-white/95 backdrop-blur-xl border-t border-indigo-50 p-6 transition-transform duration-300 z-10 flex flex-col h-[70%]">
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1">
               {course.enrolled ? <><BookOpen className="w-3 h-3"/> Next Lesson</> : <><Sparkles className="w-3 h-3"/> Skills You'll Gain</>}
             </p>
             
             {course.enrolled ? (
               <p className="text-sm font-bold text-slate-800 mb-3 leading-snug">{course.nextLesson || "Continue your module"}</p>
             ) : (
               <div className="flex flex-wrap gap-2 mb-3">
                 {course.skills?.slice(0, 4).map((skill, i) => (
                   <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-100">
                     {skill}
                   </span>
                 ))}
               </div>
             )}
             
             <button 
                onClick={(e) => { e.stopPropagation(); setActiveCourse(course); }}
                className="mt-auto w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors shadow-lg"
             >
                {isAdmin ? 'Manage Content' : (course.enrolled ? 'Resume Learning' : 'View Details')}
             </button>
          </div>

          <div className="mt-auto group-hover:opacity-0 transition-opacity">
             {isAdmin ? (
                <div className="flex gap-2">
                   <button onClick={() => setActiveCourse(course)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200">Manage</button>
                   <button className="flex-1 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100">Analytics</button>
                </div>
             ) : course.enrolled ? (
               <>
                 <div className="flex justify-between items-end mb-2">
                    <div className="text-xs">
                       <span className="font-bold text-slate-800">{course.completedModules}</span>
                       <span className="text-slate-400">/{course.totalModules} Modules</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">{course.progress}%</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${course.progress}%`}}></div>
                 </div>
                 <button 
                   onClick={() => setActiveCourse(course)}
                   className="w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-sm"
                 >
                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                 </button>
               </>
             ) : (
               <button 
                 onClick={() => setActiveCourse(course)}
                 className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all text-sm ${
                   course.recommended 
                     ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 hover:shadow-indigo-300' 
                     : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                 }`}
               >
                  {course.recommended ? 'Start Recommended Path' : 'View & Enroll'}
               </button>
             )}
          </div>
       </div>
    </div>
  );

  // --- Render Active Course Details ---
  if (activeCourse) {
    const isEnrolled = activeCourse.enrolled;
    const currentCourseState = courses.find(c => c.id === activeCourse.id) || activeCourse;

    return (
      <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in">
        {/* Course Sidebar */}
        <div className="w-80 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50">
              <button onClick={() => setActiveCourse(null)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 flex items-center gap-1">
                 <ArrowRight className="w-3 h-3 rotate-180"/> Back
              </button>
              <h3 className="font-bold text-slate-900 line-clamp-1">{currentCourseState.title}</h3>
              {isEnrolled && (
                <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${currentCourseState.progress}%`}}></div>
                   <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{currentCourseState.completedModules}/{currentCourseState.totalModules} Completed</span>
                      <span className="text-[10px] text-indigo-600 font-bold">{currentCourseState.progress}%</span>
                   </div>
                </div>
              )}
           </div>
           <div className="flex-1 overflow-y-auto custom-scroll">
              {Array.from({ length: currentCourseState.totalModules || 5 }, (_, i) => i + 1).map((m) => {
                const isCompleted = m <= currentCourseState.completedModules;
                const isCurrent = m === currentCourseState.completedModules + 1;
                
                return (
                 <div key={m} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${isCurrent ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'opacity-70'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <p className={`text-xs font-bold uppercase ${isCurrent ? 'text-indigo-700' : 'text-slate-400'}`}>Module {m}</p>
                      
                      {isCompleted ? (
                        <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5"/> Done</span>
                      ) : isCurrent && !isAdmin && isEnrolled ? (
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             markModuleComplete(currentCourseState.id);
                          }}
                          className="text-indigo-600 hover:bg-indigo-100 p-1 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                           <div className="w-4 h-4 border-2 border-indigo-600 rounded-full"></div> Mark Done
                        </button>
                      ) : (
                         <span className="text-slate-300"><div className="w-4 h-4 border-2 border-slate-200 rounded-full"></div></span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                        {m === 1 ? 'Introduction & Setup' : 
                         m === currentCourseState.totalModules ? 'Final Project' : 
                         `Concept Deep Dive ${m}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-100 text-slate-500">Video • 10m</span>
                    </div>
                 </div>
              )})}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col relative overflow-hidden">
                {isAdmin && (
                    <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-xs font-bold text-center py-1 z-20">
                    Admin View - Editing Mode Enabled
                    </div>
                )}

                {/* Video Player Placeholder (Only show on Content tab) */}
                {activeTab === 'content' && (
                    <div className="aspect-video bg-slate-900 rounded-xl mb-8 flex items-center justify-center relative overflow-hidden group shadow-lg">
                        {!isEnrolled && !isAdmin && (
                            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <div className="bg-white p-8 rounded-2xl text-center max-w-sm">
                                    <h3 className="font-bold text-lg mb-2">Enroll to Watch</h3>
                                    <button onClick={() => handleEnroll(currentCourseState.id)} className="btn-primary w-full py-2 rounded-lg text-sm">Enroll Now</button>
                                </div>
                            </div>
                        )}
                        <img src={currentCourseState.thumbnail} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <button className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl pl-1 border-2 border-white hover:scale-110 transition-transform shadow-xl">
                            ▶
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-slate-100 mb-6">
                    <button 
                        onClick={() => setActiveTab('content')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'content' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <BookOpen className="w-4 h-4"/> Lesson Content
                    </button>
                    <button 
                         onClick={() => setActiveTab('assessments')}
                         className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'assessments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <Award className="w-4 h-4"/> Assessments
                    </button>
                    <button 
                         onClick={() => setActiveTab('notes')}
                         className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'notes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <StickyNote className="w-4 h-4"/> My Notes
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'content' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                             <h2 className="text-2xl font-bold text-slate-900 mb-4">Module {currentCourseState.completedModules + 1}: Core Fundamentals</h2>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                {currentCourseState.description} In this comprehensive lesson, we explore the theoretical underpinnings required for the final project.
                            </p>
                            
                            {!isAdmin && isEnrolled && (
                                <button 
                                    onClick={() => markModuleComplete(currentCourseState.id)}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
                                    currentCourseState.completedModules >= currentCourseState.totalModules 
                                    ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                                    : 'btn-primary'
                                    }`}
                                    disabled={currentCourseState.completedModules >= currentCourseState.totalModules}
                                >
                                    {currentCourseState.completedModules >= currentCourseState.totalModules ? 'Course Completed!' : 'Mark Lesson Complete'}
                                </button>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'assessments' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-slate-800">Course Assignments & Quizzes</h3>
                                {loadingAssessments && <span className="text-xs font-bold text-indigo-500 animate-pulse">Updating...</span>}
                            </div>
                            
                            {courseAssessments.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {courseAssessments.map(assessment => {
                                        const submission = courseSubmissions.find(s => s.assessmentId === assessment.id);
                                        const isCompleted = !!submission;
                                        
                                        return (
                                            <div key={assessment.id} className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex justify-between items-center group">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                                                        isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {isCompleted ? <Check className="w-6 h-6"/> : <FileText className="w-6 h-6"/>}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-slate-900">{assessment.title}</h4>
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                                                assessment.type === 'Quiz' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                                                            }`}>{assessment.type || 'Assignment'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Due {assessment.dueDate}</span>
                                                            <span className="font-medium">• {assessment.totalPoints} Points</span>
                                                        </div>
                                                        {isCompleted && submission.feedback && (
                                                            <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg text-slate-600 italic border border-slate-100">
                                                                " {submission.feedback} "
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    {isCompleted ? (
                                                        <div>
                                                            <span className="block text-2xl font-black text-slate-900">{submission.score}%</span>
                                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Graded</span>
                                                        </div>
                                                    ) : (
                                                        <button className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-sm">
                                                            Start Now
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2"/>
                                    <p className="text-slate-500 font-medium">No assessments available for this course yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2">
                            <textarea 
                                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Type your notes here... (Auto-saved)"
                                value={notes}
                                onChange={(e) => saveNotes(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 mt-2 text-right italic">Notes saved locally.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- Render Catalog Grid ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col xl:flex-row justify-between items-end gap-6">
         <div>
            <h2 className="text-3xl font-bold text-slate-900">
               {isAdmin ? 'Course Manager' : 'Learning Center'}
            </h2>
            <p className="text-slate-500 mt-1">
               {isAdmin ? 'Manage your curriculum and content.' : 'Access your enrolled courses or explore new skills.'}
            </p>
         </div>
         <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
               <input 
                 type="text" 
                 placeholder="Search courses..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm"
               />
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
               <button 
                 onClick={() => setView('my-courses')}
                 className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'my-courses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {isAdmin ? 'Managed Courses' : 'My Courses'}
               </button>
               {!isAdmin && (
                <button 
                  onClick={() => setView('catalog')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Browse Catalog
                </button>
               )}
            </div>
         </div>
      </header>

      {/* Recommended Section (Only in Catalog View & No Search) */}
      {showRecommendations && recommendedCourses.length > 0 && (
         <div className="animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-indigo-500" /> Recommended For You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
               {recommendedCourses.map(course => <CourseCard key={course.id} course={course} isRecommended={true} />)}
            </div>
            <div className="h-px bg-slate-200 w-full mb-8"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Explore Full Catalog</h3>
         </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {catalogList.length > 0 ? catalogList.map(course => (
            <CourseCard key={course.id} course={course} />
         )) : (
            <div className="col-span-3 text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               <p className="text-slate-400 font-bold mb-4">No courses found matching your search.</p>
               <button onClick={() => setSearchQuery('')} className="text-indigo-600 font-bold underline">Clear Search</button>
            </div>
         )}
      </div>
    </div>
  );
};
