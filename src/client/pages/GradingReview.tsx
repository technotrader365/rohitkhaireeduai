
import React, { useState } from 'react';
import { reviewHandwrittenWork } from '../services/geminiService';
import { serviceNow } from '../services/serviceNowService';

export const GradingReview: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleReview = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const data = await reviewHandwrittenWork(base64Data);
      setResult(data);
      
      // Auto-push to ServiceNow u_exam_reviews
      if (localStorage.getItem('sn_config')) {
        setSyncing(true);
        try {
          await serviceNow.saveGradingRecord({
            u_student: 'System Admin',
            u_subject: data.subject || 'General Assessment',
            u_grade: data.grade,
            u_transcription: data.transcription,
            u_feedback: data.feedback,
            short_description: `AI Review: ${data.subject}`
          });
        } catch (snErr) {
          console.warn("SN Sync Failed", snErr);
        }
        setSyncing(false);
      }
    } catch (error) {
      console.error(error);
      alert('AI Processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Exam <span className="gradient-text italic">Review</span></h2>
          <p className="text-slate-500 font-medium">Digitalizing handwritten work with high-accuracy AI OCR.</p>
        </div>
        {result && (
          <div className="flex gap-2">
             <button onClick={() => {setImage(null); setResult(null);}} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">New Assessment</button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
           <div className="glass p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 sticky top-10 border-2 border-white">
              <div className="aspect-[3/4] bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative group">
                {image ? (
                  <img src={image} alt="Submission" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-10">
                    <div className="text-6xl mb-6">🖋️</div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Paper Submission</h4>
                    <p className="text-xs text-slate-400 mb-8 max-w-[200px] mx-auto">Upload a clear photo of handwritten notes or exam papers.</p>
                    <label className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm cursor-pointer hover:bg-black transition-all shadow-xl shadow-slate-200">
                      Browse Files
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                )}
              </div>

              {image && !result && (
                <button
                  onClick={handleReview}
                  disabled={loading}
                  className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Digitizing...
                    </>
                  ) : 'Process with AI'}
                </button>
              )}
           </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="h-[600px] glass rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center p-12">
               <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce shadow-inner">🧠</div>
               <h3 className="text-2xl font-bold text-slate-400">Waiting for Script</h3>
               <p className="text-sm text-slate-400 mt-2 max-w-sm">AI analysis will categorize text, estimate scores, and provide automated feedback synchronized with ServiceNow.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-20 bg-white rounded-[2rem]"></div>
              <div className="h-64 bg-white rounded-[3rem]"></div>
              <div className="h-40 bg-white rounded-[2rem]"></div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="glass p-8 rounded-[3rem] shadow-xl shadow-slate-100/50 border border-white">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{result.subject || 'AI Assessment'}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Submission Analysis</p>
                  </div>
                  <div className="bg-indigo-600 px-6 py-4 rounded-3xl text-white text-center shadow-lg shadow-indigo-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Grade</p>
                    <p className="text-3xl font-black leading-none">{result.grade}%</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                      Transcribed Text
                    </h4>
                    <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                      "{result.transcription}"
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      AI Tutor Feedback
                    </h4>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 text-emerald-900 text-sm font-medium leading-relaxed shadow-sm">
                      {result.feedback}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></div>
                      {syncing ? 'Syncing to SN...' : 'Saved to ServiceNow'}
                    </div>
                    <button className="text-xs font-bold text-indigo-600 hover:underline">View in Portal</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
