import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import { 
  FiBell, FiSearch, FiBook, FiFilter, 
  FiCalendar, FiClock, FiLayers, FiInfo 
} from "react-icons/fi";

export default function StudentAnnouncements() {
  const user = useSelector((state) => state.user.data);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Fetch student subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/students/subjects"); 
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        let url = "/announcements/student";
        if (selectedSubject !== "all") {
          url += `?subject=${selectedSubject}`;
        }
        const res = await api.get(url);
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error("Error fetching announcements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [selectedSubject]);

  // Filtered and sorted logic
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
  }, [announcements, searchTerm, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-100 animate-bounce">
            <FiBell size={24} />
          </div>
          <h2 className="text-xl md:text-xl md:text-3xl font-black text-slate-800 tracking-tight italic">Department Notices</h2>
        </div>
        <p className="text-slate-500 font-medium italic">Stay updated with the latest academic broadcasts and schedules.</p>
      </header>

      {/* Professional Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 mb-10 flex flex-col xl:flex-row gap-4">
        
        {/* Subject Select */}
        <div className="relative w-full xl:w-72">
          <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
          <select
            value={selectedSubject}
            onChange={(e) => { setSelectedSubject(e.target.value); setSearchTerm(""); }}
            className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-600 focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative flex-grow group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search for notices, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 transition-all font-bold text-slate-600 shadow-sm"
          />
        </div>

        {/* Sort Select */}
        <div className="relative w-full xl:w-64">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 outline-none cursor-pointer focus:border-emerald-500 transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 bg-white animate-pulse rounded-[2rem] border border-slate-100"></div>
          ))}
        </div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredAnnouncements.map((a) => (
            <div
              key={a._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 relative flex flex-col overflow-hidden"
            >
              {/* Corner Badge */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform"></div>
              
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                    <FiBell size={20} />
                  </div>
                  <div className="flex items-center gap-4 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1"><FiCalendar /> {new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                  {a.title}
                </h3>
                
                <p className="text-emerald-600 font-bold text-[10px] mb-4 uppercase tracking-[0.15em] flex items-center gap-2">
                  <FiBook /> {a.subject?.name || "General Announcement"}
                </p>

                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                  {a.description}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                     <FiClock /> {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-28 text-center px-4">
          <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiInfo className="text-emerald-500 text-xl md:text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 tracking-tight">Quiet on the board...</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto italic">No announcements found for this category at the moment.</p>
        </div>
      )}
    </div>
  );
}