import React, { useState, useEffect, useMemo } from "react";
import api from "../../../../utils/axiosInstance";
import { 
  FiBook, FiSearch, FiFileText, FiDownload, 
  FiFilter, FiLayers, FiInfo, FiExternalLink 
} from "react-icons/fi";

export default function ViewStudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("titleAsc");

  // 1. Fetch Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/students/subjects");
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Subject fetch error", err);
      }
    };
    fetchSubjects();
  }, []);

  // 2. Fetch Materials
  const fetchMaterials = async (subjectId = "all") => {
    setLoading(true);
    let url = "/study/student";
    if (subjectId !== "all") url += `?subject=${subjectId}`;
    try {
      const res = await api.get(url);
      setMaterials(res.data || []);
    } catch (err) {
      console.error("Material fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(selectedSubject);
  }, [selectedSubject]);

  // 3. Filtered and Sorted Logic
  const filteredAndSorted = useMemo(() => {
    return materials
      .filter((m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case "titleAsc": return a.title.localeCompare(b.title);
          case "titleDesc": return b.title.localeCompare(a.title);
          case "subjectAsc": return a.subject.name.localeCompare(b.subject.name);
          case "subjectDesc": return b.subject.name.localeCompare(a.subject.name);
          default: return 0;
        }
      });
  }, [materials, searchTerm, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-100">
            <FiBook size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Study Resources</h2>
        </div>
        <p className="text-slate-500 font-medium italic">Access your digital library and download course materials.</p>
      </header>

      {/* Modern Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 mb-10 flex flex-col xl:flex-row gap-4">
        
        {/* Subject Dropdown */}
        <div className="relative w-full xl:w-72">
          <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
          <select
            className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-600 focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-grow group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search notes, assignments, or titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 transition-all font-bold text-slate-600 shadow-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-full xl:w-64">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 outline-none cursor-pointer focus:border-emerald-500 transition-all"
          >
            <option value="titleAsc">Sort: Title A-Z</option>
            <option value="titleDesc">Sort: Title Z-A</option>
            <option value="subjectAsc">Sort: Subject</option>
          </select>
        </div>
      </div>

      {/* Materials Display Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 bg-white animate-pulse rounded-[2.5rem] border border-slate-100"></div>
          ))}
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-28 text-center px-4">
          <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiInfo className="text-emerald-500 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No Resources Found</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto italic">Try changing your filters or contact your teacher for materials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSorted.map((m) => (
            <div
              key={m._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-150"></div>
              
              <div className="relative flex-grow">
                {/* File Icon & Label */}
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl shadow-inner">
                    <FiFileText size={24} />
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-emerald-100">
                    Resource
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2 truncate group-hover:text-emerald-600 transition-colors">
                  {m.title}
                </h3>
                
                <p className="text-emerald-600 font-bold text-xs mb-4 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {m.subject.name}
                </p>

                <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-3 leading-relaxed italic">
                  {m.description || "Comprehensive study guide shared for the current semester curriculum."}
                </p>
              </div>

              {/* Action Area */}
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                  <FiExternalLink /> Public Access
                </div>
                
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group/btn active:scale-95"
                >
                  <span className="text-xs font-black uppercase">Open</span>
                  <FiDownload size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}