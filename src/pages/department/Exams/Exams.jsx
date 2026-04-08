import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiEdit3, FiTrash2, FiBookOpen, 
  FiLayers, FiAlertCircle, FiExternalLink, FiX 
} from "react-icons/fi";

export default function Exams() {
  const user = useSelector((state) => state.user.data);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const examTypes = ["sessional", "assignment", "attendance", "semester"];
  const [examForm, setExamForm] = useState({
    name: "",
    type: "",
    totalMarks: "",
    description: "",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        setBatches(res.data);
      } catch (err) {
        toast.error("Failed to fetch batches");
      }
    };
    fetchBatches();
  }, []);

  // Fetch exams when batch changes
  useEffect(() => {
    if (!selectedBatch) {
      setExams([]);
      return;
    }
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/exams?batch=${selectedBatch}`);
        setExams(res.data || []);
      } catch (err) {
        toast.error("Failed to fetch exams");
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [selectedBatch]);

  const handleChange = (e) => {
    setExamForm({ ...examForm, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingExam(null);
    setExamForm({ name: "", type: "", totalMarks: "", description: "" });
    setModalOpen(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      type: exam.type,
      totalMarks: exam.totalMarks,
      description: exam.description || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExam(null);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return toast.error("Select a batch first");
    
    setActionLoading(true);
    try {
      if (editingExam) {
        await api.put(`/exams/${editingExam._id}`, { ...examForm, batch: selectedBatch });
        setExams((prev) => 
          prev.map((ex) => (ex._id === editingExam._id ? { ...ex, ...examForm } : ex))
        );
        toast.success("Exam updated successfully");
      } else {
        const res = await api.post("/exams", { ...examForm, batch: selectedBatch });
        setExams((prev) => [...prev, res.data]);
        toast.success("Exam published successfully");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Permanently delete this exam record?")) return;
    setDeleteLoadingId(examId);
    try {
      await api.delete(`/exams/${examId}`);
      setExams((prev) => prev.filter((ex) => ex._id !== examId));
      toast.success("Exam deleted");
    } catch (err) {
      toast.error("Deletion failed");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const getTypeStyles = (type) => {
    const styles = {
      sessional: "bg-emerald-100 text-emerald-700 border-emerald-200",
      assignment: "bg-green-100 text-green-700 border-green-200",
      attendance: "bg-teal-100 text-teal-700 border-teal-200",
      semester: "bg-lime-100 text-lime-700 border-lime-200",
    };
    return styles[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f9fafb]">
      
      {/* RESPONSIVE HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 lg:mb-12 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">HOD Access</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Exams Portal</h2>
          </div>
          <p className="text-slate-500 text-sm sm:text-base font-medium">Manage and monitor academic assessments.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative group w-full sm:w-72">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="appearance-none w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 pr-12 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 cursor-pointer text-sm sm:text-base"
            >
              <option value="">Choose Batch...</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <FiLayers className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
          </div>

          {selectedBatch && (
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-100 active:scale-95 font-bold text-sm sm:text-base whitespace-nowrap"
            >
              <FiPlus strokeWidth={3} /> Create Exam
            </button>
          )}
        </div>
      </header>

      {/* RESPONSIVE GRID CONTENT */}
      {!selectedBatch ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <FiAlertCircle className="text-emerald-500 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Select a batch to begin</h3>
          <p className="text-slate-500 mt-2 max-w-xs text-sm">Please select an active batch from the dropdown to manage exam records.</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((n) => <div key={n} className="h-64 bg-white animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {exams.map((ex) => (
            <div
              key={ex._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getTypeStyles(ex.type)}`}>
                  {ex.type}
                </span>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => openEditModal(ex)} 
                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <FiEdit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteExam(ex._id)} 
                    disabled={deleteLoadingId === ex._id}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-20"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              <h4 className="text-xl sm:text-2xl font-black text-slate-800 mb-3 leading-tight">{ex.name}</h4>
              <p className="text-slate-500 text-sm font-medium mb-8 flex-grow line-clamp-3">
                {ex.description || "No description provided for this evaluation."}
              </p>
              
              <div className="flex items-center justify-between border-t border-slate-50 pt-6 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weightage</span>
                  <span className="text-2xl font-black text-slate-800">{ex.totalMarks} <span className="text-xs font-medium text-slate-400 italic">Marks</span></span>
                </div>
                
                {/* <button 
                  className="bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 group/btn"
                  onClick={() => toast.info(`Accessing ${ex.name} submissions`)}
                >
                  <span className="text-xs font-bold">Submissions</span>
                  <FiExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button> */}
              </div>
            </div>
          ))}

          {exams.length === 0 && (
            <div className="col-span-full bg-white rounded-[2.5rem] py-20 text-center border-2 border-dashed border-emerald-100">
              <p className="text-slate-400 font-bold">No exams found for this batch.</p>
            </div>
          )}
        </div>
      )}

      {/* RESPONSIVE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            
            <div className="bg-emerald-600 p-8 sm:p-10 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black">{editingExam ? "Edit Exam" : "New Exam"}</h3>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium">Define assessment parameters</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-emerald-500 rounded-full transition-colors">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveExam} className="p-8 sm:p-10 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. End Semester Viva"
                  value={examForm.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm sm:text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select
                    name="type"
                    value={examForm.type}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 text-sm"
                    required
                  >
                    <option value="">Select Type</option>
                    {examTypes.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Marks</label>
                  <input
                    type="number"
                    name="totalMarks"
                    placeholder="100"
                    value={examForm.totalMarks}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Instructions for students..."
                  value={examForm.description}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full sm:flex-[2] px-6 py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : editingExam ? "Commit Changes" : "Publish Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}