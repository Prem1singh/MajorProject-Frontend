import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiCheckSquare, FiCalendar, FiUsers, 
  FiBookOpen, FiSave, FiRefreshCw, FiUserCheck, FiUserX 
} from "react-icons/fi";

export default function MarkAttendance() {
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        toast.error("Error fetching subjects");
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!subject || !date) {
      setStudents([]);
      setAttendanceMap({});
      return;
    }

    const fetchClassData = async () => {
      setLoading(true);
      try {
        const stuRes = await api.get(`/teachers/subjects/${subject}/students`);
        const freshStudents = stuRes.data.students || [];
        const sorted = [...freshStudents].sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));
        setStudents(sorted);

        const defaultMap = {};
        sorted.forEach(s => (defaultMap[s._id] = "absent"));

        try {
          const checkRes = await api.get(`/attendance`, {
            params: { subject, date }
          });
          const existingRecords = checkRes.data || [];

          if (existingRecords.length > 0) {
            setIsUpdateMode(true);
            const updateMap = { ...defaultMap };
            existingRecords.forEach(rec => {
              const sId = rec.student?._id || rec.student;
              if(sId) updateMap[sId] = rec.status;
            });
            setAttendanceMap(updateMap);
          } else {
            setIsUpdateMode(false);
            setAttendanceMap(defaultMap);
          }
        } catch (checkErr) {
          setIsUpdateMode(false);
          setAttendanceMap(defaultMap);
        }
      } catch (err) {
        toast.error("Failed to load students list");
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [subject, date]);

  const toggleAttendance = (id) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const records = students.map((s) => ({
      student: s._id,
      subject,
      date,
      status: attendanceMap[s._id],
    }));

    setLoading(true);
    try {
      await api.post("/attendance", { records });
      toast.success(isUpdateMode ? "Attendance updated!" : "Attendance marked!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-slate-100 border border-emerald-50 overflow-hidden">
      
      {/* Header - Fixed responsive padding */}
      <div className={`p-6 md:p-8 text-white transition-all duration-500 ${isUpdateMode ? 'bg-emerald-600' : 'bg-slate-900'}`}>
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    {isUpdateMode ? <FiRefreshCw className="animate-spin" size={20} /> : <FiCheckSquare size={20} />}
                    <h2 className="text-lg md:text-xl md:text-2xl font-black italic tracking-tight uppercase">
                        {isUpdateMode ? "Update Record" : "Mark Attendance"}
                    </h2>
                </div>
                <p className="text-emerald-100/80 text-[9px] md:text-xs font-bold uppercase tracking-widest italic">
                    All students marked absent by default
                </p>
            </div>
            {isUpdateMode && <span className="bg-white/20 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase border border-white/30">Edit Mode</span>}
        </div>
      </div>

      <div className="p-4 md:p-10">
        {/* Filter Grid - Stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
          <div className="space-y-2 md:space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 ml-2 tracking-widest">
                <FiBookOpen className="text-emerald-500" /> Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjectsForTeacher.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 ml-2 tracking-widest">
                <FiCalendar className="text-emerald-500" /> Session Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-sm text-sm"
              required
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-emerald-500 font-bold italic uppercase text-[10px]">Syncing Class...</p>
          </div>
        ) : !subject || !date ? (
          <div className="py-16 md:py-24 text-center border-2 border-dashed border-emerald-50 rounded-[2rem] md:rounded-[3rem] bg-emerald-50/10">
            <FiUsers className="mx-auto text-emerald-100 text-5xl md:text-7xl mb-4 md:mb-6" />
            <p className="text-emerald-400 font-bold italic text-sm md:text-lg px-6">Select subject & date to load roster.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* Scrollable Table Wrapper */}
            <div className="overflow-x-auto rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 mb-8 md:mb-10 shadow-sm bg-white">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th className="py-4 md:py-6 px-4 md:px-8 text-left text-[9px] md:text-[10px] font-black uppercase text-emerald-600 tracking-widest">Roll</th>
                    <th className="py-4 md:py-6 px-4 md:px-8 text-left text-[9px] md:text-[10px] font-black uppercase text-emerald-600 tracking-widest">Student</th>
                    <th className="py-4 md:py-6 px-4 md:px-8 text-center text-[9px] md:text-[10px] font-black uppercase text-emerald-600 tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-emerald-50/20 transition-all">
                      <td className="py-4 md:py-6 px-4 md:px-8 font-black text-slate-400 italic text-xs md:text-sm">#{s.rollNo || "N/A"}</td>
                      <td className="py-4 md:py-6 px-4 md:px-8 font-bold text-slate-700 text-xs md:text-sm">{s.name}</td>
                      <td className="py-4 md:py-6 px-4 md:px-8 text-center">
                        <button
                          type="button"
                          onClick={() => toggleAttendance(s._id)}
                          className={`min-w-[90px] md:min-w-[120px] py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 mx-auto border-2 ${
                            attendanceMap[s._id] === "present"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                              : "bg-rose-50 border-rose-100 text-rose-500"
                          }`}
                        >
                          {attendanceMap[s._id] === "present" ? <><FiUserCheck /> Present</> : <><FiUserX /> Absent</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pb-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all shadow-xl disabled:opacity-50 text-white ${isUpdateMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-emerald-600'}`}
              >
                {loading ? "Processing..." : isUpdateMode ? <><FiRefreshCw /> Update Records</> : <><FiSave /> Submit Attendance</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}