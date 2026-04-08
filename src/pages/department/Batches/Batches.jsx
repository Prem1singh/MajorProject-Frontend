import React, { useState, useEffect, useMemo } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiLayers, 
  FiBook, FiCalendar, FiCheckCircle, FiX, FiChevronLeft, FiChevronRight, FiFilter 
} from "react-icons/fi";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    totalSem: "",
    currentSem: "",
    year: "",
    status: "Active",
    dissertation: false,
    course: "",
  });
  const [editingBatch, setEditingBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const batchesPerPage = 6;

  const fetchBatches = async (courseId = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/batches${courseId ? `?courseId=${courseId}` : ""}`);
      setBatches(res.data.batches || res.data);
    } catch (err) {
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.courses || res.data);
    } catch (err) {
      toast.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openAddModal = () => {
    setEditingBatch(null);
    setFormData({ name: "", totalSem: "", currentSem: "", year: "", status: "Active", dissertation: false, course: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      totalSem: batch.totalSem,
      currentSem: batch.currentSem || "",
      year: batch.year,
      status: batch.status,
      dissertation: batch.dissertation,
      course: batch.course?._id || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBatch(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingBatch) {
        await api.put(`/batches/${editingBatch._id}`, formData);
        toast.success("Batch updated successfully");
      } else {
        await api.post("/batches", formData);
        toast.success("New batch created");
      }
      closeModal();
      fetchBatches(selectedCourse);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving batch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this batch? All associated student records may be affected.")) return;
    setDeleteLoadingId(id);
    try {
      await api.delete(`/batches/${id}`);
      toast.success("Batch removed");
      fetchBatches(selectedCourse);
    } catch (err) {
      toast.error("Failed to delete batch");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleCourseFilter = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setCurrentPage(1);
    fetchBatches(courseId);
  };

  // Filter & Sort Logic
  const filteredAndSortedBatches = useMemo(() => {
    return batches
      .filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.course?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.year - a.year);
  }, [batches, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedBatches.length / batchesPerPage);
  const currentBatches = filteredAndSortedBatches.slice(
    (currentPage - 1) * batchesPerPage,
    currentPage * batchesPerPage
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Completed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Suspended": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Academic Admin</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Batch Management</h2>
          </div>
          <p className="text-slate-500 font-medium">Organize students into batches, track semesters, and manage academic status.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold whitespace-nowrap"
        >
          <FiPlus strokeWidth={3} /> Create New Batch
        </button>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative w-full lg:w-72">
          <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
          <select
            value={selectedCourse}
            onChange={handleCourseFilter}
            className="w-full appearance-none bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 font-bold text-slate-600 cursor-pointer shadow-sm"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-grow group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by batch name or course..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 transition-all font-bold text-slate-600 shadow-sm"
          />
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => <div key={n} className="h-64 bg-white animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
        </div>
      ) : currentBatches.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[2.5rem] py-24 text-center">
          <FiLayers className="mx-auto text-emerald-100 text-6xl mb-4" />
          <p className="text-slate-400 font-bold italic">No batches found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {currentBatches.map((batch) => (
            <div
              key={batch._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 transition-transform group-hover:scale-150"></div>
              
              <div className="relative flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-[0.15em] ${getStatusStyle(batch.status)}`}>
                    {batch.status}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(batch)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <FiEdit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(batch._id)} disabled={deleteLoadingId === batch._id} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-emerald-600 transition-colors">{batch.name}</h3>
                <p className="text-emerald-600 font-black text-xs mb-6 flex items-center gap-2 uppercase tracking-wider">
                  <FiBook className="shrink-0" /> {batch.course?.name || "No Course Linked"}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Sem</p>
                    <p className="text-lg font-black text-slate-700">{batch.currentSem || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Adm. Year</p>
                    <p className="text-lg font-black text-slate-700">{batch.year}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${batch.dissertation ? "bg-emerald-500" : "bg-slate-200"}`}></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dissertation</span>
                </div>
                <span className="text-xs font-bold text-slate-400">Total: {batch.totalSem} Sem</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all disabled:opacity-30 shadow-sm"
          >
            <FiChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  currentPage === i + 1 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                    : "bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all disabled:opacity-30 shadow-sm"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Admin Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            <div className="bg-emerald-600 p-10 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight">{editingBatch ? "Update Batch" : "New Batch"}</h3>
                <p className="text-emerald-100 font-medium mt-1 italic">Authorized Admin Panel</p>
              </div>
              <FiLayers size={60} className="opacity-10 absolute right-10 top-10" />
              <button onClick={closeModal} className="absolute top-8 right-8 p-2 hover:bg-emerald-500 rounded-full transition-colors">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="e.g. MCA-2026"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Semesters</label>
                  <input
                    type="number"
                    name="totalSem"
                    value={formData.totalSem}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Sem</label>
                  <select
                    name="currentSem"
                    value={formData.currentSem}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none"
                    required
                    disabled={!formData.totalSem}
                  >
                    <option value="">Select...</option>
                    {Array.from({ length: Number(formData.totalSem) || 0 }, (_, i) => i + 1).map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linked Course</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none"
                  required
                >
                  <option value="">Select Course...</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.dissertation ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-200"}`}>
                    {formData.dissertation && <FiCheckCircle className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    name="dissertation"
                    className="hidden"
                    checked={formData.dissertation}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Enable Dissertation Phase</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-8 py-5 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-[2] px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  {actionLoading ? "Syncing..." : editingBatch ? "Update Records" : "Launch Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}