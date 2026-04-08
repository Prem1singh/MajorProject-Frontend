import React, { useEffect, useState, useMemo } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiFileText, 
  FiUsers, FiCalendar, FiCheckCircle, FiXCircle, 
  FiDownload, FiArrowLeft, FiFilter, FiAward, FiX 
} from "react-icons/fi";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [viewingSubmissions, setViewingSubmissions] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    marks: "",
    deadline: "",
    subjectId: "",
    file: null,
    existingFileUrl: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments/my");
      setAssignments(res.data.assignments || []);
    } catch (err) {
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/teachers/subjects");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        marks: assignment.marks,
        deadline: assignment.deadline ? new Date(assignment.deadline).toISOString().slice(0, 10) : "",
        subjectId: assignment.subject?._id || "",
        file: null,
        existingFileUrl: assignment.fileUrl || null,
      });
    } else {
      setEditingAssignment(null);
      setFormData({ title: "", description: "", marks: "", deadline: "", subjectId: "", file: null, existingFileUrl: null });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });

      if (editingAssignment) {
        await api.put(`/assignments/${editingAssignment._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Assignment updated!");
      } else {
        await api.post("/assignments", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("New task created!");
      }
      fetchAssignments();
      setModalOpen(false);
    } catch (err) {
      toast.error("Save operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("As Teacher, are you sure? All student submissions for this task will be lost.")) return;
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(assignments.filter((a) => a._id !== id));
      toast.success("Assignment deleted");
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const fetchSubmissions = async (assignment) => {
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(res.data || []);
      setSelectedAssignment(assignment);
      setViewingSubmissions(true);
      setSearchTerm("");
    } catch (err) {
      toast.error("Could not load submissions");
    }
  };

  const handleUpdateSubmission = async (submissionId, updates, currentObtained) => {
    const marksToSubmit = updates.obtainedMarks !== undefined ? updates.obtainedMarks : currentObtained;
    try {
      await api.patch(`/assignments/${selectedAssignment._id}/submissions/${submissionId}`, {
        ...updates,
        obtainedMarks: Number(marksToSubmit)
      });
      fetchSubmissions(selectedAssignment);
      toast.success("Record updated");
    } catch (err) {
      toast.error("Grading failed");
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === "all" || a.subject?._id === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [assignments, searchTerm, selectedSubject]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const name = s.student?.name || "";
      const roll = s.student?.rollNo || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || roll.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [submissions, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-100">
              <FiAward size={24} />
            </div>
            <h2 className="text-xl md:text-xl md:text-3xl font-black text-slate-800 tracking-tight italic">Assignment Console</h2>
          </div>
          <p className="text-slate-500 font-medium italic">Create academic tasks and evaluate student performance.</p>
        </div>
        {!viewingSubmissions && (
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold"
          >
            <FiPlus strokeWidth={3} /> Create New Task
          </button>
        )}
      </header>

      {/* Control Bar (Only show in Main View) */}
      {!viewingSubmissions && (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 mb-10 flex flex-col xl:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="relative w-full xl:w-72">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-600 appearance-none outline-none focus:border-emerald-500 transition-all"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
        </div>
      )}

      {/* Assignments Grid */}
      {!viewingSubmissions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center animate-pulse font-black text-emerald-600 tracking-widest uppercase">Syncing Curriculum Data...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="col-span-full bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-24 text-center">
              <FiFileText className="mx-auto text-emerald-100 text-6xl mb-4" />
              <p className="text-slate-400 font-bold italic">No active assignments found.</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div key={assignment._id} className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 relative flex flex-col justify-between overflow-hidden">
                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                      <FiFileText size={24} />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(assignment)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><FiEdit3 size={18} /></button>
                      <button onClick={() => handleDelete(assignment._id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><FiTrash2 size={18} /></button>
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-emerald-600 transition-colors">{assignment.title}</h3>
                  <p className="text-emerald-600 font-black text-xs mb-6 uppercase tracking-widest italic">{assignment.subject?.name || "General"}</p>
                  <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-2 leading-relaxed italic">{assignment.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Marks</p>
                        <p className="text-lg font-black text-slate-800">{assignment.marks}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                        <p className="text-sm font-black text-slate-800">{assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => fetchSubmissions(assignment)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg group/btn"
                >
                  <FiUsers size={16} className="group-hover/btn:scale-110 transition-transform" /> Grade Submissions
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Submissions Evaluation View */}
      {viewingSubmissions && selectedAssignment && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => setViewingSubmissions(false)}
            className="flex items-center gap-2 mb-8 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-xs text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>

          <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 font-black italic">GRADING</div>
               <div>
                  <h3 className="text-xl md:text-xl md:text-2xl font-black text-slate-800 tracking-tight">{selectedAssignment.title}</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{selectedAssignment.subject?.name}</p>
               </div>
            </div>
            <div className="flex flex-grow w-full md:max-w-md relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search Student by Name or Roll No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                />
            </div>
          </div>

          <div className="space-y-6">
            {filteredSubmissions.length === 0 ? (
              <p className="text-center py-20 text-slate-400 italic">No submissions match your search.</p>
            ) : (
              filteredSubmissions.map((s) => (
                <div key={s._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 grid grid-cols-1 md:grid-cols-4 items-center gap-8 group">
                  
                  <div className="md:col-span-1 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                       {s.student?.profilePicture ? <img src={s.student.profilePicture} className="w-full h-full object-cover" /> : s.student?.name?.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 leading-tight truncate">{s.student?.name || "N/A"}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.student?.rollNo || "N/A"}</p>
                    </div>
                  </div>

                  <div className="md:col-span-1 flex flex-col">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border w-fit mb-2 ${
                      s.status === "graded" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : 
                      s.status === "reject" ? "bg-red-100 text-red-700 border-red-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"
                    }`}>
                      {s.status || "pending"}
                    </span>
                    <a href={s.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-black text-emerald-600 hover:underline uppercase">
                        <FiDownload /> Review File
                    </a>
                  </div>

                  <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max={selectedAssignment?.marks || 100}
                            defaultValue={s.obtainedMarks || ""}
                            onChange={(e) => (s.obtainedMarks = Number(e.target.value))}
                            className="w-20 bg-white border-2 border-slate-200 rounded-xl p-3 focus:border-emerald-500 outline-none font-black text-slate-700 text-center"
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ {selectedAssignment?.marks}</span>
                    </div>
                    <div className="flex gap-2 flex-grow">
                        <button 
                          onClick={() => handleUpdateSubmission(s._id, { obtainedMarks: s.obtainedMarks, status: "graded" }, s.obtainedMarks)}
                          className="flex-grow py-3 px-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                        >
                          {s.status === "graded" ? "Update Grade" : "Grade"}
                        </button>
                        <button 
                          onClick={() => handleUpdateSubmission(s._id, { status: "reject" }, s.obtainedMarks)}
                          className="p-3 bg-white border-2 border-slate-100 text-red-500 rounded-xl hover:bg-red-50 transition-all"
                        >
                          <FiXCircle />
                        </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            <div className="bg-emerald-600 p-10 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-xl md:text-3xl font-black tracking-tight">{editingAssignment ? "Edit Task" : "New Task"}</h3>
                <p className="text-emerald-100 font-medium mt-1 italic">Academic Curriculum Update</p>
              </div>
              <FiFileText size={60} className="opacity-10 absolute right-10 top-10" />
              <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-emerald-500 rounded-full transition-colors"><FiX size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unit 3 Programming Lab"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 resize-none h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Marks</label>
                    <input type="number" value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700" required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                    <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none" required>
                  <option value="">Choose...</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference File</label>
                <input type="file" onChange={(e) => setFormData({ ...formData, file: e.target.files[0], existingFileUrl: null })} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px]">Discard</button>
                <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest text-[10px]">
                  {submitting ? "Processing..." : "Confirm Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}