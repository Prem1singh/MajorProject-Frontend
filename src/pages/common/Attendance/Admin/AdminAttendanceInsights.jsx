import React, { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { 
  FiLayers, FiBarChart2, FiTarget, 
  FiShield, FiFilter, FiActivity, FiClock 
} from "react-icons/fi";

export default function AdminAttendanceInsights() {
  const user = useSelector((state) => state.user.data);
  const isSuperAdmin = user?.role === "Admin";
  
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  
  const [analytics, setAnalytics] = useState([]);
  const [selectedSubjData, setSelectedSubjData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Courses Logic (Separated for reuse)
  const fetchCourses = useCallback(async (deptId) => {
    if (!deptId) return;
    try {
      const res = await api.get(`/admin/department/${deptId}/courses`);
      setCourses(res.data);
    } catch (err) { 
      console.error("Course fetch error:", err); 
    }
  }, []);

  // 2. Initial Load
  useEffect(() => {
    if (isSuperAdmin) {
      api.get("/admin/departments").then(res => setDepartments(res.data));
    } else if (user?.department) {
      // HOD Case: Direct initialization
      setSelectedDept(user.department);
      fetchCourses(user.department);
    }
  }, [isSuperAdmin, user.department, fetchCourses]);

  // 3. Handlers
  const handleDeptChange = (deptId) => {
    setSelectedDept(deptId);
    setSelectedCourse("");
    setSelectedBatch("");
    setCourses([]);
    setBatches([]);
    setAnalytics([]);
    setSelectedSubjData(null);
    if (deptId) fetchCourses(deptId);
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedBatch("");
    setBatches([]);
    setAnalytics([]);
    setSelectedSubjData(null);
    if (!courseId) return;
    try {
      const res = await api.get(`/admin/course/${courseId}/batches`);
      setBatches(res.data.batches || []);
    } catch (err) { console.error("Batch fetch error"); }
  };

  const handleBatchChange = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedSubjData(null);
    if (!batchId) {
      setAnalytics([]);
      return;
    }
    setLoading(true);
    try {
      // API call to your analytics endpoint
      const res = await api.get(`/attendance/analytics/${batchId}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-10 min-h-screen animate-in fade-in duration-700 bg-[#f8fafc]">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none flex items-center gap-3">
             <FiShield className="text-emerald-500" /> Audit Center
          </h2>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
            {isSuperAdmin ? "Global Institutional Oversight" : "Departmental Academic Audit"}
          </p>
        </div>
        {selectedBatch && analytics.length > 0 && (
           <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <FiActivity className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest italic">Data Synchronized</span>
           </div>
        )}
      </div>

      {/* Hierarchy Filters */}
      <div className="bg-white p-8 rounded-[3rem] border border-emerald-50 shadow-sm mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2 italic">
          <FiFilter /> Hierarchy Navigation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isSuperAdmin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">1. Department</label>
              <select 
                value={selectedDept} 
                onChange={(e) => handleDeptChange(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all cursor-pointer shadow-inner"
              >
                <option value="">Select Dept</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">{isSuperAdmin ? "2. Course" : "1. Course"}</label>
            <select 
              disabled={!courses.length}
              value={selectedCourse} 
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all disabled:opacity-30 cursor-pointer shadow-inner"
            >
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">{isSuperAdmin ? "3. Batch" : "2. Batch"}</label>
            <select 
              disabled={!batches.length}
              value={selectedBatch} 
              onChange={(e) => handleBatchChange(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all disabled:opacity-30 cursor-pointer shadow-inner"
            >
              <option value="">Select Batch</option>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Analysis View */}
      {loading ? (
        <div className="py-24 text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
           <p className="mt-4 text-emerald-500 font-black italic text-[10px] uppercase tracking-[0.2em] animate-pulse">Scanning Academic Records...</p>
        </div>
      ) : analytics.length === 0 && selectedBatch ? (
        <div className="py-24 text-center border-4 border-dashed border-emerald-50 rounded-[4rem] bg-white">
           <FiBarChart2 size={60} className="mx-auto text-emerald-100 mb-4" />
           <p className="text-slate-300 font-black italic uppercase text-xs tracking-widest">No Attendance Data Compiled for this Batch</p>
        </div>
      ) : !selectedBatch ? (
        <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[4rem] bg-white">
           <FiTarget size={60} className="mx-auto text-slate-100 mb-4" />
           <p className="text-slate-300 font-black italic uppercase text-xs tracking-widest">Initiate Hierarchy Selection to Start Audit</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in slide-in-from-bottom-10 duration-700">
          
          {/* Sidebar Subjects */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {analytics.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedSubjData(item)}
                className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer ${selectedSubjData?.subjectName === item.subjectName ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-50 text-slate-600 hover:border-emerald-100'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${selectedSubjData?.subjectName === item.subjectName ? 'bg-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    <FiLayers />
                  </div>
                  <span className={`text-xl font-black italic ${Number(item.avgAttendance) < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {item.avgAttendance}%
                  </span>
                </div>
                <h4 className="font-black uppercase text-[10px] tracking-tight leading-tight">{item.subjectName}</h4>
              </div>
            ))}
          </div>

          {/* Detailed Student Breakdown */}
          <div className="lg:col-span-3">
            {selectedSubjData ? (
              <div className="bg-white rounded-[3.5rem] border border-emerald-50 shadow-2xl p-8 lg:p-12 animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                   <div>
                      <h3 className="text-2xl font-black italic text-slate-800 uppercase tracking-tighter leading-none">{selectedSubjData.subjectName}</h3>
                      <p className="text-emerald-500 font-black text-[9px] uppercase tracking-widest mt-2 italic">Detailed Performance Roster</p>
                   </div>
                   <span className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest italic border border-slate-200">{selectedSubjData.subjectCode}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] text-left">
                        <th className="pb-6 px-4">Student Name</th>
                        <th className="pb-6 px-4">Roll Number</th>
                        <th className="pb-6 px-4 text-center">Score %</th>
                        <th className="pb-6 px-4 text-right">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedSubjData.studentBreakdown.map((st, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                          <td className="py-6 px-4 font-bold text-slate-700 uppercase italic text-xs">{st.name}</td>
                          <td className="py-6 px-4 font-black text-[10px] text-slate-400 tracking-widest italic uppercase">{st.rollNo}</td>
                          <td className="py-6 px-4 text-center font-black italic text-sm">
                            <span className={Number(st.percentage) < 75 ? 'text-rose-500' : 'text-emerald-600'}>{st.percentage}%</span>
                          </td>
                          <td className="py-6 px-4 text-right">
                             <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic ${Number(st.percentage) < 75 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {Number(st.percentage) < 75 ? 'Shortage' : 'Eligible'}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white border-4 border-dashed border-emerald-50/30 rounded-[4rem] p-12 text-center min-h-[400px]">
                 <FiTarget size={48} className="text-emerald-100 mb-4" />
                 <h4 className="text-xl font-black italic text-slate-300 uppercase tracking-tighter">Audit Focused</h4>
                 <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-2 italic">Select a subject metric from the sidebar to expand records</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}