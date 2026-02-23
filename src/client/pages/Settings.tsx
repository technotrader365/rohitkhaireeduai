
import React, { useState, useEffect } from 'react';
import { saveConfig, serviceNow } from '../services/serviceNowService';

export const Settings: React.FC = () => {
  const [config, setConfig] = useState({ 
    instance: 'dev265902', 
    username: 'admin', 
    token: 'yx/jUn3LGV=6' 
  });
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    const existing = localStorage.getItem('sn_config');
    if (existing) {
        setConfig(JSON.parse(existing));
    }
    // If not existing, it defaults to the hardcoded values in useState, which matches our request.
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(config);
    setSaved(true);
    setTestStatus('testing');

    try {
      // Simple test fetch to verify creds
      await serviceNow.getCourses();
      setTestStatus('success');
    } catch (err) {
      setTestStatus('failed');
    }
    
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">System Integration</h2>
        <p className="text-slate-500">Configure your ServiceNow instance connection.</p>
      </header>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">ServiceNow Instance Name</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">https://</span>
            <input 
              type="text" 
              placeholder="dev12345"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none transition-all"
              value={config.instance}
              onChange={e => setConfig({...config, instance: e.target.value})}
            />
            <span className="text-slate-400 font-medium">.service-now.com</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">API Username</label>
          <input 
            type="text" 
            placeholder="admin"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none"
            value={config.username}
            onChange={e => setConfig({...config, username: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Application Password / Token</label>
          <input 
            type="password" 
            placeholder="••••••••••••"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none"
            value={config.token}
            onChange={e => setConfig({...config, token: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          disabled={testStatus === 'testing'}
          className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all ${
            testStatus === 'failed' 
              ? 'bg-rose-600 text-white shadow-rose-200' 
              : testStatus === 'success' 
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
          }`}
        >
          {testStatus === 'testing' ? 'Testing Connection...' : 
           testStatus === 'success' ? 'Connected Successfully! ✓' : 
           testStatus === 'failed' ? 'Connection Failed (Check Creds/Network)' : 'Connect to ServiceNow'}
        </button>
        
        <p className="text-center text-xs text-slate-400">
          EduPulse AI uses the <b>ServiceNow Table API</b> to sync student records in real-time.
          <br/>Ensure your user has <code>rest_api_explorer</code> or admin roles.
        </p>
      </form>
    </div>
  );
};
