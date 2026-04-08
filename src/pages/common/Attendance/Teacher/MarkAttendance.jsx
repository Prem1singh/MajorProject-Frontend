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

  // 1. Fetch Teacher Subjects
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

  // 2. Fetch Students + Attendance Check
  useEffect(() => {
    if (!subject || !date) {
      setStudents([]);
      setAttendanceMap({});
      return;
    }

    const fetchClassData = async () => {
      setLoading(true);
      try {
        // Step 1: Students fetch karein
        const stuRes = await api.get(`/teachers/subjects/${subject}/students`);
        const freshStudents = stuRes.data.students || [];
        const sorted = [...freshStudents].sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));
        setStudents(sorted);

        // DEFAULT: Sabko "absent" mark karo (Aapki request ke mutabik)
        const defaultMap = {};
        sorted.forEach(s => (defaultMap[s._id] = "absent"));

        // Step 2: Purana data check karein
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
            setAttendanceMap(defaultMap); // Naye entry ke liye sab absent
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
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-emerald-50 overflow-hidden">
      
      {/* Header */}
      <div className={`p-8 text-white transition-all duration-500 ${isUpdateMode ? 'bg-emerald-600' : 'bg-slate-900'}`}>
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    {isUpdateMode ? <FiRefreshCw className="animate-spin" size={24} /> : <FiCheckSquare size={24} />}
                    <h2 className="text-2xl font-black italic tracking-tight uppercase">
                        {isUpdateMode ? "Update Attendance" : "Mark Attendance"}
                    </h2>
                </div>
                <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest italic">
                    Default Mode: All Absent
                </p>
            </div>
            {isUpdateMode && <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase border border-white/30">Edit Mode</span>}
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 ml-2 tracking-widest">
                <FiBookOpen className="text-emerald-500" /> Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all"
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjectsForTeacher.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 ml-2 tracking-widest">
                <FiCalendar className="text-emerald-500" /> Session Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-emerald-500 font-bold italic uppercase text-xs">Syncing Class...</p>
          </div>
        ) : !subject || !date ? (
          <div className="py-24 text-center border-2 border-dashed border-emerald-50 rounded-[3rem] bg-emerald-50/10">
            <FiUsers className="mx-auto text-emerald-200 text-7xl mb-6" />
            <p className="text-emerald-400 font-bold italic text-lg px-6 italic">Select subject & date to load roster.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="overflow-hidden rounded-[2rem] border border-slate-100 mb-10 shadow-sm bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-600 tracking-widest">Roll</th>
                    <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-600 tracking-widest">Student</th>
                    <th className="py-6 px-8 text-center text-[10px] font-black uppercase text-emerald-600 tracking-widest">Mark Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-emerald-50/20 transition-all">
                      <td className="py-6 px-8 font-black text-slate-400 italic">#{s.rollNo || "N/A"}</td>
                      <td className="py-6 px-8 font-bold text-slate-700">{s.name}</td>
                      <td className="py-6 px-8 text-center">
                        <button
                          type="button"
                          onClick={() => toggleAttendance(s._id)}
                          className={`min-w-[120px] py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 mx-auto border-2 ${
                            attendanceMap[s._id] === "present"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-3 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 text-white ${isUpdateMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-emerald-600'}`}
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