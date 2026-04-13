import React, { useEffect, useState, useMemo } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiUser, 
  FiMail, FiHash, FiLayers, FiFilter, FiChevronLeft, FiChevronRight, FiX, FiExternalLink, FiList 
} from "react-icons/fi";

export default function StudentCRUD() {
  const [formData, setFormData] = useState({ name: "", email: "", rollNo: "", password: "", batch: "" });
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Filtering and Pagination State
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  
  // NEW: Dynamic entries per page
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        setBatches(res.data || []);
      } catch (err) {
        toast.error("Failed to fetch batches");
      }
    };
    fetchBatches();
  }, []);

  const fetchStudents = async (batchId = "all") => {
    try {
      setLoading(true);
      let url = "/departmentAdmin/students";
      if (batchId !== "all") url += `?batch=${batchId}`;
      const res = await api.get(url);
      setStudents(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(selectedBatchFilter);
  }, [selectedBatchFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (selectedStudent) {
      setSelectedStudent({ ...selectedStudent, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    if (selectedStudent) {
      setSelectedStudent({ ...selectedStudent, batch: batchId });
    } else {
      setFormData({ ...formData, batch: batchId });
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/departmentAdmin/student", formData);
      toast.success("Student added successfully!");
      setFormData({ name: "", email: "", rollNo: "", password: "", batch: "" });
      setAddModalOpen(false);
      fetchStudents(selectedBatchFilter);
    } catch (err) {
      toast.error("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will remove the student record permanently.")) return;
    try {
      await api.delete(`/departmentAdmin/student/${id}`);
      toast.success("Student deleted successfully!");
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      toast.error("Failed to delete student");
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent({ ...student, batch: student.batch?._id || "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const updateData = {
        name: selectedStudent.name,
        email: selectedStudent.email,
        rollNo: selectedStudent.rollNo,
        batch: selectedStudent.batch,
      };
      await api.put(`/departmentAdmin/student/${selectedStudent._id}`, updateData);
      toast.success("Student profile updated!");
      setSelectedStudent(null);
      fetchStudents(selectedBatchFilter);
    } catch (err) {
      toast.error("Failed to update student");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Logic for filtering, sorting, and pagination
  const filteredAndSorted = useMemo(() => {
    let result = students.filter((s) => {
      const term = searchTerm.toLowerCase();
      return (
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.rollNo?.toLowerCase().includes(term) ||
        s.batch?.name?.toLowerCase().includes(term)
      );
    });
    return result.sort((a, b) =>
      sortOrder === "asc"
        ? a.rollNo.localeCompare(b.rollNo, "en", { numeric: true })
        : b.rollNo.localeCompare(a.rollNo, "en", { numeric: true })
    );
  }, [students, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / studentsPerPage) || 1;
  const currentStudents = filteredAndSorted.slice((page - 1) * studentsPerPage, page * studentsPerPage);

  // Handle number of entries change
  const handleEntriesChange = (e) => {
    setStudentsPerPage(Number(e.target.value));
    setPage(1); // Reset to first page
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Department Admin</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Directory</h2>
          </div>
          <p className="text-slate-500 font-medium">Manage student enrollment, profiles, and academic outcomes.</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold whitespace-nowrap"
        >
          <FiPlus strokeWidth={3} /> Add New Student
        </button>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col xl:flex-row gap-4 items-center">
        {/* Batch Filter */}
        <div className="relative w-full xl:w-64">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
          <select
            value={selectedBatchFilter}
            onChange={(e) => { setSelectedBatchFilter(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none outline-none cursor-pointer"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>{b.name} {b.year ? `(${b.year})` : ""}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-grow w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>

        {/* Entries Count Selector */}
        <div className="flex items-center gap-3 bg-slate-50 border-transparent rounded-xl px-4 py-3 w-full xl:w-auto">
          <FiList className="text-emerald-600" />
          <span className="text-[10px] font-black text-slate-400 uppercase">Show:</span>
          <select 
            value={studentsPerPage} 
            onChange={handleEntriesChange}
            className="bg-transparent font-bold text-slate-600 outline-none cursor-pointer text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="w-full xl:w-auto px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          Sort Roll No: {sortOrder === "asc" ? "Asc" : "Desc"}
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Outcome</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center animate-pulse text-slate-400 font-bold">Loading records...</td></tr>
              ) : currentStudents.length > 0 ? (
                currentStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shadow-inner uppercase">
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 font-medium italic"><FiMail /> {s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black tracking-wider flex items-center gap-2 w-fit border border-slate-200">
                        <FiHash className="text-emerald-500" /> {s.rollNo}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-bold text-slate-600 flex items-center gap-2 italic">
                        <FiLayers className="text-emerald-500" /> {s.batch?.name || "-"}
                      </span>
                    </td>
                    <td className="p-6">
                      {s.outcome?.type ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-tight">{s.outcome.type}</span>
                          {s.outcome.certificate && (
                            <a href={s.outcome.certificate} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 transition-colors">
                              <FiExternalLink />
                            </a>
                          )}
                        </div>
                      ) : <span className="text-slate-300 italic text-xs font-medium">In Progress</span>}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(s)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><FiEdit3 /></button>
                        <button onClick={() => handleDelete(s._id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-20 text-center text-slate-400 italic">No student records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Showing <span className="text-emerald-600">{(page - 1) * studentsPerPage + 1} - {Math.min(page * studentsPerPage, filteredAndSorted.length)}</span> of {filteredAndSorted.length} Students
          </p>
          <div className="flex items-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest shadow-inner">
               Page {page} of {totalPages}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal (Combined Style) */}
      {(addModalOpen || selectedStudent) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{selectedStudent ? "Edit Profile" : "Register Student"}</h3>
                <p className="text-emerald-100 text-xs font-medium mt-1">Authorized Departmental Action</p>
              </div>
              <button onClick={() => { setAddModalOpen(false); setSelectedStudent(null); }} className="p-2 hover:bg-emerald-500 rounded-full transition-colors">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={selectedStudent ? handleUpdate : handleAddStudent} className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" name="name" value={selectedStudent ? selectedStudent.name : formData.name} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-emerald-500 outline-none font-bold text-slate-700 shadow-inner" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                  <input type="text" name="rollNo" value={selectedStudent ? selectedStudent.rollNo : formData.rollNo} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-emerald-500 outline-none font-bold text-slate-700 shadow-inner" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input type="email" name="email" value={selectedStudent ? selectedStudent.email : formData.email} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-emerald-500 outline-none font-bold text-slate-700 shadow-inner" required />
              </div>

              {!selectedStudent && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-emerald-500 outline-none font-bold text-slate-700 shadow-inner" required />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Batch</label>
                <div className="relative">
                  <select value={selectedStudent ? selectedStudent.batch : formData.batch} name="batch" onChange={handleBatchChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:border-emerald-500 outline-none font-bold text-slate-700 shadow-inner appearance-none cursor-pointer" required>
                    <option value="">Select Batch</option>
                    {batches.map((b) => <option key={b._id} value={b._id}>{b.name} ({b.year})</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setAddModalOpen(false); setSelectedStudent(null); }} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={loading || updateLoading} className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all disabled:opacity-50">
                  {loading || updateLoading ? "Processing..." : selectedStudent ? "Commit Changes" : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}