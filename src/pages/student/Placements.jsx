import React, { useEffect, useState, useMemo } from "react";
import api from "../../utils/axiosInstance";
import { 
  FiBriefcase, FiSearch, FiDollarSign, FiCalendar, 
  FiCheckCircle, FiInfo, FiFilter, FiExternalLink, FiClock 
} from "react-icons/fi";

export default function StudentPlacements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("dateLatest");

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/placements");
      setPlacements(res.data || []);
    } catch (err) {
      console.error("Placement fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // Memoized Filtered & Sorted Logic
  const filteredPlacements = useMemo(() => {
    return placements
      .filter((p) =>
        p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.eligibility || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOption === "dateLatest") return new Date(b.date) - new Date(a.date);
        if (sortOption === "dateOldest") return new Date(a.date) - new Date(b.date);
        if (sortOption === "packageHigh") return (parseFloat(b.package) || 0) - (parseFloat(a.package) || 0);
        if (sortOption === "packageLow") return (parseFloat(a.package) || 0) - (parseFloat(b.package) || 0);
        return 0;
      });
  }, [placements, searchTerm, sortOption]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-100">
            <FiBriefcase size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Placement Cell</h2>
        </div>
        <p className="text-slate-500 font-medium italic">Explore active recruitment drives and kickstart your professional journey.</p>
      </header>

      {/* Career Search Dashboard */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 mb-10 flex flex-col xl:flex-row gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-grow group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by company, role, or eligibility criteria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-emerald-500 transition-all font-bold text-slate-600 shadow-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-full xl:w-72">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 outline-none cursor-pointer focus:border-emerald-500 transition-all"
          >
            <option value="dateLatest">Sort: Newest First</option>
            <option value="dateOldest">Sort: Oldest First</option>
            <option value="packageHigh">Salary: High to Low</option>
            <option value="packageLow">Salary: Low to High</option>
          </select>
        </div>
      </div>

      {/* Placement Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-72 bg-white animate-pulse rounded-[2.5rem] border border-slate-100"></div>
          ))}
        </div>
      ) : filteredPlacements.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-28 text-center px-4">
          <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiInfo className="text-emerald-500 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 tracking-tight">No Active Drives</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto italic">We couldn't find any placement opportunities matching your criteria or batch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlacements.map((p) => (
            <div
              key={p._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              {/* Corner Design Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform"></div>
              
              <div className="relative flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                    <FiBriefcase size={24} />
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-emerald-100">
                    Active Drive
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors truncate">
                  {p.company}
                </h2>
                <p className="text-emerald-600 font-black text-xs mb-6 uppercase tracking-widest italic flex items-center gap-2">
                   {p.role}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <FiDollarSign className="text-emerald-400" /> 
                    <span className="text-slate-700">{p.package} LPA</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <FiCalendar className="text-emerald-400" /> 
                    <span className="text-slate-700">{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <FiCheckCircle className="text-emerald-400" /> 
                    <span className="text-slate-700 line-clamp-1">{p.eligibility || "Open for all"}</span>
                  </div>
                </div>

                {p.description && (
                  <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 line-clamp-3 italic">
                    {p.description}
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                  <FiClock /> Recruitment Phase
                </div>
                
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}