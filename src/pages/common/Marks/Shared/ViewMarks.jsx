import React, { useState, useEffect } from "react";
import api from "../../../../utils/axiosInstance";
import { 
  FiEye, FiSearch, FiBookOpen, FiArrowUp, 
  FiArrowDown, FiChevronLeft, FiChevronRight, FiFilter 
} from "react-icons/fi";

export default function ViewMarks() {
  const [subject, setSubject] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rollNo");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // 1. Fetch Teacher's Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  // 2. Load Marks for Selected Subject
  const handleView = async () => {
    if (!subject) return;
    setLoading(true);
    try {
      const res = await api.get("/marks", { params: { subject } });
      const marks = res.data || [];
      
      // Extract exam names dynamically from keys (excluding metadata)
      const types = marks.length
        ? Array.from(new Set(marks.flatMap((m) => 
            Object.keys(m).filter((k) => k !== "student" && k !== "_id" && k !== "__v")
          )))
        : [];

      setExamTypes(types);
      setMarksData(marks);
      setCurrentPage(1);
    } catch (err) {
      setMarksData([]);
      setExamTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Search & Filter Logic
  const filtered = marksData.filter(
    (s) =>
      s.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student?.rollNo?.toString().includes(searchTerm)
  );

  // 4. Sorting Logic
// 4. Sorting Logic (Fixed Typo)
const sorted = [...filtered].sort((a, b) => {
  let aVal, bVal;
  if (sortBy === "rollNo") {
    aVal = a.student?.rollNo || 0;
    bVal = b.student?.rollNo || 0;
  } else if (sortBy === "name") {
    aVal = a.student?.name.toLowerCase() || "";
    bVal = b.student?.name.toLowerCase() || "";
  } else {
    // parseFloat handles marks sorting correctly
    aVal = parseFloat(a[sortBy]) || 0;
    bVal = parseFloat(b[sortBy]) || 0; // Yahan bVAl ki jagah bVal kar diya hai
  }

  if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
  if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
  return 0;
});

  // 5. Pagination Calculations
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sorted.length / rowsPerPage);

  const toggleSort = (key) => {
    if (sortBy === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-emerald-100 overflow-hidden min-h-[600px] animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-emerald-600 p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3 uppercase">
              <FiEye /> View Class Marks
            </h2>
            <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest mt-1">Gradebook & Performance Analytics</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
             <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:bg-white/20 transition-all cursor-pointer"
              >
                <option value="" className="text-slate-800">Select Subject</option>
                {subjectsForTeacher.map((s) => (
                  <option key={s._id} value={s._id} className="text-slate-800">{s.name}</option>
                ))}
              </select>
              <button 
                onClick={handleView} 
                className="bg-white text-emerald-600 px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-[0.1em] hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
              >
                Sync Data
              </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        {/* Search and Sort Toolbar */}
        <div className="flex flex-col xl:flex-row gap-6 mb-10 justify-between items-center">
          <div className="relative w-full xl:w-96 group">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by student name or roll..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-600"
            />
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3 flex items-center gap-2">
                <FiFilter /> Sort
             </span>
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)} 
               className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-600 outline-none cursor-pointer"
             >
                <option value="rollNo">Roll Number</option>
                <option value="name">Full Name</option>
                {examTypes.map(ex => <option key={ex} value={ex}>{ex}</option>)}
             </select>
             <button 
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all"
             >
                {sortOrder === "asc" ? <FiArrowUp size={18}/> : <FiArrowDown size={18}/>}
             </button>
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="mt-6 text-emerald-500 font-black italic tracking-tight uppercase text-xs">Fetching records...</p>
          </div>
        ) : currentRows.length > 0 ? (
          <div className="animate-in fade-in duration-700">
            <div className="overflow-x-auto rounded-[2.5rem] border border-emerald-100 shadow-sm bg-white mb-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th onClick={() => toggleSort("rollNo")} className="py-6 px-8 text-left text-[10px] font-black uppercase tracking-widest text-emerald-700 cursor-pointer group">
                        <div className="flex items-center gap-2">
                            Roll {sortBy === "rollNo" && (sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                        </div>
                    </th>
                    <th onClick={() => toggleSort("name")} className="py-6 px-8 text-left text-[10px] font-black uppercase tracking-widest text-emerald-700 cursor-pointer group">
                        <div className="flex items-center gap-2">
                            Student Name {sortBy === "name" && (sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                        </div>
                    </th>
                    {examTypes.map((ex) => (
                      <th key={ex} onClick={() => toggleSort(ex)} className="py-6 px-8 text-center text-[10px] font-black uppercase tracking-widest text-emerald-700 cursor-pointer group">
                        <div className="flex items-center justify-center gap-2 uppercase italic">
                            {ex} {sortBy === ex && (sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {currentRows.map((s, idx) => (
                    <tr key={s.student?._id || idx} className="hover:bg-emerald-50/20 transition-all duration-300 group">
                      <td className="py-6 px-8 font-black text-slate-400 italic">#{s.student?.rollNo}</td>
                      <td className="py-6 px-8 font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{s.student?.name}</td>
                      {examTypes.map((ex) => (
                        <td key={ex} className="py-6 px-8 text-center">
                          <span className={`inline-block min-w-[50px] px-4 py-2 rounded-xl font-black text-sm shadow-sm ${s[ex] >= 40 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                            {s[ex] ?? "--"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center px-4 py-4 bg-slate-50/50 rounded-[2rem] gap-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Showing <span className="text-emerald-600">{indexOfFirst + 1}</span> to{" "}
                <span className="text-emerald-600">{Math.min(indexOfLast, sorted.length)}</span> of{" "}
                <span className="text-emerald-600">{sorted.length}</span> results
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  className="p-3 bg-white border border-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-20"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft size={20} />
                </button>
                
                <div className="hidden sm:flex gap-1">
                   {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                          currentPage === i + 1 
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                          : "bg-white text-slate-400 border border-slate-100 hover:bg-emerald-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                   ))}
                </div>

                <button
                  className="p-3 bg-white border border-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-20"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-28 text-center border-2 border-dashed border-emerald-50 rounded-[3rem] bg-emerald-50/5 transition-all">
            <FiBookOpen className="mx-auto text-emerald-100 text-8xl mb-6" />
            <p className="text-emerald-400 font-black italic text-lg uppercase tracking-tight">
              {subject ? "No grade records found." : "Select criteria to load gradebook."}
            </p>
            <p className="text-slate-400 text-sm font-medium mt-2 italic px-10">Use the subject dropdown at the top to populate classroom data.</p>
          </div>
        )}
      </div>
    </div>
  );
}