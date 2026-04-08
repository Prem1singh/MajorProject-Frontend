import React, { useState, useEffect } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiTrash2, FiAlertTriangle, FiBookOpen, 
  FiCalendar, FiInfo, FiArrowLeft 
} from "react-icons/fi";

export default function DeleteAttendance() {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Teacher Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjectsForTeacher([]);
      }
    };
    fetchSubjects();
  }, []);

  // 2. Handle Delete with Confirmation
  const handleDelete = async (e) => {
    e.preventDefault();

    if (!subject || !date) {
      toast.error("Please select both subject and date.");
      return;
    }

    const confirmWipe = window.confirm(
      "CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE the attendance for this date? This cannot be undone."
    );

    if (!confirmWipe) return;

    setLoading(true);
    try {
      // Backend expects params for delete
      const res = await api.delete(`/attendance`, {
        params: { subject, date }
      });
      
      toast.success(res.data.message || "Attendance wiped successfully!");
      setSubject("");
      setDate("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-rose-100 overflow-hidden max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      
      {/* Danger Header */}
      <div className="bg-rose-600 p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
            <FiAlertTriangle size={24} className="animate-pulse" />
            <h2 className="text-2xl font-black italic tracking-tight uppercase">
                Wipe Attendance Log
            </h2>
        </div>
        <p className="text-rose-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">
            Permanent removal of daily records
        </p>
      </div>

      <div className="p-8 md:p-12">
        {/* Warning Info Box */}
        <div className="flex gap-4 p-6 bg-rose-50 rounded-3xl border border-rose-100 mb-10">
            <FiInfo className="text-rose-500 mt-1 shrink-0" size={22} />
            <div>
                <h4 className="text-rose-800 font-black text-xs uppercase tracking-widest mb-1">Attention Required</h4>
                <p className="text-[11px] font-bold text-rose-700/80 leading-relaxed uppercase">
                    Deleting attendance will remove the present/absent status for <span className="underline">every student</span> enrolled in this subject for the chosen date.
                </p>
            </div>
        </div>

        <form onSubmit={handleDelete} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Subject Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-2">
                  <FiBookOpen className="text-rose-500" /> Target Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:bg-white focus:border-rose-500 outline-none transition-all cursor-pointer hover:border-rose-100"
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

            {/* Date Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-2">
                  <FiCalendar className="text-rose-500" /> Log Date
              </label>
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-700 focus:bg-white focus:border-rose-500 outline-none transition-all shadow-sm hover:border-rose-100"
                required
              />
            </div>
          </div>

          {/* Delete Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !subject || !date}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-rose-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 hover:shadow-rose-100 disabled:opacity-20 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Processing Wipe...
                </div>
              ) : (
                <><FiTrash2 /> Confirm Bulk Deletion</>
              )}
            </button>
            <p className="mt-6 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] italic">
                {subject && date ? "Ready to execute" : "Awaiting selection..."}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}