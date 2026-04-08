import React, { useState, useEffect, useMemo } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiBook, 
  FiHash, FiChevronLeft, FiChevronRight, FiX, FiAward 
} from "react-icons/fi";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [formData, setFormData] = useState({ name: "", code: "" });
  const [editingCourse, setEditingCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/courses");
      setCourses(res.data.courses || res.data);
    } catch (err) {
      toast.error("Failed to fetch academic catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({ name: "", code: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({ name: course.name, code: course.code });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, formData);
        toast.success("Course records updated");
      } else {
        await api.post("/courses", formData);
        toast.success("New course added to catalog");
      }
      closeModal();
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("As Admin, are you sure? Deleting a course will affect linked batches.")) return;
    setDeleteLoadingId(id);
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course removed from system");
      fetchCourses();
    } catch (err) {
      toast.error("Failed to delete course");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    return courses
      .filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [courses, searchTerm, sortAsc]);

  const totalPages = Math.ceil(filteredAndSorted.length / coursesPerPage);
  const currentCourses = filteredAndSorted.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Catalog Admin</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Academic Courses</h2>
          </div>
          <p className="text-slate-500 font-medium italic">Manage all degrees and certificate programs offered.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold"
        >
          <FiPlus strokeWidth={3} /> Add New Course
        </button>
      </header>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search course by name or code..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 transition-all font-bold text-slate-600 shadow-sm"
          />
        </div>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="bg-white border-2 border-slate-100 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          Name {sortAsc ? "A-Z ↑" : "Z-A ↓"}
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => <div key={n} className="h-48 bg-white animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
        </div>
      ) : currentCourses.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[2.5rem] py-24 text-center">
          <FiBook className="mx-auto text-emerald-100 text-6xl mb-4" />
          <p className="text-slate-400 font-bold italic">No courses found in the catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentCourses.map((course, idx) => (
            <div
              key={course._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 transition-transform group-hover:scale-150"></div>
              
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl">
                    <FiBook size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(course)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <FiEdit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(course._id)} disabled={deleteLoadingId === course._id} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-emerald-600 transition-colors">
                  {course.name}
                </h3>
                
                <div className="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1 rounded-xl border border-slate-100">
                  <FiHash className="text-emerald-500" size={14} />
                  <span className="text-xs font-black text-slate-500 tracking-widest uppercase">
                    {course.code}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Master Catalog</span>
                <FiAward className="text-slate-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all disabled:opacity-30 shadow-sm"
          >
            <FiChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2 font-bold text-slate-500">
            Page {currentPage} of {totalPages}
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
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-600 p-10 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tight">{editingCourse ? "Edit Course" : "New Program"}</h3>
                <p className="text-emerald-100 font-medium mt-1 italic">Catalog Update</p>
              </div>
              <FiBook size={60} className="opacity-10 absolute right-10 top-10" />
              <button onClick={closeModal} className="absolute top-8 right-8 p-2 hover:bg-emerald-500 rounded-full transition-colors">
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Course Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="e.g. Master of Computer Applications"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="e.g. MCA-01"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-[2] px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  {actionLoading ? "Syncing..." : editingCourse ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}