import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import api from "../../../../utils/axiosInstance";
import { 
  FiBook, FiUsers, FiTrendingUp, FiBarChart2, 
  FiChevronLeft, FiChevronRight, FiSearch, FiAward 
} from "react-icons/fi";
import { toast } from "react-toastify";

export default function SubjectPerformance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // 1. Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjects(res.data.subjects || []);
      } catch (err) {
        toast.error("Failed to fetch subjects");
      }
    };
    fetchSubjects();
  }, []);

  // 2. Fetch performance
  const fetchPerformance = async (subjectId) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const res = await api.get(`/performance/subject/${subjectId}`);
      
      // Sorting Logic: Total marks ke basis par rank nikalna
      const sortedStudents = res.data.students.map(s => ({
        ...s,
        total: Object.values(s.marks).reduce((sum, v) => sum + (v || 0), 0)
      })).sort((a, b) => b.total - a.total);

      setPerformance({ ...res.data, students: sortedStudents });
      setCurrentPage(1);
    } catch (err) {
      toast.error("Error fetching performance records");
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil((performance?.students.length || 0) / studentsPerPage);
  const currentStudents = useMemo(() => {
    const start = (currentPage - 1) * studentsPerPage;
    return performance?.students.slice(start, start + studentsPerPage) || [];
  }, [performance, currentPage]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Teacher Portal</span>
          <h2 className="text-xl md:text-xl md:text-3xl font-black text-slate-800 tracking-tight">Subject Analytics</h2>
        </div>
        <p className="text-slate-500 font-medium">Analyze class-wide performance and track student rankings.</p>
      </header>

      {/* Subject Selection Card */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-emerald-50 mb-10">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-grow space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              <FiBook className="text-emerald-500" /> Select Subject for Analysis
            </label>
            <select
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                fetchPerformance(e.target.value);
              }}
            >
              <option value="">-- Click to choose a subject --</option>
              {subjects.map((subj) => (
                <option key={subj._id} value={subj._id}>{subj.name}</option>
              ))}
            </select>
          </div>
          {loading && (
            <div className="px-6 py-4 text-emerald-600 font-bold animate-pulse">Syncing Data...</div>
          )}
        </div>
      </div>

      {performance ? (
        <div className="space-y-10 animate-in fade-in duration-500">
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top 10 Bar Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                <FiAward className="text-emerald-500" /> Top 10 Performers
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performance.students.slice(0, 10)} margin={{ top: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    {performance.exams.map((exam, i) => (
                      <Bar 
                        key={exam} 
                        dataKey={`marks.${exam}`} 
                        fill={["#10b981", "#3b82f6", "#f59e0b"][i % 3]} 
                        name={exam} 
                        radius={[4, 4, 0, 0]} 
                        barSize={20}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Trend Area Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                <FiTrendingUp className="text-emerald-500" /> Average Performance Trend
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performance.trend}>
                    <defs>
                      <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="exam" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                    <Area type="monotone" dataKey="average" stroke="#10b981" strokeWidth={4} fill="url(#colorAvg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Student Detailed Table */}
          <div className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <FiUsers className="text-emerald-500" /> All Students Result
              </h3>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                Total: {performance.students.length} Students
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                    {performance.exams.map((exam) => (
                      <th key={exam} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{exam}</th>
                    ))}
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentStudents.map((s, idx) => (
                    <tr key={s.studentId} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                            {idx + 1 + (currentPage - 1) * studentsPerPage}
                          </div>
                          <span className="font-bold text-slate-700">{s.name}</span>
                        </div>
                      </td>
                      {performance.exams.map((exam) => (
                        <td key={exam} className="p-6 text-center">
                          <span className="text-sm font-semibold text-slate-500">
                            {s.marks[exam] ?? <span className="text-slate-200">--</span>}
                          </span>
                        </td>
                      ))}
                      <td className="p-6 text-right">
                        <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl font-black text-xs shadow-lg shadow-slate-200">
                          {s.total}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all disabled:opacity-30"
              >
                <FiChevronLeft size={20} />
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      currentPage === i + 1 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all disabled:opacity-30"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-32 text-center px-4">
          <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiBarChart2 className="text-emerald-500 text-xl md:text-3xl" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-700">Analytics Ready</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto">Please select a subject from your teaching list to generate a performance report.</p>
        </div>
      )}
    </div>
  );
}