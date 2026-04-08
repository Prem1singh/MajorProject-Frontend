import React, { useState, useEffect } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiEye, FiSearch, FiBookOpen, FiCalendar, 
  FiFilter, FiArrowUp, FiArrowDown, FiChevronLeft, FiChevronRight, FiPieChart 
} from "react-icons/fi";

export default function ViewAttendance() {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [overallPercent, setOverallPercent] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Search, sort & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rollNo");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects");
      }
    };
    fetchSubjects();
  }, []);

  const fetchAttendance = async () => {
    if (!subject) {
      toast.error("Please select a subject");
      return;
    }

    setLoading(true);
    try {
      let url = `/attendance?subject=${subject}`;
      if (date) url += `&date=${date}`;

      const res = await api.get(url);
      const records = res.data || [];
      setAttendanceRecords(records);

      if (!date) {
        const studentMap = {};
        records.forEach((r) => {
          const sid = r.student?._id;
          if (!sid) return;
          if (!studentMap[sid]) {
            studentMap[sid] = { present: 0, total: 0 };
          }
          studentMap[sid].total += 1;
          if (r.status === "present") studentMap[sid].present += 1;
        });

        const percentMap = {};
        Object.keys(studentMap).forEach((sid) => {
          const { present, total } = studentMap[sid];
          percentMap[sid] = total ? ((present / total) * 100).toFixed(2) : "0.00";
        });
        setOverallPercent(percentMap);
      } else {
        setOverallPercent({});
      }
      setHasFetched(true);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Error fetching data");
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const isSummary = !date;

  const uniqueStudents = isSummary
    ? Object.keys(overallPercent).map((sid) => {
        const record = attendanceRecords.find((r) => r.student?._id === sid);
        return {
          _id: sid,
          name: record?.student?.name || "-",
          rollNo: record?.student?.rollNo || "-",
          percent: overallPercent[sid]
        };
      })
    : attendanceRecords.map(r => ({
        ...r,
        name: r.student?.name || "-",
        rollNo: r.student?.rollNo || "-"
      }));

  const filteredData = uniqueStudents.filter((record) => {
    return (
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.rollNo.toString().includes(searchTerm)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === "name") { aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); }
    else if (sortBy === "percent") { aVal = parseFloat(a.percent || 0); bVal = parseFloat(b.percent || 0); }
    else if (sortBy === "status") { aVal = a.status || ""; bVal = b.status || ""; }
    else { aVal = a.rollNo.toString(); bVal = b.rollNo.toString(); }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedData = sortedData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const toggleSort = (key) => {
    if (sortBy === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortOrder("asc"); }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-emerald-100 overflow-hidden min-h-[600px] animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-emerald-600 p-8 text-white">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3 uppercase">
              <FiEye /> {isSummary ? "Attendance Summary" : "Daily Log View"}
            </h2>
            <p className="text-emerald-100/80 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              {isSummary ? "Viewing overall percentages" : `Viewing records for ${date}`}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:bg-white/20 transition-all"
              >
                <option value="" className="text-slate-800">Select Subject</option>
                {subjectsForTeacher.map((s) => (
                  <option key={s._id} value={s._id} className="text-slate-800">{s.name}</option>
                ))}
              </select>

              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white outline-none focus:bg-white/20 transition-all"
                />
              </div>

              <button onClick={fetchAttendance} className="bg-white text-emerald-600 px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg active:scale-95">
                Fetch
              </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        {/* Search & Sort Toolbar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 justify-between items-center">
          <div className="relative w-full lg:w-96 group">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-600"
            />
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-3 flex items-center gap-2">
                <FiFilter className="text-emerald-500" /> Sort By
             </span>
             <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-600 outline-none">
                <option value="rollNo">Roll Number</option>
                <option value="name">Name</option>
                {isSummary ? <option value="percent">Attendance %</option> : <option value="status">Status</option>}
             </select>
             <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all">
                {sortOrder === "asc" ? <FiArrowUp size={16}/> : <FiArrowDown size={16}/>}
             </button>
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="mt-6 text-emerald-500 font-black italic tracking-tight uppercase text-xs">Compiling Records...</p>
          </div>
        ) : hasFetched ? (
          <div className="animate-in fade-in duration-700">
            <div className="overflow-x-auto rounded-[2.5rem] border border-emerald-100 shadow-sm bg-white mb-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th onClick={() => toggleSort("rollNo")} className="py-6 px-8 text-left text-[10px] font-black uppercase tracking-widest text-emerald-700 cursor-pointer">
                        Roll No {sortBy === "rollNo" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th onClick={() => toggleSort("name")} className="py-6 px-8 text-left text-[10px] font-black uppercase tracking-widest text-emerald-700 cursor-pointer">
                        Student Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    {isSummary ? (
                        <th onClick={() => toggleSort("percent")} className="py-6 px-8 text-center text-[10px] font-black uppercase tracking-widest text-emerald-700 cursor-pointer">
                            Overall % {sortBy === "percent" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                    ) : (
                        <>
                            <th onClick={() => toggleSort("status")} className="py-6 px-8 text-center text-[10px] font-black uppercase tracking-widest text-emerald-700 cursor-pointer">Status</th>
                            <th className="py-6 px-8 text-center text-[10px] font-black uppercase tracking-widest text-emerald-700">Date</th>
                        </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/20 transition-all duration-300 group">
                      <td className="py-6 px-8 font-black text-slate-400 italic">#{row.rollNo}</td>
                      <td className="py-6 px-8 font-bold text-slate-700">{row.name}</td>
                      {isSummary ? (
                        <td className="py-6 px-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: `${row.percent}%` }}></div>
                             </div>
                             <span className="font-black text-emerald-600 text-sm">{row.percent}%</span>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="py-6 px-8 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === "present" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"}`}>
                                {row.status}
                            </span>
                          </td>
                          <td className="py-6 px-8 text-center font-bold text-slate-400 text-xs tracking-tighter">
                            {new Date(row.date).toLocaleDateString()}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center px-4 py-4 bg-slate-50/50 rounded-[2rem] gap-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Showing <span className="text-emerald-600">{indexOfFirst + 1}</span> to <span className="text-emerald-600">{Math.min(indexOfLast, sortedData.length)}</span> of {sortedData.length}
              </p>
              <div className="flex gap-2">
                <button className="p-3 bg-white border border-emerald-100 text-emerald-600 rounded-xl shadow-sm disabled:opacity-20" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><FiChevronLeft size={20}/></button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i+1 ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-white text-slate-400 border border-slate-100 hover:bg-emerald-50"}`}>{i+1}</button>
                  ))}
                </div>
                <button className="p-3 bg-white border border-emerald-100 text-emerald-600 rounded-xl shadow-sm disabled:opacity-20" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><FiChevronRight size={20}/></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-28 text-center border-2 border-dashed border-emerald-50 rounded-[3rem] bg-emerald-50/5">
            <FiPieChart className="mx-auto text-emerald-100 text-8xl mb-6" />
            <p className="text-emerald-400 font-black italic text-lg uppercase tracking-tight">Select criteria to analyze attendance</p>
          </div>
        )}
      </div>
    </div>
  );
}