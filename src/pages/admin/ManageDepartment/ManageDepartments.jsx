import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiLayers, FiPlus, FiSearch, FiEdit3, FiTrash2, 
  FiX, FiSave, FiChevronLeft, FiChevronRight, FiActivity 
} from "react-icons/fi";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Popup form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // State for deletions & UI
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/departments");
      const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(sorted);
    } catch (err) {
      toast.error("Failed to sync departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/department/${editingId}`, form);
        toast.success("Department Node Updated");
      } else {
        await api.post("/admin/department", form);
        toast.success("New Department Provisioned");
      }
      fetchDepartments();
      setShowForm(false);
      setForm({ name: "", code: "" });
      setEditingId(null);
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, code: dept.code });
    setEditingId(dept._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will impact all linked courses and users."))
      return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/department/${id}`);
      toast.success("Department Removed");
      fetchDepartments();
    } catch (err) {
      toast.error("Wipe Failed");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    const search = searchTerm.toLowerCase();
    return (
      dept.name.toLowerCase().includes(search) ||
      dept.code.toLowerCase().includes(search)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDepartments = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm">
        <div>
          <h2 className="text-xl md:text-xl md:text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none flex items-center gap-3">
             <FiLayers className="text-emerald-500" /> Departments
          </h2>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Institutional Hierarchy Management</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-12 pr-6 font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all w-64 shadow-inner"
            />
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", code: "" }); }}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100 flex items-center gap-2 active:scale-95"
          >
            <FiPlus size={18} /> Provision Dept
          </button>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-100/20 border border-emerald-50 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
             <p className="mt-4 text-emerald-500 font-black italic text-[10px] uppercase tracking-widest">Polling Infrastructure...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="py-24 text-center">
            <FiActivity className="mx-auto text-slate-100 text-7xl mb-4" />
            <p className="text-slate-300 font-black italic uppercase text-sm">No Departmental Nodes Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest w-20">ID</th>
                  <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest">Department Architecture</th>
                  <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest">System Code</th>
                  <th className="py-6 px-8 text-center text-[10px] font-black uppercase text-emerald-700 tracking-widest">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {currentDepartments.map((dept, idx) => (
                  <tr key={dept._id} className="hover:bg-emerald-50/20 transition-all group">
                    <td className="py-6 px-8 text-[10px] font-black text-slate-300 uppercase italic">
                      #{indexOfFirstItem + idx + 1}
                    </td>
                    <td className="py-6 px-8 font-bold text-slate-700">{dept.name}</td>
                    <td className="py-6 px-8">
                      <span className="bg-slate-100 px-4 py-1.5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 shadow-sm">
                         {dept.code}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleEdit(dept)}
                          className="p-2.5 bg-white border border-slate-100 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(dept._id)}
                          disabled={deletingId === dept._id}
                          className="p-2.5 bg-white border border-slate-100 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm disabled:opacity-30"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center px-8 py-8 gap-4 border-t border-slate-50 bg-slate-50/30">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDepartments.length)} of {filteredDepartments.length} nodes
              </p>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-all"
                >
                  Prev
                </button>
                <div className="px-6 py-2.5 bg-slate-900 rounded-xl text-[10px] font-black text-white italic">
                   {currentPage} / {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- FORM MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowForm(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black italic uppercase tracking-widest text-xs flex items-center gap-2">
                  <FiLayers /> {editingId ? "Update Hierarchy" : "New Node Provision"}
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="hover:rotate-90 transition-all"><FiX size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Department Identity</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Applications"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Architecture Code</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. MCA-01"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-slate-900 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {formLoading ? "Synchronizing..." : <><FiSave /> {editingId ? "Commit Updates" : "Provision Node"}</>}
              </button>
            </form>
          </div>
        </div>
      )}

     
    </div>
  );
}