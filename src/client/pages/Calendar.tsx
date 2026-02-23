
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Plus, Sparkles, X, BookOpen, AlignLeft } from 'lucide-react';
import { mockEvents } from '../store/mockStore';
import { CalendarEvent } from '../types';
import { useUser } from '../context/UserContext';
import { useCourses } from '../context/CourseContext';
import { serviceNow } from '../services/serviceNowService';
import { generateStudySchedule } from '../services/geminiService';

export const Calendar: React.FC = () => {
  const { user } = useUser();
  const { courses } = useCourses();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState(mockEvents);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Custom Event Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '1h',
    description: ''
  });

  const isAdmin = user.role === 'admin' || user.role === 'teacher';
  const enrolledCourses = courses.filter(c => c.enrolled);

  useEffect(() => {
    if (serviceNow.isConnected()) {
      setLoading(true);
      serviceNow.getEvents(user.email)
        .then(data => setEvents(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user.email]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const daysArray = [...Array(daysInMonth + firstDayOfMonth).keys()];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      return e.date.getDate() === day && 
             e.date.getMonth() === month && 
             e.date.getFullYear() === year;
    });
  };

  const openAddModal = () => {
    // Pre-fill date with selected date from calendar
    // Adjust for timezone offset to ensure the date string is correct for the user's locale
    const offset = selectedDate.getTimezoneOffset();
    const localDate = new Date(selectedDate.getTime() - (offset*60*1000));
    
    setNewEvent(prev => ({
        ...prev,
        date: localDate.toISOString().split('T')[0]
    }));
    setShowEventModal(true);
  };

  const handleCreateEvent = async () => {
     if (!newEvent.title) return;
     
     const eventDate = new Date(`${newEvent.date}T${newEvent.time}`);
     
     const eventPayload: Partial<CalendarEvent> = {
        title: newEvent.title,
        date: eventDate,
        type: 'study',
        courseId: newEvent.courseId,
        duration: newEvent.duration,
        description: newEvent.description || 'Custom study session'
     };

     if (serviceNow.isConnected()) {
       try {
         await serviceNow.createEvent(eventPayload, user.email);
         // Refresh
         const updated = await serviceNow.getEvents(user.email);
         setEvents(updated);
       } catch (e) {
         console.error(e);
         alert('Failed to sync event');
       }
     } else {
       setEvents([...events, { ...eventPayload, id: Math.random().toString(), date: eventDate } as CalendarEvent]);
     }
     setShowEventModal(false);
     setNewEvent({
        title: '',
        courseId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: '1h',
        description: ''
     });
  };

  const handleAIPlan = async () => {
    setGenerating(true);
    try {
      const upcomingDeadlines = events.filter(e => e.type === 'deadline' || e.type === 'exam')
        .map(e => `${e.title} on ${e.date.toDateString()}`).join(', ');
      
      const newStudySessions = await generateStudySchedule(upcomingDeadlines, new Date().toDateString());
      
      const convertedEvents = newStudySessions.map((s: any) => ({
        id: Math.random().toString(),
        title: s.title,
        date: new Date(s.date + 'T10:00:00'),
        type: 'study',
        duration: s.duration,
        description: `AI Suggested: ${s.description}`
      }));
      
      setEvents(prev => [...prev, ...convertedEvents]);
    } catch (e) {
      console.error("AI Generation failed", e);
      alert("Could not generate study plan.");
    } finally {
      setGenerating(false);
    }
  };

  const getTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return 'bg-rose-500 text-white';
      case 'deadline': return 'bg-amber-500 text-white';
      case 'study': return 'bg-indigo-500 text-white';
      case 'social': return 'bg-emerald-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getTypeStyle = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam': return 'border-l-rose-500 bg-rose-50';
      case 'deadline': return 'border-l-amber-500 bg-amber-50';
      case 'study': return 'border-l-indigo-500 bg-indigo-50';
      case 'social': return 'border-l-emerald-500 bg-emerald-50';
      default: return 'border-l-slate-500 bg-slate-50';
    }
  };

  const selectedDayEvents = events.filter(e => 
    e.date.getDate() === selectedDate.getDate() && 
    e.date.getMonth() === selectedDate.getMonth() &&
    e.date.getFullYear() === selectedDate.getFullYear()
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] animate-in fade-in duration-500 relative">
      
      {/* Main Calendar Section */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <CalIcon className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
               <div className="flex items-center gap-2">
                 <p className="text-xs text-slate-500 font-medium">Academic Schedule</p>
                 {loading && <span className="text-[10px] text-indigo-500 animate-pulse">Syncing...</span>}
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
               <ChevronRight className="w-5 h-5" />
             </button>
             <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg ml-2 hover:bg-slate-800">Today</button>
             
             {!isAdmin && (
               <>
                 <button 
                   onClick={openAddModal}
                   className="ml-2 px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                 >
                   <Plus className="w-3 h-3" /> Set Reminder
                 </button>
                 <button 
                   onClick={handleAIPlan} 
                   disabled={generating}
                   className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center gap-2"
                 >
                   {generating ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                   )}
                   AI Plan
                 </button>
               </>
             )}
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px border-b border-slate-200 overflow-y-auto">
           {daysArray.map((i) => {
             const dayNumber = i - firstDayOfMonth + 1;
             if (dayNumber <= 0) return <div key={i} className="bg-white/50"></div>;
             
             const isToday = new Date().toDateString() === new Date(year, month, dayNumber).toDateString();
             const isSelected = selectedDate.getDate() === dayNumber && selectedDate.getMonth() === month;
             const dayEvents = getEventsForDay(dayNumber);

             return (
               <div 
                 key={i} 
                 onClick={() => setSelectedDate(new Date(year, month, dayNumber))}
                 className={`bg-white p-2 min-h-[100px] relative group cursor-pointer transition-all hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/30 ring-inset ring-2 ring-indigo-500/20 z-10' : ''}`}
               >
                 <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'}`}>
                   {dayNumber}
                 </span>
                 
                 <div className="space-y-1">
                   {dayEvents.map(event => (
                     <div key={event.id} className={`text-[10px] px-2 py-1 rounded-md font-bold truncate ${getTypeColor(event.type)} shadow-sm`}>
                        {event.title}
                     </div>
                   ))}
                 </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Side Panel: Selected Day & Upcoming */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        
        {/* Selected Day Detail */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col">
           <div className="flex items-center justify-between mb-6">
             <div>
                <h3 className="text-3xl font-bold text-slate-900">{selectedDate.getDate()}</h3>
                <p className="text-slate-500 font-medium uppercase tracking-wider text-xs">{monthNames[selectedDate.getMonth()]}, {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
             </div>
             {isAdmin && (
               <button 
                 onClick={openAddModal}
                 className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 hover:shadow-lg transition-all"
               >
                 <Plus className="w-5 h-5"/>
               </button>
             )}
           </div>

           <div className="flex-1 space-y-3 overflow-y-auto custom-scroll">
             {selectedDayEvents.length > 0 ? selectedDayEvents.map(event => (
               <div key={event.id} className={`p-4 rounded-2xl border-l-4 ${getTypeStyle(event.type)} transition-transform hover:scale-[1.02] cursor-default bg-opacity-50`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{event.type}</span>
                    {event.duration && (
                      <div className="flex items-center gap-1 text-xs font-bold opacity-60">
                        <Clock className="w-3 h-3" />
                        {event.duration}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{event.title}</h4>
                  {event.description && <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>}
               </div>
             )) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <div className="text-4xl mb-2">☕</div>
                  <p className="text-sm font-bold">No events scheduled.</p>
                  <p className="text-xs">Enjoy your free time!</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Set Study Reminder</h3>
                  <button onClick={() => setShowEventModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                      <X className="w-5 h-5" />
                  </button>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><BookOpen className="w-3 h-3" /> Topic / Title</label>
                    <input 
                      className="w-full border border-slate-200 rounded-xl p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="e.g. Review React Hooks" 
                      value={newEvent.title}
                      onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      autoFocus
                    />
                 </div>
                 
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Related Course (Optional)</label>
                    <select
                        className="w-full border border-slate-200 rounded-xl p-3 mt-1 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newEvent.courseId}
                        onChange={e => setNewEvent({...newEvent, courseId: e.target.value})}
                    >
                        <option value="">-- General Study --</option>
                        {enrolledCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><CalIcon className="w-3 h-3" /> Date</label>
                        <input 
                          type="date" 
                          className="w-full border border-slate-200 rounded-xl p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                          value={newEvent.date}
                          onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Time</label>
                        <input 
                          type="time" 
                          className="w-full border border-slate-200 rounded-xl p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                          value={newEvent.time}
                          onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</label>
                        <select
                          className="w-full border border-slate-200 rounded-xl p-3 mt-1 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                          value={newEvent.duration}
                          onChange={e => setNewEvent({...newEvent, duration: e.target.value})}
                        >
                            <option value="30m">30m</option>
                            <option value="1h">1h</option>
                            <option value="1.5h">1.5h</option>
                            <option value="2h">2h</option>
                            <option value="3h">3h</option>
                        </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Description</label>
                    <textarea 
                        className="w-full border border-slate-200 rounded-xl p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                        placeholder="Focus on..."
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    />
                 </div>

                 <button 
                    onClick={handleCreateEvent}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl mt-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                 >
                    Set Reminder
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
