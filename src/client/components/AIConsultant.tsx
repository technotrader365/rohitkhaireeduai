
import React, { useState, useEffect, useRef } from 'react';
import { getAIConsultation } from '../services/geminiService';
import { useUser } from '../context/UserContext';
import { useCourses } from '../context/CourseContext';
import { mockEvents } from '../store/mockStore';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';

// Simple Markdown Renderer Component
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1"></div>;
        
        // List Item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-indigo-500 font-bold">•</span>
              <p className="flex-1 text-sm">{parseBold(trimmed.substring(2))}</p>
            </div>
          );
        }
        
        return <p key={i} className="text-sm leading-relaxed">{parseBold(line)}</p>;
      })}
    </div>
  );
};

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export const AIConsultant: React.FC = () => {
  const { user } = useUser();
  const { courses } = useCourses();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  // Initial Greeting
  useEffect(() => {
    if (open && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      setLoading(true);
      // Simulate a small delay for natural feel
      setTimeout(() => {
        setMessages([{
          role: 'model',
          parts: [{ text: `Hello **${user.name}**! 👋\n\nI'm your personal Academic Mentor. I see you're enrolled in **${courses.filter(c => c.enrolled).length} active courses**. \n\nHow can I support your studies today? I can help with:\n- Course recommendations\n- Deadline management\n- Study strategies` }]
        }]);
        setLoading(false);
      }, 1000);
    }
  }, [open, hasGreeted, messages.length, user.name, courses]);

  const buildContext = () => {
    const enrolled = courses.filter(c => c.enrolled);
    const catalog = courses.filter(c => !c.enrolled);
    const upcomingEvents = mockEvents.filter(e => new Date(e.date) > new Date()).slice(0, 5);

    return `
      USER PROFILE:
      Name: ${user.name}
      Role: ${user.role}

      CURRENT STATUS:
      Enrolled in ${enrolled.length} courses.
      
      ENROLLED COURSES:
      ${enrolled.map(c => `- ${c.title} (Progress: ${c.progress}%, Modules: ${c.completedModules}/${c.totalModules})`).join('\n')}

      COURSE CATALOG (Available to Enroll):
      ${catalog.map(c => `- ${c.title}: ${c.description} (Skills: ${c.skills?.join(', ')})`).join('\n')}

      UPCOMING DEADLINES & EVENTS:
      ${upcomingEvents.map(e => `- ${e.title} (${e.type}) on ${e.date.toDateString()}`).join('\n')}
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    const newMessages = [...messages, { role: 'user' as const, parts: [{ text: userMsg }] }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    try {
      const context = buildContext();
      const aiResponse = await getAIConsultation(newMessages, context);
      setMessages([...newMessages, { role: 'model' as const, parts: [{ text: aiResponse || '' }] }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'model' as const, parts: [{ text: "I'm having trouble connecting to the neural network. Please check your internet connection." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4 pointer-events-none">
      {open ? (
        <div className="pointer-events-auto w-[400px] h-[600px] bg-white rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500 border border-slate-100 ring-4 ring-white/50 backdrop-blur-xl">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                 <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">SnapX Mentor</h3>
                <div className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                   <p className="text-[10px] text-indigo-100 font-medium uppercase tracking-wider">Online</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all relative z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Chat Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scroll">
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                 {m.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                        <span className="text-sm">🤖</span>
                    </div>
                 )}
                 <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm ${
                   m.role === 'user' 
                     ? 'bg-indigo-600 text-white rounded-br-none' 
                     : 'bg-white border border-slate-200 text-slate-600 rounded-bl-none'
                 }`}>
                   {m.role === 'user' ? m.parts[0].text : <FormattedText text={m.parts[0].text} />}
                 </div>
               </div>
             ))}
             
             {loading && (
                <div className="flex justify-start animate-in fade-in">
                   <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                        <span className="text-sm">🤖</span>
                   </div>
                   <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none flex gap-1.5 items-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                   </div>
                </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for advice..."
                  className="w-full bg-slate-50 border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-2xl pl-5 pr-14 py-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400 font-medium">AI can make mistakes. Verify important info.</p>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          className="pointer-events-auto group relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] blur opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
          <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-xl border border-slate-100 flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all relative z-10 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <MessageSquare className="w-7 h-7 text-indigo-600 fill-indigo-100" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full z-20"></div>
        </button>
      )}
    </div>
  );
};
