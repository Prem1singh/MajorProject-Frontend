import React, { useEffect, useState, useMemo } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiBook, 
  FiUser, FiLayers, FiHash, FiAward, FiX, FiFilter, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const initialForm = {
    name: "",
    code: "",
    teacher: "",
    batch: "",
    semester: "",
    credits: "",
    type: "Core",
  };
  const [formData, setFormData] = useState(initialForm);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, bRes, sRes] = await Promise.all([
        api.get("/departmentAdmin/teachers"),
        api.get("/batches"),
        api.get("/departmentAdmin/subjects"),
      ]);
      setTeachers(tRes.data);
      setBatches(bRes.data);
      setSubjects(sRes.data.sort((a, b) => (a.code || "").localeCompare(b.code || "")));
    } catch (err) {
      toast.error("Failed to fetch department records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "batch") {
      const batchObj = batches.find((b) => b._id === value);
      if (batchObj) {
        setSemesterOptions(Array.from({ length: batchObj.totalSem }, (_, i) => i + 1));
        setFormData({ ...formData, batch: value, semester: "" });
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData(initialForm);
    setSemesterOptions([]);
    setModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      teacher: subject.teacher?._id || subject.teacher,
      batch: subject.batch?._id || subject.batch,
      semester: subject.semester,
      credits: subject.credits,
      type: subject.type,
    });
    const batchObj = batches.find((b) => b._id === (subject.batch?._id || subject.batch));
    if (batchObj) setSemesterOptions(Array.from({ length: batchObj.totalSem }, (_, i) => i + 1));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!editingSubject) {
        await api.post("/departmentAdmin/subject", formData);
        toast.success("Subject added to curriculum");
      } else {
        await api.put(`/departmentAdmin/subject/${editingSubject._id}`, formData);
        toast.success("Subject updated successfully");
      }
      fetchData();
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will affect marks associated with this subject.")) return;
    try {
      setDeletingId(id);
      await api.delete(`/departmentAdmin/subject/${id}`);
      toast.success("Subject removed");
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => 
      ((s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedBatch ? (s.batch?._id || s.batch) === selectedBatch : true)
    );
  }, [subjects, searchTerm, selectedBatch]);

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const currentSubjects = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTypeStyle = (type) => {
    const styles = {
      Core: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Elective: "bg-blue-100 text-blue-700 border-blue-200",
      Lab: "bg-purple-100 text-purple-700 border-purple-200",
      Project: "bg-orange-100 text-orange-700 border-orange-200"
    };
    return styles[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Curriculum Admin</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Subject Management</h2>
          </div>
          <p className="text-slate-500 font-medium">Define course syllabus, assign faculty, and manage credits.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold whitespace-nowrap"
        >
          <FiPlus strokeWidth={3} /> Add New Subject
        </button>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-64">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
          <select
            value={selectedBatch}
            onChange={(e) => { setSelectedBatch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none outline-none"
          >
            <option value="">All Batches</option>
            {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>

        <div className="relative flex-grow w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject name or unique code..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* Subjects Table Grid */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Info</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Semester / Credits</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center animate-pulse text-slate-400 font-bold italic">Syncing curriculum data...</td></tr>
              ) : currentSubjects.length > 0 ? (
                currentSubjects.map((s) => (
                  <tr key={s._id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shadow-inner">
                          <FiBook size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{s.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium italic"><FiHash /> {s.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                          <FiUser size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{s.teacher?.name || "Unassigned"}</p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><FiLayers /> {s.batch?.name || "General"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="inline-flex flex-col">
                        <span className="text-sm font-black text-slate-700">Sem {s.semester}</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{s.credits} Credits</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getTypeStyle(s.type)}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(s)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><FiEdit3 /></button>
                        <button onClick={() => handleDelete(s._id)} disabled={deletingId === s._id} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          {deletingId === s._id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent animate-spin rounded-full"></div> : <FiTrash2 />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-20 text-center text-slate-300 italic">No curriculum subjects match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center gap-4">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm">
              <FiChevronLeft size={20} />
            </button>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm">
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            <div className="bg-emerald-600 p-10 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight">{editingSubject ? "Edit Curriculum" : "Add Subject"}</h3>
                <p className="text-emerald-100 font-medium mt-1 italic">Course Structure Definition</p>
              </div>
              <FiAward size={60} className="opacity-10 absolute right-10 top-10" />
              <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-emerald-500 rounded-full transition-colors"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700" placeholder="e.g. Data Structures" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Code</label>
                  <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700" placeholder="e.g. CS-401" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Faculty</label>
                <select name="teacher" value={formData.teacher} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none" required>
                  <option value="">Select Faculty...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Batch</label>
                  <select name="batch" value={formData.batch} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none" required>
                    <option value="">Select Batch...</option>
                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none" required disabled={!semesterOptions.length}>
                    <option value="">Choose Sem...</option>
                    {semesterOptions.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credit Units</label>
                  <input type="number" name="credits" value={formData.credits} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700" placeholder="4" min={1} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none">
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                    <option value="Lab">Lab</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest text-[10px]">
                  {saving ? "Syncing..." : editingSubject ? "Save Changes" : "Launch Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}