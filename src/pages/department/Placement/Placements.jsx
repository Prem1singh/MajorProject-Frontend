import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiBriefcase, 
  FiCalendar, FiDollarSign, FiUsers, FiX, FiFilter 
} from "react-icons/fi";

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState(null);

  const initialForm = {
    company: "",
    role: "",
    package: "",
    eligibility: "",
    description: "",
    date: "",
    batches: [],
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchPlacements();
    fetchBatches();
  }, []);

  const fetchPlacements = async () => {
    try {
      const res = await api.get("/placements");
      setPlacements(res.data);
      setFilteredPlacements(res.data);
    } catch (err) {
      toast.error("Failed to fetch placements");
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get("/batches");
      setBatches(res.data);
    } catch (err) {
      toast.error("Failed to load batches");
    }
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditingPlacement(null);
    setIsModalOpen(true);
  };

  const openEditModal = (placement) => {
    setForm({
      company: placement.company,
      role: placement.role,
      package: placement.package,
      eligibility: placement.eligibility,
      description: placement.description,
      date: placement.date.split("T")[0],
      batches: placement.batches.map((b) => (typeof b === "string" ? b : b._id)),
    });
    setEditingPlacement(placement);
    setIsModalOpen(true);
  };

  const handleBatchChange = (batchId) => {
    setForm((prev) => {
      const alreadySelected = prev.batches.includes(batchId);
      return {
        ...prev,
        batches: alreadySelected
          ? prev.batches.filter((id) => id !== batchId)
          : [...prev.batches, batchId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPlacement) {
        await api.put(`/placements/${editingPlacement._id}`, form);
        toast.success("Placement records updated");
      } else {
        await api.post("/placements", form);
        toast.success("New placement drive added");
      }
      fetchPlacements();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Process failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("As Admin, are you sure you want to remove this placement drive?")) return;
    setDeleteLoadingId(id);
    try {
      await api.delete(`/placements/${id}`);
      toast.success("Placement drive removed");
      fetchPlacements();
    } catch (err) {
      toast.error("Failed to delete record");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  useEffect(() => {
    let data = [...placements];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          p.company.toLowerCase().includes(term) ||
          p.role.toLowerCase().includes(term) ||
          p.eligibility.toLowerCase().includes(term)
      );
    }
    if (sortOption === "date-asc") data.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortOption === "date-desc") data.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortOption === "company-asc") data.sort((a, b) => a.company.localeCompare(b.company));
    if (sortOption === "company-desc") data.sort((a, b) => b.company.localeCompare(a.company));
    setFilteredPlacements(data);
  }, [searchTerm, sortOption, placements]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Placement Portal</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Recruitment Management</h2>
          </div>
          <p className="text-slate-500 font-medium italic">Oversee campus drives and student career opportunities.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold whitespace-nowrap"
        >
          <FiPlus strokeWidth={3} /> Add New Drive
        </button>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-grow group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search company, role or criteria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 transition-all font-bold text-slate-600 shadow-sm"
          />
        </div>
        <div className="relative w-full lg:w-72">
          <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full appearance-none bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 font-bold text-slate-600 cursor-pointer shadow-sm"
          >
            <option value="date-desc">Newest Drives</option>
            <option value="date-asc">Oldest Drives</option>
            <option value="company-asc">Company (A-Z)</option>
            <option value="company-desc">Company (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Placements Grid */}
      {filteredPlacements.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[2.5rem] py-24 text-center">
          <FiBriefcase className="mx-auto text-emerald-100 text-6xl mb-4" />
          <p className="text-slate-400 font-bold italic">No placement drives found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredPlacements.map((p) => (
            <div
              key={p._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 relative flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-150"></div>
              
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl">
                    <FiBriefcase size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(p)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <FiEdit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(p._id)} disabled={deleteLoadingId === p._id} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-slate-800 mb-2 truncate leading-tight">{p.company}</h2>
                <p className="text-emerald-600 font-black text-sm mb-4 tracking-wide uppercase italic">{p.role}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <FiDollarSign className="text-emerald-400" /> {p.package} LPA
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <FiCalendar className="text-emerald-400" /> {new Date(p.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric'})}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <FiUsers className="text-emerald-400" /> {p.eligibility}
                  </div>
                </div>
                
                {p.description && (
                  <p className="text-slate-400 text-xs line-clamp-3 mb-6 font-medium leading-relaxed">
                    {p.description}
                  </p>
                )}
              </div>

             
            </div>
          ))}
        </div>
      )}

      {/* Admin Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            <div className="bg-emerald-600 p-10 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight">{editingPlacement ? "Edit Drive Info" : "Post Recruitment"}</h3>
                <p className="text-emerald-100 font-medium mt-1 italic">Authorized Admin Action</p>
              </div>
              <FiBriefcase size={60} className="opacity-10 absolute right-10 top-10" />
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-emerald-500 rounded-full transition-colors">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                    placeholder="e.g. Google India"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Position / Role</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Package (LPA)</label>
                  <input
                    type="text"
                    value={form.package}
                    onChange={(e) => setForm({ ...form, package: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                    placeholder="8.5"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Drive Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Eligibility</label>
                  <input
                    type="text"
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                    placeholder="7.5 CGPA"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description & Requirements</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  rows="3"
                  placeholder="Additional details about the role..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Batches</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {batches.map((batch) => (
                    <label key={batch._id} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.batches.includes(batch._id) ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"}`}>
                      <input
                        type="checkbox"
                        checked={form.batches.includes(batch._id)}
                        onChange={() => handleBatchChange(batch._id)}
                        className="hidden"
                      />
                      <span className="text-xs font-black uppercase tracking-tight">{batch.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-5 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  {loading ? "Processing..." : editingPlacement ? "Update Drive" : "Publish Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}