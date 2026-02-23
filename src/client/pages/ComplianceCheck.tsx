
import React, { useState, useEffect } from 'react';
import { analyzeCompliance } from '../services/geminiService';
import { serviceNow } from '../services/serviceNowService';
import { ComplianceResult } from '../types';
import { useUser } from '../context/UserContext';
import { CheckCircle, AlertTriangle, Shield, RefreshCw } from 'lucide-react';

export const ComplianceCheck: React.FC = () => {
  const { user } = useUser();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [syncing, setSyncing] = useState(false);
  
  // Existing Status State
  const [currentStatus, setCurrentStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    fetchLatestStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLatestStatus = async () => {
    setLoadingStatus(true);
    if (serviceNow.isConnected()) {
        try {
            const status = await serviceNow.getLatestCompliance(user.name); // Using Name/Email depending on SN field
            setCurrentStatus(status);
        } catch (e) {
            console.error("Failed to fetch compliance status", e);
        }
    } else {
        // Mock existing status for demo if not connected
        setTimeout(() => {
            setCurrentStatus({
                isCompliant: true,
                score: 85,
                date: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
                observations: ['Good lighting', 'Ergonomic chair present'],
                recommendations: 'Consider reducing cable clutter.'
            });
        }, 800);
    }
    setLoadingStatus(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const data = await analyzeCompliance(base64Data);
      setResult(data);
      
      // Auto-push to ServiceNow if configured
      if (localStorage.getItem('sn_config')) {
        setSyncing(true);
        try {
          await serviceNow.saveComplianceRecord({
            u_student: user.name,
            u_score: data.score,
            u_compliant: data.isCompliant,
            u_observations: data.observations.join('\n'),
            short_description: 'AI Home Study Compliance Check'
          });
          // Refresh status after save
          fetchLatestStatus();
        } catch (snErr) {
          console.warn("SN Sync Failed, continuing anyway", snErr);
        }
        setSyncing(false);
      }
    } catch (error) {
      console.error(error);
      alert('AI Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Study <span className="text-indigo-600">Compliance</span></h2>
          <p className="text-slate-500 font-medium">Verify your learning environment using Computer Vision.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Audit Protocol Active</span>
        </div>
      </header>

      {/* Existing Status Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield className="w-40 h-40 text-slate-900" />
         </div>
         
         <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                Current Audit Status
                {loadingStatus && <span className="text-xs font-normal text-slate-400 animate-pulse">(Refreshing...)</span>}
            </h3>
            
            {loadingStatus ? (
                <div className="flex gap-4 animate-pulse">
                    <div className="h-20 w-20 bg-slate-100 rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    </div>
                </div>
            ) : currentStatus ? (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className={`p-6 rounded-3xl text-center min-w-[160px] ${currentStatus.isCompliant ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'}`}>
                        <div className="text-4xl font-black mb-1">{currentStatus.score}%</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                            {currentStatus.isCompliant ? <CheckCircle className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                            {currentStatus.isCompliant ? 'Compliant' : 'Attention'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">Last Checked:</span>
                            <span className="text-sm font-bold text-slate-800">{new Date(currentStatus.date || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-2 mb-4">
                           {currentStatus.observations?.slice(0, 2).map((obs: string, i: number) => (
                               <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                   {obs}
                               </div>
                           ))}
                        </div>
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block">
                           "{currentStatus.recommendations}"
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400">
                    <p>No active compliance record found.</p>
                </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Upload Card */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <RefreshCw className="w-5 h-5 text-indigo-600" /> New Assessment
          </h3>
          
          <div className="aspect-square bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group flex-1">
            {image ? (
              <>
                <img src={image} alt="Workspace" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => {setImage(null); setResult(null);}} className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold">Replace Image</button>
                </div>
              </>
            ) : (
              <div className="text-center p-10">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-4xl mx-auto mb-6">📸</div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Workspace Scan</h4>
                <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">Upload a clear photo of your desk, chair, and lighting setup.</p>
                <label className="inline-block bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold cursor-pointer hover:bg-black transition-all shadow-xl shadow-slate-300">
                  Select Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            )}
          </div>

          {image && !result && (
            <button
              onClick={handleAnalysis}
              disabled={loading}
              className={`mt-6 w-full py-5 rounded-[2rem] font-black text-lg text-white transition-all transform active:scale-95 ${
                loading ? 'bg-indigo-300' : 'bg-indigo-600 shadow-2xl shadow-indigo-200 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   AI Analyzing Environment...
                </span>
              ) : 'Begin AI Assessment'}
            </button>
          )}
        </div>

        {/* Results Card */}
        <div className="relative">
          {result ? (
            <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 animate-in zoom-in duration-500 h-full">
              <div className="flex justify-between items-center mb-10">
                <div className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">New Report</div>
                {syncing && <span className="text-[10px] font-bold text-indigo-500 animate-pulse italic">Syncing to ServiceNow...</span>}
              </div>

              <div className="text-center mb-10">
                <div className={`text-7xl font-black mb-2 ${result.isCompliant ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {result.score}%
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace Health Score</div>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">AI Observations</h4>
                  <ul className="space-y-4">
                    {result.observations.map((obs, i) => (
                      <li key={i} className="text-sm font-semibold text-slate-700 flex items-start gap-4">
                        <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm text-[10px] mt-0.5">✓</span>
                        {obs}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                  <h4 className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-4">AI Roadmap</h4>
                  <p className="text-lg font-bold leading-tight">{result.recommendations}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center opacity-60">
              <div className="text-6xl grayscale mb-6">🤖</div>
              <h3 className="text-xl font-bold text-slate-400">Analysis Pending</h3>
              <p className="text-sm text-slate-400 mt-2">Waiting for workspace submission to generate your safety report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
