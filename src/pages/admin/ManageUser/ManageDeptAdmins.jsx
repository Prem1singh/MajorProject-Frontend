import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiUser, FiMail, FiLayers, FiEdit3, FiTrash2, 
  FiPlus, FiSearch, FiX, FiSave, FiShield, FiCheckCircle,
  FiChevronLeft, FiChevronRight, FiList 
} from "react-icons/fi";

export default function ManageDeptAdmin() {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);

  // Pagination & Records States
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage, setAdminsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/department-admins");
      let fetched = res.data || [];
      fetched.sort((a, b) => (a?.department?.name || "").localeCompare(b?.department?.name || ""));
      setAdmins(fetched);
    } catch (err) {
      setError("Failed to fetch department admins.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data || []);
    } catch (err) {
      setError("Failed to fetch departments.");
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchDepartments();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", departmentId: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editId) {
        await api.put(`/admin/department-admin/${editId}`, formData);
        toast.success("Identity Updated");
      } else {
        await api.post("/admin/department-admin", formData);
        toast.success("Admin Provisioned");
      }
      resetForm();
      fetchAdmins();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      departmentId: admin.department?._id || "",
    });
    setEditId(admin._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Revoke access for this administrator?")) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/admin/department-admin/${id}`);
      toast.success("Access Revoked");
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error("Delete Failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const search = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(search) ||
      a.email.toLowerCase().includes(search) ||
      (a.department?.name.toLowerCase().includes(search) ?? false)
    );
  });

  // Logic for Pagination & Record Slicing
  const indexOfLast = currentPage * adminsPerPage;
  const indexOfFirst = indexOfLast - adminsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage) || 1;

  // Handle entries per page change
  const handleRecordsChange = (e) => {
    setAdminsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- Control Header --- */}
      <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-2 flex items-center gap-2">
              <FiShield /> Authority Management
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Provision and Audit Departmental Administrators</p>
          </div>
          
          <button
            onClick={() => { setShowForm(true); setEditId(null); setFormData({ name: "", email: "", password: "", departmentId: "" }); }}
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <FiPlus size={18} /> Provision Admin
          </button>
        </div>

        {/* Search & Records Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8">
          <div className="relative group lg:col-span-10">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter by name, email, or department domain..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
          <div className="lg:col-span-2 relative flex items-center bg-white border-2 border-slate-100 rounded-2xl px-4 py-4 shadow-sm group">
            <FiList className="text-slate-300 mr-2" />
            <select
              value={adminsPerPage}
              onChange={handleRecordsChange}
              className="w-full bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs uppercase tracking-tight"
            >
              <option value={5}>5 Rows</option>
              <option value={10}>10 Rows</option>
              <option value={25}>25 Rows</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl border border-rose-100 text-center font-bold text-xs uppercase tracking-widest">{error}</div>}

     {/* --- Data Table --- */}
      <div className="relative">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-emerald-500 font-black italic text-xs uppercase">Syncing Authority Nodes...</p>
          </div>
        ) : currentAdmins.length === 0 ? (
          <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[3rem]">
            <FiUser className="mx-auto text-slate-100 text-7xl mb-4" />
            <p className="text-slate-300 font-black italic uppercase text-sm">No Administrators Found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-sm bg-white">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest">Admin Identity</th>
                    <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest">Official Email</th>
                    <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest">Dept. Domain</th>
                    <th className="py-6 px-8 text-center text-[10px] font-black uppercase text-emerald-700 tracking-widest">Privileges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {currentAdmins.map((a) => (
                    <tr key={a._id} className="hover:bg-emerald-50/20 transition-all group">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs uppercase shadow-inner shrink-0">
                              {a.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700">{a.name}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-sm font-medium text-slate-500 italic">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-emerald-400 shrink-0" /> {a.email}
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className="inline-block bg-slate-100 px-4 py-1.5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                            {a?.department?.name || "UNASSIGNED"}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleEdit(a)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                            <FiEdit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(a._id)} 
                            disabled={deleteLoading === a._id}
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
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center px-4 py-8 gap-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Nodes <span className="text-emerald-600">{indexOfFirst + 1} - {Math.min(indexOfLast, filteredAdmins.length)}</span> of {filteredAdmins.length}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-20 transition-all"
                >
                  <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center px-6 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                  Page {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-20 transition-all"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- FORM MODAL (Popup) --- */}
      {showForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={resetForm}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black italic uppercase tracking-widest text-xs flex items-center gap-2">
                   {editId ? <FiEdit3 /> : <FiPlus />} {editId ? "Update Authority" : "Provision New Admin"}
                </h3>
              </div>
              <button onClick={resetForm} className="hover:rotate-90 transition-all p-2"><FiX size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 transition-all shadow-inner" required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Official Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 transition-all shadow-inner" required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Security Password {editId && "(Leave blank to keep current)"}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 transition-all shadow-inner" required={!editId} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Assigned Domain (Dept)</label>
                <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner" required>
                  <option value="">Select Domain</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                >
                  {formLoading ? "Processing..." : <><FiSave /> {editId ? "Commit Changes" : "Confirm Provisioning"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="text-center mt-10 text-slate-300 text-[10px] font-black uppercase tracking-[0.4em] italic">UniTrack Authority Control Protocol</p>
    </div>
  );
}