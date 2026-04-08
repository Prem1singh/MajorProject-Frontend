import React, { useEffect, useState, useMemo } from "react";
import api from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiUser, 
  FiMail, FiHash, FiX, FiChevronLeft, FiChevronRight, FiFilter 
} from "react-icons/fi";

export default function Teachers() {
  const user = useSelector((state) => state.user.data);

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const teachersPerPage = 8;
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    password: "",
  });

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/departmentAdmin/teachers");
      let data = res.data || [];
      setTeachers(data);
    } catch (err) {
      toast.error("Failed to fetch faculty records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (teacherId) => {
    if (!window.confirm("As HOD, are you sure you want to remove this faculty member?")) return;
    setDeletingId(teacherId);
    try {
      await api.delete(`/departmentAdmin/teacher/${teacherId}`);
      toast.success("Faculty removed from department");
      fetchTeachers();
    } catch (err) {
      toast.error("Deletion failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/departmentAdmin/teachers/${selectedTeacher._id}`, selectedTeacher);
      toast.success("Profile updated successfully");
      setIsEditModalOpen(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post("/departmentAdmin/teacher", {
        ...addFormData,
        department: user?.profile?.department,
      });
      toast.success("New teacher onboarded!");
      setAddFormData({ name: "", email: "", employeeId: "", password: "" });
      setIsAddModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error("Onboarding failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = teachers.filter((t) => {
      const search = searchTerm.toLowerCase();
      return (
        t.name?.toLowerCase().includes(search) ||
        t.email?.toLowerCase().includes(search) ||
        t.employeeId?.toLowerCase().includes(search)
      );
    });

    return result.sort((a, b) => {
      const empA = a.employeeId || "";
      const empB = b.employeeId || "";
      return sortOrder === "asc"
        ? empA.localeCompare(empB, "en", { numeric: true })
        : empB.localeCompare(empA, "en", { numeric: true });
    });
  }, [teachers, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / teachersPerPage);
  const currentTeachers = filteredAndSorted.slice((page - 1) * teachersPerPage, page * teachersPerPage);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Faculty Admin</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Teacher Directory</h2>
          </div>
          <p className="text-slate-500 font-medium italic">Manage department faculty, credentials, and access.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold whitespace-nowrap"
        >
          <FiPlus strokeWidth={3} /> Add Faculty
        </button>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or employee ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="w-full lg:w-auto px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
        >
          <FiFilter className="text-emerald-500" /> Employee ID: {sortOrder === "asc" ? "Asc" : "Desc"}
        </button>
      </div>

      {/* Teachers Grid/Table */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Member</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Employee ID</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="3" className="p-20 text-center animate-pulse text-slate-400 font-bold italic">Syncing directory...</td></tr>
              ) : currentTeachers.length > 0 ? (
                currentTeachers.map((t) => (
                  <tr key={t._id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shadow-inner">
                          <FiUser size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{t.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium italic"><FiMail /> {t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-xs font-black tracking-wider inline-flex items-center gap-2 border border-slate-200">
                        <FiHash className="text-emerald-500" /> {t.employeeId || "N/A"}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedTeacher(t); setIsEditModalOpen(true); }}
                          className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        >
                          <FiEdit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(t._id)} 
                          disabled={deletingId === t._id}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          {deletingId === t._id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent animate-spin rounded-full"></div> : <FiTrash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="p-20 text-center text-slate-300 italic">No faculty records match your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center gap-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm">
              <FiChevronLeft size={20} />
            </button>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm">
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal (Unified Theme) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-600 p-10 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight">{isEditModalOpen ? "Edit Profile" : "New Faculty"}</h3>
                <p className="text-emerald-100 font-medium mt-1 italic">Administrative Onboarding</p>
              </div>
              <FiUser size={60} className="opacity-10 absolute right-10 top-10" />
              <button 
                onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); setSelectedTeacher(null); }}
                className="absolute top-8 right-8 p-2 hover:bg-emerald-500 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={isEditModalOpen ? selectedTeacher.name : addFormData.name}
                  onChange={(e) => isEditModalOpen ? setSelectedTeacher({...selectedTeacher, name: e.target.value}) : setAddFormData({...addFormData, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="e.g. Dr. Satish Sharma"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                <input
                  type="email"
                  value={isEditModalOpen ? selectedTeacher.email : addFormData.email}
                  onChange={(e) => isEditModalOpen ? setSelectedTeacher({...selectedTeacher, email: e.target.value}) : setAddFormData({...addFormData, email: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="name@university.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                <input
                  type="text"
                  value={isEditModalOpen ? selectedTeacher.employeeId : addFormData.employeeId}
                  onChange={(e) => isEditModalOpen ? setSelectedTeacher({...selectedTeacher, employeeId: e.target.value}) : setAddFormData({...addFormData, employeeId: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="EMP-101"
                  required
                />
              </div>

              {!isEditModalOpen && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Password</label>
                  <input
                    type="password"
                    value={addFormData.password}
                    onChange={(e) => setAddFormData({...addFormData, password: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); setSelectedTeacher(null); }}
                  className="flex-1 px-8 py-5 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-[2] px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  {actionLoading ? "Syncing..." : isEditModalOpen ? "Commit Changes" : "Confirm Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}