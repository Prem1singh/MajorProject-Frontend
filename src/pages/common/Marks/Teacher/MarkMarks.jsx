import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { FiEdit3, FiSave, FiUsers, FiBookOpen, FiClipboard, FiRefreshCw } from "react-icons/fi";

export default function MarkMarks() {
  const user = useSelector((state) => state.user.data);

  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [examsForSubject, setExamsForSubject] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
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
    if (!subject) {
      setExamsForSubject([]);
      setExam("");
      return;
    }
    const fetchExams = async () => {
      try {
        const res = await api.get(`/teachers/subjects/${subject}/students/exams`);
        setExamsForSubject(res.data.exams || []);
        setExam("");
      } catch (err) {
        setExamsForSubject([]);
      }
    };
    fetchExams();
  }, [subject]);

  useEffect(() => {
    if (!subject || !exam) {
      setStudents([]);
      setMarksMap({});
      return;
    }

    const fetchClassData = async () => {
      setLoading(true);
      try {
        const marksRes = await api.get("/marks/exam", {
          params: { subject, exam },
        });

        const { students: existingData } = marksRes.data;

        if (existingData && existingData.length > 0) {
          setIsUpdateMode(true);
          setStudents(existingData);
          const map = {};
          existingData.forEach((s) => {
            map[s._id] = s.obtained ?? "";
          });
          setMarksMap(map);
        } else {
          setIsUpdateMode(false);
          const stuRes = await api.get(`/teachers/subjects/${subject}/students`);
          const freshStudents = stuRes.data.students || [];
          setStudents(freshStudents);
          
          const map = {};
          freshStudents.forEach((s) => (map[s._id] = ""));
          setMarksMap(map);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [subject, exam]);

  const handleChange = (id, value) => {
    setMarksMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentExam = examsForSubject.find((ex) => ex._id === exam);
    const maxMarks = currentExam?.totalMarks || 100;

    const records = students.map((s) => ({
      student: s._id,
      subject,
      exam,
      total: maxMarks,
      obtained: Number(marksMap[s._id]) || 0,
      addedBy: user._id,
    }));

    setLoading(true);
    try {
      await api.post("/marks", { records });
      toast.success(isUpdateMode ? "Marks updated successfully!" : "Marks submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save marks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-emerald-100 overflow-hidden">
      
      {/* Header - Fixed Responsive Padding */}
      <div className={`p-6 md:p-10 text-white transition-all duration-500 ${isUpdateMode ? 'bg-emerald-600' : 'bg-slate-900'}`}>
        <div className="flex items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    {isUpdateMode ? <FiRefreshCw className="animate-spin-slow" size={20} /> : <FiEdit3 size={20} />}
                    <h2 className="text-lg md:text-xl md:text-2xl font-black italic tracking-tight uppercase">
                        {isUpdateMode ? "Update Marks" : "Mark New Marks"}
                    </h2>
                </div>
                <p className="text-emerald-100/80 text-[10px] md:text-xs font-bold uppercase tracking-widest italic">
                    {isUpdateMode ? "Records loaded for editing" : "Fresh academic entry"}
                </p>
            </div>
            {isUpdateMode && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase border border-white/30 whitespace-nowrap">
                    Edit Mode
                </span>
            )}
        </div>
      </div>

      <div className="p-4 md:p-10">
        {/* Selection Grid - Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
          <div className="space-y-2 md:space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-2">
                <FiBookOpen className="text-emerald-500" /> Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-slate-700 outline-none text-sm"
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjectsForTeacher.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-2">
                <FiClipboard className="text-emerald-500" /> Examination
            </label>
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-slate-700 outline-none text-sm disabled:opacity-40"
              required
              disabled={!subject}
            >
              <option value="">-- Choose Exam --</option>
              {examsForSubject.map((ex) => (
                <option key={ex._id} value={ex._id}>{ex.name} (Max: {ex.totalMarks})</option>
              ))}
            </select>
          </div>
        </div>

        {/* State Handling */}
        {!subject || !exam ? (
          <div className="py-16 md:py-24 text-center border-2 border-dashed border-emerald-50 rounded-[2rem] md:rounded-[3rem] bg-emerald-50/10">
            <FiUsers className="mx-auto text-emerald-100 text-5xl md:text-7xl mb-4 md:mb-6" />
            <p className="text-emerald-400 font-bold italic text-sm md:text-lg px-6">Select subject & exam to view roster.</p>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-emerald-500 font-bold italic uppercase text-[10px]">Syncing Records...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* --- Responsive Scrollable Table --- */}
            <div className="overflow-x-auto rounded-[1.5rem] md:rounded-[2rem] border border-emerald-100 mb-8 md:mb-10 shadow-sm bg-white">
              <table className="w-full border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th className="py-4 md:py-6 px-6 md:px-8 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600">Roll No</th>
                    <th className="py-4 md:py-6 px-6 md:px-8 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600">Student Name</th>
                    <th className="py-4 md:py-6 px-6 md:px-8 text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600">Marks Obtained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {students.map((s) => {
                    const currentExam = examsForSubject.find(ex => ex._id === exam);
                    const max = currentExam?.totalMarks || 100;
                    return (
                      <tr key={s._id} className="hover:bg-emerald-50/20 transition-all">
                        <td className="py-4 md:py-6 px-6 md:px-8 font-black text-slate-400 italic text-xs md:text-sm">#{s.rollNo || "N/A"}</td>
                        <td className="py-4 md:py-6 px-6 md:px-8 font-bold text-slate-700 text-xs md:text-sm">{s.name}</td>
                        <td className="py-4 md:py-6 px-6 md:px-8">
                          <div className="flex items-center justify-center gap-3 md:gap-4">
                            <input
                              type="number"
                              min="0"
                              max={max}
                              placeholder="0"
                              value={marksMap[s._id] ?? ""}
                              onChange={(e) => handleChange(s._id, e.target.value)}
                              className="w-16 md:w-24 bg-slate-100 border-2 border-transparent rounded-lg md:rounded-xl py-2 md:py-3 px-2 md:px-4 text-center font-black text-emerald-600 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
                              required
                            />
                            <span className="text-[9px] md:text-[10px] font-black text-emerald-300 uppercase tracking-tighter">/ {max}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pb-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 text-white text-xs md:text-sm ${isUpdateMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-emerald-600'}`}
              >
                {loading ? "Processing..." : isUpdateMode ? <><FiRefreshCw /> Update Records</> : <><FiSave /> Submit Marks</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}