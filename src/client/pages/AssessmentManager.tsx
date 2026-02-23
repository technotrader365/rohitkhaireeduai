
import React, { useState, useEffect } from 'react';
import { mockAssessments } from '../store/mockStore';
import { Assessment } from '../types';
import { serviceNow } from '../services/serviceNowService';

export const AssessmentManager: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAssessment, setNewAssessment] = useState<Partial<Assessment>>({ type: 'Quiz' });

  useEffect(() => {
    if (serviceNow.isConnected()) {
      setLoading(true);
      serviceNow.getAssessments()
        .then(data => setAssessments(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleCreate = async () => {
    if (!newAssessment.title) return;
    
    if (serviceNow.isConnected()) {
      setLoading(true);
      try {
        await serviceNow.createAssessment({
          ...newAssessment,
          status: 'Draft'
        });
        const updated = await serviceNow.getAssessments();
        setAssessments(updated);
        setShowCreate(false);
        setNewAssessment({ type: 'Quiz' }); // Reset form
      } catch (e) {
        alert('Failed to create assessment in ServiceNow');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback
      setAssessments([...assessments, { 
        id: Math.random().toString(), 
        ...newAssessment, 
        courseId: 'c1', 
        status: 'Draft', 
        questions: 10,
        totalPoints: newAssessment.totalPoints || 100,
        dueDate: newAssessment.dueDate || '2025-01-01',
        avgScore: 0,
        type: newAssessment.type || 'Quiz'
      } as Assessment]);
      setShowCreate(false);
      setNewAssessment({ type: 'Quiz' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Draft': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'Graded': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Assessments</h2>
          <p className="text-slate-500">Create quizzes, manage deadlines, and review grades.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          + Create New
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Active Quizzes</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{assessments.filter(a => a.status === 'Published').length}</p>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Drafts</p>
            <p className="text-3xl font-black text-amber-500 mt-2">{assessments.filter(a => a.status === 'Draft').length}</p>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Avg Class Score</p>
            <p className="text-3xl font-black text-emerald-500 mt-2">
               {Math.round(assessments.reduce((acc, curr) => acc + (curr.avgScore || 0), 0) / (assessments.length || 1))}%
            </p>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h3 className="font-bold text-slate-800">All Assessments</h3>
           {loading && <span className="text-xs text-indigo-600 animate-pulse font-bold">Syncing...</span>}
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                 <tr>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">Type</th>
                    <th className="px-6 py-4 font-bold">Due Date</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Avg Score</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {assessments.map(assessment => (
                    <tr key={assessment.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-800">{assessment.title}</td>
                       <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              assessment.type === 'Quiz' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                             {assessment.type || 'Quiz'}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-slate-500">{assessment.dueDate}</td>
                       <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(assessment.status)}`}>
                             {assessment.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 font-bold text-slate-700">{assessment.avgScore > 0 ? `${assessment.avgScore}%` : '-'}</td>
                       <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 font-bold hover:underline">Edit</button>
                       </td>
                    </tr>
                 ))}
                 {assessments.length === 0 && (
                   <tr>
                     <td colSpan={6} className="p-8 text-center text-slate-400 italic">No assessments found in ServiceNow.</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
      
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
              <h3 className="text-2xl font-bold mb-6">Create New Assessment</h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                    <input 
                      className="w-full border border-slate-200 rounded-xl p-3 mt-1" 
                      placeholder="e.g. Midterm Quiz" 
                      value={newAssessment.title || ''}
                      onChange={e => setNewAssessment({...newAssessment, title: e.target.value})}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                        <select
                           className="w-full border border-slate-200 rounded-xl p-3 mt-1 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                           value={newAssessment.type || 'Quiz'}
                           onChange={e => setNewAssessment({...newAssessment, type: e.target.value as any})}
                        >
                            <option value="Quiz">Quiz</option>
                            <option value="Assignment">Assignment</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Points</label>
                        <input 
                          type="number" 
                          className="w-full border border-slate-200 rounded-xl p-3 mt-1" 
                          placeholder="100" 
                          value={newAssessment.totalPoints || ''}
                          onChange={e => setNewAssessment({...newAssessment, totalPoints: parseInt(e.target.value)})}
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                    <input 
                       type="date" 
                       className="w-full border border-slate-200 rounded-xl p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                       value={newAssessment.dueDate || ''}
                       onChange={e => setNewAssessment({...newAssessment, dueDate: e.target.value})}
                    />
                 </div>

                 <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl mt-4 hover:bg-black" onClick={handleCreate}>
                    {loading ? 'Saving...' : 'Create Assessment'}
                 </button>
                 <button className="w-full text-slate-500 font-bold py-2 hover:text-red-500" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
