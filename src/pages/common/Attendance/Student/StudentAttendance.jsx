import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import { 
  FiActivity, FiBook, FiCheckCircle, FiXCircle, 
  FiCalendar, FiPieChart, FiInfo, FiLayers, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";

export default function StudentAttendance() {
  const user = useSelector((state) => state.user.data);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [records, setRecords] = useState([]);
  const [overallPercentage, setOverallPercentage] = useState(null);
  const [subjectPercentage, setSubjectPercentage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Custom Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.batch) return;
      try {
        const [subjRes, overallRes] = await Promise.all([
          api.get(`/batches/${user.batch}/subjects`),
          api.get("/attendance/student/overall")
        ]);
        setSubjects(subjRes.data.subjects || []);
        setOverallPercentage(overallRes.data.percentage ?? 0);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (!selectedSubject) {
      setRecords([]);
      setSubjectPercentage(null);
      return;
    }

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await api.get("/attendance/student", {
          params: { subjectId: selectedSubject },
        });

        const allRecords = res.data.records.map((rec) => ({
          date: new Date(rec.date).toDateString(), // Store as string for easy lookup
          status: rec.status?.toLowerCase() || "unknown",
        }));
        setRecords(allRecords);

        const presentCount = allRecords.filter((r) => r.status === "present").length;
        const percentage = allRecords.length > 0 ? ((presentCount / allRecords.length) * 100).toFixed(1) : 0;
        setSubjectPercentage(percentage);
      } catch (err) {
        console.error("Subject fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedSubject]);

  // --- CALENDAR LOGIC START ---
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const dayElements = [];

    // Empty slots for previous month's days
    for (let i = 0; i < startDay; i++) {
      dayElements.push(<div key={`empty-${i}`} className="h-14 sm:h-20 border border-slate-50"></div>);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = new Date(year, month, day).toDateString();
      const record = records.find((r) => r.date === dateStr);
      
      let statusStyles = "bg-white text-slate-400"; // Default
      let icon = null;

      if (record?.status === "present") {
        statusStyles = "bg-emerald-500 text-white shadow-lg shadow-emerald-100 ring-4 ring-emerald-50";
        icon = <FiCheckCircle className="absolute top-1 right-1 text-[8px] sm:text-xs" />;
      } else if (record?.status === "absent") {
        statusStyles = "bg-rose-500 text-white shadow-lg shadow-rose-100 ring-4 ring-rose-50";
        icon = <FiXCircle className="absolute top-1 right-1 text-[8px] sm:text-xs" />;
      }

      dayElements.push(
        <div 
          key={day} 
          className={`relative h-14 sm:h-20 border border-slate-50 flex items-center justify-center font-bold text-xs sm:text-lg transition-all ${statusStyles}`}
        >
          {day}
          {icon}
        </div>
      );
    }
    return dayElements;
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };
  // --- CALENDAR LOGIC END ---

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc] animate-in fade-in duration-700">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-2xl shadow-emerald-200">
              <FiCalendar size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Attendance Node</h2>
          </div>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] italic">Student Tracking System / CUH</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Overall Percentage Card */}
        <div className="bg-white p-8 rounded-[3rem] border border-emerald-50 shadow-xl shadow-emerald-100/20 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
          <div className="relative z-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Aggregate Presence</p>
            <div className="inline-flex items-center justify-center p-6 rounded-full bg-slate-50 border-8 border-emerald-500 shadow-inner">
               <span className="text-4xl font-black text-slate-800 tracking-tighter">
                {overallPercentage !== null ? `${overallPercentage}%` : "0%"}
               </span>
            </div>
            <div className={`mt-6 inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${overallPercentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {overallPercentage >= 75 ? 'Eligibility: Confirmed' : 'Warning: Shortage'}
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-emerald-50 shadow-xl shadow-emerald-100/20">
          <div className="flex items-center gap-3 mb-8">
            <FiLayers className="text-emerald-500" />
            <h3 className="text-lg font-black italic text-slate-800 uppercase tracking-tight">Select Subject</h3>
          </div>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-8 font-black text-slate-700 uppercase text-xs tracking-widest focus:bg-white focus:border-emerald-500 outline-none transition-all cursor-pointer appearance-none"
          >
            <option value="">Choose Subject</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          {selectedSubject && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
               <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Presence</p>
                  <p className="text-xl font-black text-emerald-700 italic">{subjectPercentage}%</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Days</p>
                  <p className="text-xl font-black text-slate-700 italic">{records.length}</p>
               </div>
               <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-center">
                  <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Missed</p>
                  <p className="text-xl font-black text-rose-700 italic">{records.filter(r => r.status === "absent").length}</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CUSTOM CALENDAR SECTION --- */}
      {selectedSubject ? (
        <div className="bg-white rounded-[3.5rem] border border-emerald-50 shadow-2xl shadow-emerald-100/30 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
            <button onClick={() => changeMonth(-1)} className="p-3 bg-white/10 rounded-xl hover:bg-emerald-600 transition-all"><FiChevronLeft /></button>
            <div className="text-center">
               <h3 className="text-xl font-black uppercase tracking-[0.2em] italic">
                 {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
               </h3>
               <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-1 italic">Subject Activity Log</p>
            </div>
            <button onClick={() => changeMonth(1)} className="p-3 bg-white/10 rounded-xl hover:bg-emerald-600 transition-all"><FiChevronRight /></button>
          </div>

          <div className="p-4 sm:p-10">
            {/* Week Days */}
            <div className="grid grid-cols-7 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 border-t border-l border-slate-50 rounded-2xl overflow-hidden shadow-sm">
              {renderCalendarDays()}
            </div>

            <div className="mt-8 flex flex-wrap gap-6 justify-center bg-slate-50 p-6 rounded-[2rem]">
               <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-emerald-500"></div><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attended Session</span></div>
               <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-rose-500"></div><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Missed Session</span></div>
               <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-white border border-slate-200"></div><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Class / Data</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-emerald-100">
           <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiInfo className="text-emerald-500" size={32} />
           </div>
           <h4 className="text-xl font-black text-slate-800 uppercase italic">Awaiting Selection</h4>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Select a discipline from the hub above to generate log report</p>
        </div>
      )}
    </div>
  );
}