import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiBook, FiCheckCircle, FiClock, FiDownload, 
  FiUploadCloud, FiSearch, FiLayers, 
  FiInfo, FiXCircle, FiStar ,FiCalendar
} from "react-icons/fi";

export default function StudentAssignmentsView() {
  const user = useSelector((state) => state.user.data);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [pending, setPending] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileMap, setFileMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // FIX: Helper function to handle PDF view/download issues
  const getSecureUrl = (url) => {
    if (!url) return "#";
    // Agar link Cloudinary ka hai aur PDF hai, toh attachment flag add karo
    if (url.includes("cloudinary.com") && url.toLowerCase().endsWith(".pdf")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user?.batch) return;
      try {
        const res = await api.get(`/batches/${user.batch}/subjects`);
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Subject fetch error:", err);
      }
    };
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedSubject) return;
      setLoading(true);
      try {
        const res = await api.get(`/assignments/submissions/${selectedSubject}`);
        setPending(res.data.pending || []);
        setSubmitted(res.data.submitted || []);
        setSearchTerm(""); 
      } catch (err) {
        console.error("Assignment fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [selectedSubject]);

  const handleSubmit = async (e, assignmentId) => {
    e.preventDefault();
    const file = fileMap[assignmentId];
    if (!file) return toast.error("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    setSubmittingId(assignmentId);
    try {
      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Assignment uploaded successfully!");
      setFileMap((prev) => ({ ...prev, [assignmentId]: null }));

      const res = await api.get(`/assignments/submissions/${selectedSubject}`);
      setPending(res.data.pending || []);
      setSubmitted(res.data.submitted || []);
    } catch (err) {
      toast.error("Submission failed. Try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredPending = pending.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubmitted = submitted.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-100">
              <FiBook size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Assignments</h2>
          </div>
          <p className="text-slate-500 font-medium italic">Manage your submissions and track grading feedback.</p>
        </div>
      </header>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 mb-10 flex flex-col xl:flex-row gap-4">
        <div className="relative w-full xl:w-80">
          <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-600 focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">-- Choose Subject --</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="relative flex-grow group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search tasks by title or content..."
            value={searchTerm}
            disabled={!selectedSubject}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 transition-all font-bold text-slate-600 shadow-sm disabled:opacity-50"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(n => <div key={n} className="h-40 bg-white animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
        </div>
      ) : !selectedSubject ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-28 text-center">
          <FiInfo className="mx-auto text-emerald-100 text-6xl mb-4" />
          <p className="text-slate-400 font-bold italic">Select a subject to view your assigned tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Pending Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 ml-4">
              <FiClock className="text-orange-500" /> Pending Work
            </h3>
            {filteredPending.length === 0 ? (
              <div className="bg-emerald-50/50 p-10 rounded-[2.5rem] border border-emerald-100 text-center">
                <FiCheckCircle className="mx-auto text-emerald-400 text-4xl mb-2" />
                <p className="text-emerald-700 font-bold tracking-tight">All caught up! No pending tasks.</p>
              </div>
            ) : (
              filteredPending.map((a) => (
                <div key={a._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{a.title}</h4>
                    <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1 rounded-lg border border-orange-100 tracking-widest uppercase">Due Soon</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed italic">{a.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <FiCalendar /> {new Date(a.deadline).toLocaleDateString()}
                    </div>
                    {a.fileUrl && (
                      <a 
                        href={getSecureUrl(a.fileUrl)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1 text-xs font-black text-emerald-600 hover:underline"
                      >
                        <FiDownload /> Reference File
                      </a>
                    )}
                  </div>

                  <form onSubmit={(e) => handleSubmit(e, a._id)} className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <input
                        type="file"
                        onChange={(e) => setFileMap((prev) => ({ ...prev, [a._id]: e.target.files[0] }))}
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        required
                        />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingId === a._id}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {submittingId === a._id ? "Processing..." : <><FiUploadCloud /> Submit</>}
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>

          {/* Submitted Column */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 ml-4">
              <FiCheckCircle className="text-emerald-500" /> Completed
            </h3>
            {filteredSubmitted.length === 0 ? (
              <p className="text-slate-400 font-bold italic ml-4">No submissions yet.</p>
            ) : (
              filteredSubmitted.map((a) => (
                <div key={a._id} className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                  
                  <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-black text-slate-800">{a.title}</h4>
                        {a.submission?.status === "graded" ? (
                            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg">
                                <FiStar />
                            </div>
                        ) : (
                            <FiCheckCircle className="text-emerald-500 text-2xl" />
                        )}
                    </div>
                    
                    <p className="text-slate-400 text-sm font-medium mb-6 line-clamp-2 italic">{a.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-xs font-black uppercase ${a.submission?.status === "late" ? "text-red-500" : "text-emerald-600"}`}>
                                {a.submission?.status || "Submitted"}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                            <p className="text-sm font-black text-slate-800">
                                {a.submission?.status === "graded" ? `${a.submission.obtainedMarks} / ${a.marks}` : "--"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                      {a.submission?.fileUrl ? (
                        <a 
                          href={getSecureUrl(a.submission.fileUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          download={`${a.title}_submission.pdf`}
                          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <FiDownload /> My Submission
                        </a>
                      ) : (
                        <span className="text-[10px] font-black text-slate-400 italic">No file attached</span>
                      )}
                        
                      {a.submission?.status === "reject" && <span className="text-[10px] font-black text-red-500 flex items-center gap-1"><FiXCircle /> REJECTED</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}