import React, { useState, useEffect, useMemo } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiBook, 
  FiFileText, FiFilter, FiUploadCloud, FiX, FiExternalLink, FiClock 
} from "react-icons/fi";

export default function TeacherMaterialsManager() {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [formSubject, setFormSubject] = useState("");

  // Action loaders
  const [loadingUploadEdit, setLoadingUploadEdit] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);

  // Search & sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, []);

  const fetchMaterials = async (subjectId = "all") => {
    setLoading(true);
    let url = "/study/teacher";
    if (subjectId !== "all") url += `?subject=${subjectId}`;
    try {
      const res = await api.get(url);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(selectedSubject);
  }, [selectedSubject]);

  const openUploadModal = () => {
    setEditingMaterial(null);
    setTitle("");
    setDescription("");
    setFile(null);
    setFormSubject(selectedSubject !== "all" ? selectedSubject : "");
    setShowUploadModal(true);
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setTitle(material.title);
    setDescription(material.description);
    setFile(null);
    setFormSubject(material.subject._id);
    setShowUploadModal(true);
  };

  const handleSave = async () => {
    if (!title || !formSubject || (!file && !editingMaterial)) {
      return toast.error("Please fill all required fields");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", formSubject);
    if (file) formData.append("file", file);

    setLoadingUploadEdit(true);
    try {
      if (editingMaterial) {
        await api.put(`/study/${editingMaterial._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Material updated");
      } else {
        await api.post("/study/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("New material published");
      }
      setShowUploadModal(false);
      fetchMaterials(selectedSubject);
    } catch (err) {
      toast.error("Failed to save material");
    } finally {
      setLoadingUploadEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    setLoadingDeleteId(id);
    try {
      await api.delete(`/study/${id}`);
      setMaterials(materials.filter((m) => m._id !== id));
      toast.success("Material removed");
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials
      .filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = sortBy === "title" ? a.title.toLowerCase() : new Date(a.createdAt);
        const bValue = sortBy === "title" ? b.title.toLowerCase() : new Date(b.createdAt);
        return sortOrder === "asc" ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
      });
  }, [materials, searchTerm, sortBy, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Faculty Portal</span>
            <h2 className=" text-xl md:text-xl md:text-3xl font-black text-slate-800 tracking-tight">Study Materials</h2>
          </div>
          <p className="text-slate-500 font-medium italic">Upload, manage, and share resources with your students.</p>
        </div>
        <button
          onClick={openUploadModal}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold"
        >
          <FiUploadCloud strokeWidth={2.5} /> Upload Resource
        </button>
      </header>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col xl:flex-row gap-4 items-center">
        <div className="relative w-full xl:w-64">
          <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="relative flex-grow w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-48">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-50 rounded-xl font-bold text-slate-600 outline-none"
            >
              <option value="title">By Title</option>
              <option value="date">By Date</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-3 bg-white border-2 border-slate-50 text-slate-600 font-bold rounded-xl hover:border-emerald-500 transition-all"
          >
            {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
          </button>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => <div key={n} className="h-64 bg-white animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-24 text-center">
          <FiFileText className="mx-auto text-emerald-100 text-6xl mb-4" />
          <p className="text-slate-400 font-bold italic">No materials found for your selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredMaterials.map((m) => (
            <div
              key={m._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 transition-transform group-hover:scale-150"></div>
              
              <div className="relative flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl shadow-inner">
                    <FiFileText size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(m)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <FiEdit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(m._id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      {loadingDeleteId === m._id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent animate-spin rounded-full"></div> : <FiTrash2 size={18} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2 truncate group-hover:text-emerald-600 transition-colors">{m.title}</h3>
                <p className="text-emerald-600 font-black text-xs mb-4 flex items-center gap-2 uppercase tracking-widest italic">
                  <FiBook className="shrink-0" /> {m.subject.name}
                </p>
                <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-3 leading-relaxed">
                  {m.description || "No description provided for this resource."}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                  <FiClock /> {new Date(m.createdAt).toLocaleDateString()}
                </div>
                <a 
                  href={m.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-emerald-600 text-white p-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <span className="text-[10px] font-black uppercase px-1">View</span>
                  <FiExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            <div className="bg-emerald-600 p-10 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-xl md:text-3xl font-black tracking-tight">{editingMaterial ? "Edit Resource" : "Upload Material"}</h3>
                <p className="text-emerald-100 font-medium mt-1 italic">Knowledge Sharing</p>
              </div>
              <FiUploadCloud size={60} className="opacity-10 absolute right-10 top-10" />
              <button onClick={() => setShowUploadModal(false)} className="absolute top-8 right-8 p-2 hover:bg-emerald-500 rounded-full transition-colors"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Associated Subject</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 appearance-none"
                  required
                >
                  <option value="">Select Subject...</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 2: Data Structures PDF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Description</label>
                <textarea
                  placeholder="Briefly explain what this file contains..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  rows="3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Upload</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all cursor-pointer"
                  />
                  {file && <p className="mt-2 text-xs font-black text-emerald-600 italic">Selected: {file.name}</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-8 py-5 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loadingUploadEdit}
                  className="flex-[2] px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  {loadingUploadEdit ? "Processing..." : editingMaterial ? "Update Resource" : "Publish Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}