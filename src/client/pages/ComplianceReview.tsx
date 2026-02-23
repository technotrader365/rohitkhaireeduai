
import React, { useState, useEffect } from 'react';
import { serviceNow } from '../services/serviceNowService';
import { mockStudentsList } from '../store/mockStore';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const ComplianceReview: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (serviceNow.isConnected()) {
        try {
           const data = await serviceNow.getAllComplianceRecords();
           setRecords(data);
        } catch (e) {
           console.error(e);
        }
      } else {
        // Generate Mock Data if no connection
        const mockRecords = mockStudentsList.map((s, i) => {
            const isCompliant = i % 3 !== 0; // 2/3 compliant
            return {
                id: s.id,
                studentName: s.name,
                isCompliant,
                score: isCompliant ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50) + 20,
                reason: isCompliant ? 'Passed ergonomic checks.' : 'Poor lighting, messy background detected.',
                date: new Date().toISOString()
            };
        });
        setRecords(mockRecords);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = {
      total: records.length,
      compliant: records.filter(r => r.isCompliant).length,
      avgScore: Math.round(records.reduce((acc, r) => acc + r.score, 0) / (records.length || 1))
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
          <h2 className="text-3xl font-bold text-slate-800">Workspace Compliance Review</h2>
          <p className="text-slate-500">Audit results for student home-study environments.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <Shield className="w-7 h-7" />
             </div>
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Safety Score</p>
                 <p className="text-3xl font-black text-slate-900">{stats.avgScore}%</p>
             </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <CheckCircle className="w-7 h-7" />
             </div>
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliant</p>
                 <p className="text-3xl font-black text-slate-900">{stats.compliant}</p>
             </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                 <AlertTriangle className="w-7 h-7" />
             </div>
             <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Non-Compliant</p>
                 <p className="text-3xl font-black text-slate-900">{stats.total - stats.compliant}</p>
             </div>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h3 className="font-bold text-slate-800">Student Audit Logs</h3>
           {loading && <span className="text-xs text-indigo-600 animate-pulse font-bold">Refreshing...</span>}
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                 <tr>
                    <th className="px-6 py-4 font-bold">Student Name</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Safety Score</th>
                    <th className="px-6 py-4 font-bold">AI Reason / Observations</th>
                    <th className="px-6 py-4 font-bold text-right">Last Audit</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {records.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-800">{record.studentName}</td>
                       <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              record.isCompliant 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                             {record.isCompliant ? 'Compliant' : 'Non-Compliant'}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                               <span className={`font-bold ${record.score < 70 ? 'text-rose-500' : 'text-slate-700'}`}>{record.score}%</span>
                               <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full ${record.score < 70 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                      style={{width: `${record.score}%`}}
                                   ></div>
                               </div>
                           </div>
                       </td>
                       <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={record.reason}>
                          {record.reason}
                       </td>
                       <td className="px-6 py-4 text-right text-slate-400 text-xs">
                          {new Date(record.date).toLocaleDateString()}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
