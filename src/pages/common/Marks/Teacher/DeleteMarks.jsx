import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { FiTrash2, FiAlertTriangle, FiBookOpen, FiClipboard, FiInfo } from "react-icons/fi";

export default function DeleteMarks() {
  const [subject, setSubject] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch subjects assigned to teacher
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  // 2. Fetch exams for the selected subject
  useEffect(() => {
    if (!subject) {
      setExamTypes([]);
      setSelectedExam("");
      return;
    }

    const fetchExams = async () => {
      try {
        const res = await api.get(`/teachers/subjects/${subject}/students/exams`);
        setExamTypes(res.data.exams || []);
      } catch (err) {
        setExamTypes([]);
      }
    };

    fetchExams();
  }, [subject]);

  // 3. Handle delete with confirmation
  const handleDelete = async (e) => {
    e.preventDefault();

    if (!subject || !selectedExam) {
      toast.error("Please select both subject and exam");
      return;
    }

    if (!window.confirm("CRITICAL: Are you sure? This will permanently delete all student marks for this exam!")) return;

    try {
      setLoading(true);
      await api.delete("/marks", {
        params: { subject, exam: selectedExam },
      });
      toast.success("Exam marks wiped successfully!");
      setSelectedExam("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete marks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-rose-100 overflow-hidden max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      
      {/* Warning Header */}
      <div className="bg-rose-600 p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
            <FiAlertTriangle size={24} className="animate-pulse" />
            <h2 className="text-2xl font-black italic tracking-tight uppercase">
                Bulk Delete Marks
            </h2>
        </div>
        <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mt-1 italic">Danger Zone: Permanent Action</p>
      </div>

      <div className="p-8 md:p-12">
        {/* Info Box */}
        <div className="flex gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 mb-10">
            <FiInfo className="text-rose-500 mt-1 shrink-0" size={20} />
            <p className="text-xs font-bold text-rose-700 leading-relaxed uppercase tracking-tight">
                This action will delete the marks of <span className="underline">all students</span> for the selected subject and examination. This cannot be undone.
            </p>
        </div>

        <form onSubmit={handleDelete} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Subject Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-2">
                  <FiBookOpen className="text-rose-500" /> Select Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:bg-white focus:border-rose-500 outline-none transition-all cursor-pointer"
                required
              >
                <option value="">-- Choose Subject --</option>
                {subjectsForTeacher.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-2">
                  <FiClipboard className="text-rose-500" /> Select Examination
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                disabled={!subject || examTypes.length === 0}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:bg-white focus:border-rose-500 outline-none transition-all cursor-pointer disabled:opacity-40"
                required
              >
                <option value="">-- Choose Exam --</option>
                {examTypes.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.name} ({ex.totalMarks} Marks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || !selectedExam}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-rose-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 hover:shadow-rose-100 disabled:opacity-20 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Deleting...
                </div>
              ) : (
                <><FiTrash2 /> Wipe Class Marks</>
              )}
            </button>
          </div>
        </form>

        {/* Dynamic Empty State Footer */}
        {!subject && (
            <p className="mt-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest italic animate-pulse">
                Please select a subject to begin process.
            </p>
        )}
      </div>
    </div>
  );
}