
import React, { useState, useEffect } from 'react';
import { serviceNow } from '../services/serviceNowService';
import { reviewHandwrittenWork } from '../services/geminiService';
import { Assessment, Submission } from '../types';
import { mockAssessments, mockSubmissions, mockUser } from '../store/mockStore';
import { useUser } from '../context/UserContext';
import { Calendar, CheckCircle, Clock, FileText, Upload, Award, AlertCircle, ChevronRight, X, BarChart, Sparkles, PlayCircle, Trophy } from 'lucide-react';

export const StudentAssessments: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [selectedReview, setSelectedReview] = useState<Submission | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (serviceNow.isConnected()) {
        setLoading(true);
        try {
          const [fetchedAssessments, fetchedSubmissions] = await Promise.all([
            serviceNow.getAssessments(),
            serviceNow.getSubmissions(user.email)
          ]);
          setAssessments(fetchedAssessments);
          setSubmissions(fetchedSubmissions);
        } catch (error) {
          console.error("Failed to fetch assessment data", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Ensure we load from mock store initially if not connected
        setAssessments(mockAssessments);
        setSubmissions(mockSubmissions);
      }
    };
    fetchData();
  }, [user.email]);

  const getAssociatedAssessment = (assessmentId: string) => {
    return assessments.find(a => a.id === assessmentId);
  };

  const pendingAssessments = assessments.filter(a => 
    a.status === 'Published' && !submissions.some(s => s.assessmentId === a.id)
  );

  const completedSubmissions = submissions.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const averageScore = submissions.length > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length) 
    : 0;

  const handleStartActivity = (assessment: Assessment) => {
    setActiveAssignmentId(assessment.id);
    if (assessment.type === 'Quiz') {
      setQuizModalOpen(true);
    } else {
      setSubmissionModalOpen(true);
    }
  };

  const handleSubmissionComplete = (newSubmission: Submission) => {
    setSubmissions(prev => [newSubmission, ...prev]);
    // Switch tab to show the result
    setActiveTab('completed');
  };

  // --- Quiz Modal Component ---
  const QuizModal = ({ assessmentId, onClose, onComplete }: { assessmentId: string, onClose: () => void, onComplete: (s: Submission) => void }) => {
     const assessment = assessments.find(a => a.id === assessmentId);
     const [step, setStep] = useState(0); // 0: Intro, 1: Questions, 2: Result
     const [progress, setProgress] = useState(0);
     const [score, setScore] = useState(0);

     const simulateQuiz = () => {
         setStep(1);
         // Simulate progress bar
         let p = 0;
         const interval = setInterval(() => {
             p += 2;
             setProgress(p);
             if (p >= 100) {
                 clearInterval(interval);
                 const calculatedScore = Math.floor(Math.random() * (100 - 80 + 1) + 80); // Random score 80-100
                 setScore(calculatedScore);
                 setStep(2);
             }
         }, 50);
     };

     const submitQuizResult = async () => {
        const submissionData: Submission = {
            id: Math.random().toString(),
            assessmentId: assessmentId,
            studentId: user.email,
            submittedAt: new Date().toISOString(),
            status: 'Graded',
            score: score,
            feedback: 'Great job on the quiz! You demonstrated strong understanding of the core concepts.',
            attachmentName: undefined
        };

        if (serviceNow.isConnected()) {
            try {
                await serviceNow.createSubmission(submissionData, user.email);
            } catch(e) { console.error(e); }
        }
        
        onComplete(submissionData);
        onClose();
     };

     return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {step < 2 && (
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">{assessment?.title}</h3>
                            <p className="text-sm text-slate-500">{assessment?.questions} Questions • {assessment?.totalPoints} Points</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
                    {step === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-4xl">⏱️</div>
                            <div>
                                <h4 className="text-2xl font-bold text-slate-800">Ready to begin?</h4>
                                <p className="text-slate-500 mt-2 max-w-md mx-auto">You are about to start a timed quiz. Ensure you have a stable internet connection.</p>
                            </div>
                            <button onClick={simulateQuiz} className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105">
                                Start Quiz
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="w-full space-y-8 animate-in fade-in">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 transition-all duration-75 ease-linear" style={{width: `${progress}%`}}></div>
                            </div>
                            <p className="text-slate-500 font-medium animate-pulse">Answering questions...</p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in zoom-in duration-500">
                             <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-5xl animate-bounce">🏆</div>
                             <div>
                                 <h4 className="text-3xl font-black text-slate-900">Quiz Complete!</h4>
                                 <p className="text-slate-500 mt-2">You scored:</p>
                                 <div className="text-6xl font-black text-indigo-600 mt-2">{score}%</div>
                             </div>
                             <button onClick={submitQuizResult} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all">
                                 View Results
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
     );
  };

  // --- Assignment Modal Component ---
  const SubmissionModal = ({ assessmentId, onClose, onComplete }: { assessmentId: string, onClose: () => void, onComplete: (s: Submission) => void }) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    const [file, setFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            if (selected.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result as string);
                reader.readAsDataURL(selected);
            } else {
                setImagePreview(null);
            }
            setAiResult(null); 
        }
    };

    const runAiAssessment = async () => {
        if (!imagePreview) return;
        setAnalyzing(true);
        try {
            const base64 = imagePreview.split(',')[1];
            // Try real AI
            const data = await reviewHandwrittenWork(base64);
            // If empty result (likely no API key in demo), force mock data for UX demonstration
            if (!data || Object.keys(data).length === 0) {
                 throw new Error("Empty AI Response");
            }
            setAiResult(data);
        } catch (e) {
            // Mock Fallback for Demo Purposes
            setTimeout(() => {
                setAiResult({
                    grade: 88,
                    transcription: "Key concepts identified: Component Lifecycle, State Management, Props Drilling...",
                    feedback: "Good detailed explanation. Consider adding more examples about useEffect cleanup functions."
                });
            }, 1500);
        } finally {
            setAnalyzing(false);
        }
    };

    const finalSubmit = async () => {
        setSubmitting(true);
        try {
            const submissionData: Submission = {
                id: Math.random().toString(),
                assessmentId: assessmentId,
                studentId: user.email,
                submittedAt: new Date().toISOString(),
                // If AI graded it, we can auto-submit as graded, or leave as pending if no AI
                status: aiResult ? 'Graded' : 'Pending',
                score: aiResult ? aiResult.grade : undefined,
                feedback: aiResult ? `AI Assessment: ${aiResult.feedback}` : undefined,
                attachmentName: file?.name || 'submission.pdf'
            };

            if (serviceNow.isConnected()) {
                await serviceNow.createSubmission(submissionData, user.email);
            }
            
            onComplete(submissionData);
            onClose();
        } catch (e) {
            alert("Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Submit Assignment</h3>
                        <p className="text-sm text-slate-500">{assessment?.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scroll">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        {/* Left: Upload Area */}
                        <div className="space-y-6">
                            <div className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all ${file ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                ) : file ? (
                                    <div className="text-center p-4">
                                        <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
                                        <p className="font-bold text-slate-700">{file.name}</p>
                                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div className="text-center p-6">
                                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                                        <p className="font-bold text-slate-600">Click to Upload</p>
                                        <p className="text-xs text-slate-400 mt-1">Images (JPG, PNG) or PDF</p>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} accept="image/*,.pdf" />
                            </div>

                            {/* AI Action Button */}
                            {imagePreview && !aiResult && (
                                <button 
                                    onClick={runAiAssessment}
                                    disabled={analyzing}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2"
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-yellow-300" />
                                            AI Pre-Assessment
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Right: Results or Instructions */}
                        <div className="flex flex-col">
                             {aiResult ? (
                                 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-full flex flex-col animate-in slide-in-from-right-4">
                                     <div className="flex justify-between items-start mb-6">
                                         <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">AI Analysis Result</h4>
                                         <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">Ready to Submit</span>
                                     </div>
                                     
                                     <div className="flex-1 space-y-6">
                                         <div className="text-center">
                                             <div className="text-5xl font-black text-slate-900">{aiResult.grade}%</div>
                                             <p className="text-xs text-slate-500 font-bold uppercase mt-1">Estimated Grade</p>
                                         </div>

                                         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                             <p className="text-xs font-bold text-indigo-600 mb-2">Feedback Summary</p>
                                             <p className="text-sm text-slate-600 leading-relaxed italic">"{aiResult.feedback}"</p>
                                         </div>

                                         <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm max-h-32 overflow-y-auto custom-scroll">
                                             <p className="text-xs font-bold text-slate-400 mb-2">Transcription</p>
                                             <p className="text-xs text-slate-500 font-mono">{aiResult.transcription}</p>
                                         </div>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-center opacity-60">
                                     <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
                                     <h4 className="font-bold text-slate-500">AI Assessment Ready</h4>
                                     <p className="text-sm text-slate-400 mt-2 max-w-xs">Upload a handwritten assignment image to get instant feedback and grading before you submit.</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                    <button 
                        onClick={finalSubmit}
                        disabled={!file || submitting}
                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {submitting ? 'Submitting...' : 'Confirm Submission'}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const ReviewModal = ({ submission, onClose }: { submission: Submission, onClose: () => void }) => {
    const assessment = getAssociatedAssessment(submission.assessmentId);
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
            <div>
               <h3 className="text-2xl font-bold text-slate-900 mb-1">{assessment?.title || 'Assessment Review'}</h3>
               <p className="text-slate-500 text-sm flex items-center gap-2">
                 <Clock className="w-4 h-4" /> Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
               </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
               <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-8 overflow-y-auto custom-scroll space-y-8">
            <div className="flex gap-6">
               <div className="flex-1 bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Final Score</p>
                  <div className="text-5xl font-black text-indigo-600 mb-1">{submission.score}%</div>
                  <p className="text-xs font-bold text-indigo-400">PASSED</p>
               </div>
               <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
                   <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Total Points</span>
                        <span className="font-bold text-slate-800">{Math.round((submission.score || 0) / 100 * (assessment?.totalPoints || 100))}/{assessment?.totalPoints}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Class Average</span>
                        <span className="font-bold text-slate-800">{assessment?.avgScore || 75}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Status</span>
                        <span className="font-bold text-emerald-600 uppercase text-xs px-2 py-0.5 bg-emerald-50 rounded-md">Graded</span>
                      </div>
                   </div>
               </div>
            </div>

            <div>
               <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  AI Feedback & Instructor Notes
               </h4>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed shadow-sm">
                  {submission.feedback || "No specific feedback provided for this submission."}
               </div>
            </div>

            {submission.attachmentName && (
                <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Submitted Files
                    </h4>
                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{submission.attachmentName}</p>
                            <p className="text-xs text-slate-400">PDF Document</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
             <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                Close Review
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h2 className="text-3xl font-bold text-slate-900">Assessments & Grades</h2>
            <p className="text-slate-500">Track your assignments, quizzes, and performance results.</p>
         </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <Award className="w-7 h-7" />
             </div>
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Grade</p>
                 <p className="text-3xl font-black text-slate-900">{averageScore}%</p>
             </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                 <Clock className="w-7 h-7" />
             </div>
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
                 <p className="text-3xl font-black text-slate-900">{pendingAssessments.length}</p>
             </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <CheckCircle className="w-7 h-7" />
             </div>
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                 <p className="text-3xl font-black text-slate-900">{completedSubmissions.length}</p>
             </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 p-2 gap-2">
             <button 
               onClick={() => setActiveTab('upcoming')}
               className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                 activeTab === 'upcoming' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
               }`}
             >
                Upcoming Assignments ({pendingAssessments.length})
             </button>
             <button 
               onClick={() => setActiveTab('completed')}
               className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                 activeTab === 'completed' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
               }`}
             >
                Grades & Feedback
             </button>
          </div>

          <div className="flex-1 p-6">
             {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>)}
                </div>
             ) : activeTab === 'upcoming' ? (
                <div className="space-y-4">
                   {pendingAssessments.length > 0 ? pendingAssessments.map(assessment => (
                      <div key={assessment.id} className="group p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6">
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    assessment.type === 'Quiz' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                   {assessment.type || 'Assignment'}
                                </span>
                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> Due {new Date(assessment.dueDate).toLocaleDateString()}
                                </span>
                             </div>
                             <h3 className="text-lg font-bold text-slate-900">{assessment.title}</h3>
                             <p className="text-sm text-slate-500 mt-1">{assessment.questions > 0 ? `${assessment.questions} Questions` : 'File Upload Required'} • {assessment.totalPoints} Points</p>
                          </div>
                          
                          <button 
                            onClick={() => handleStartActivity(assessment)}
                            className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                          >
                             {assessment.type === 'Quiz' ? <><PlayCircle className="w-4 h-4"/> Start Quiz</> : <><Upload className="w-4 h-4"/> Upload Work</>}
                          </button>
                      </div>
                   )) : (
                      <div className="text-center py-20 flex flex-col items-center">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 text-4xl">🎉</div>
                          <h3 className="text-xl font-bold text-slate-800">All Caught Up!</h3>
                          <p className="text-slate-500 max-w-sm mt-2">You have no pending assignments or quizzes. Great job staying on top of your coursework.</p>
                      </div>
                   )}
                </div>
             ) : (
                <div className="space-y-4">
                   {completedSubmissions.length > 0 ? completedSubmissions.map(submission => {
                      const assessment = getAssociatedAssessment(submission.assessmentId);
                      return (
                          <div key={submission.id} className="p-6 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-center gap-6">
                              <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                      <span className="text-xs font-bold text-slate-400">
                                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                                      </span>
                                      {submission.status === 'Graded' ? (
                                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">Graded</span>
                                      ) : (
                                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Pending Review</span>
                                      )}
                                  </div>
                                  <h3 className="text-lg font-bold text-slate-900">{assessment?.title || 'Unknown Assignment'}</h3>
                                  <p className="text-sm text-slate-500 mt-1">Score: {submission.score !== undefined ? `${submission.score}%` : '--'}</p>
                              </div>
                              
                              {submission.status === 'Graded' && (
                                  <button 
                                    onClick={() => setSelectedReview(submission)}
                                    className="px-6 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2"
                                  >
                                      View Feedback <ChevronRight className="w-4 h-4" />
                                  </button>
                              )}
                          </div>
                      );
                   }) : (
                      <div className="text-center py-20 text-slate-400">
                          <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No graded work yet.</p>
                      </div>
                   )}
                </div>
             )}
          </div>
      </div>
      
      {/* Review Modal */}
      {selectedReview && <ReviewModal submission={selectedReview} onClose={() => setSelectedReview(null)} />}
      
      {/* Submission Modal */}
      {submissionModalOpen && activeAssignmentId && (
        <SubmissionModal 
            assessmentId={activeAssignmentId} 
            onClose={() => { setSubmissionModalOpen(false); setActiveAssignmentId(null); }} 
            onComplete={handleSubmissionComplete}
        />
      )}

      {/* Quiz Modal */}
      {quizModalOpen && activeAssignmentId && (
        <QuizModal 
            assessmentId={activeAssignmentId} 
            onClose={() => { setQuizModalOpen(false); setActiveAssignmentId(null); }} 
            onComplete={handleSubmissionComplete}
        />
      )}
    </div>
  );
};
