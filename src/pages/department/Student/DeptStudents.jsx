import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { toast } from "react-toastify";
import { 
  FiLayers, FiBarChart2, FiTarget, 
  FiActivity, FiFilter, FiChevronRight, FiClock 
} from "react-icons/fi";
import api from "../../../utils/axiosInstance";

export default function HODAttendanceView() {
  const user = useSelector((state) => state.user.data);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [analytics, setAnalytics] = useState([]);
  const [selectedSubjData, setSelectedSubjData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);

  // 1. Fetch Batches (Exactly like your StudentCRUD reference)
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setBatchLoading(true);
        // Using the endpoint that works in your StudentCRUD
        const res = await api.get("/batches");
        setBatches(res.data || []);
      } catch (err) {
        toast.error("Failed to fetch batches");
        console.error(err);
      } finally {
        setBatchLoading(false);
      }
    };
    fetchBatches();
  }, []);

  // 2. Fetch Attendance Analytics on Batch Change
  const handleBatchChange = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedSubjData(null);
    setAnalytics([]);
    
    if (!batchId) return;

    setLoading(true);
    try {
      const res = await api.get(`/attendance/analytics/${batchId}`);
      setAnalytics(res.data || []);
    } catch (err) {
      toast.error("Failed to load attendance analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-10 min-h-screen bg-[#f8fafc] animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider italic">Department Audit</span>
            <h2 className="text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none">Attendance Insights</h2>
          </div>
          <p className="text-slate-500 font-medium italic text-sm">Monitor student eligibility and subject-wise performance.</p>
        </div>
        {selectedBatch && (
          <div className="px-6 py-3 bg-slate-900 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Analysis Active
          </div>
        )}
      </div>

      {/* Batch Selector Hub - Clean like StudentCRUD */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-10 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-96">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
          <select 
            value={selectedBatch} 
            onChange={(e) => handleBatchChange(e.target.value)}
            disabled={batchLoading}
            className="w-full pl-10 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none outline-none cursor-pointer shadow-inner"
          >
            <option value="">{batchLoading ? "Loading Batches..." : "Select Batch for Audit"}</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} {b.year ? `(${b.year})` : ""}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">
          {batches.length} Available Batches in Directory
        </p>
      </div>

      {/* Main View */}
      {loading ? (
        <div className="py-24 text-center">
           <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-emerald-500 font-black italic uppercase text-[10px] tracking-widest">Compiling Analytics...</p>
        </div>
      ) : !selectedBatch ? (
        <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-white">
           <FiTarget size={60} className="mx-auto text-slate-100 mb-4" />
           <p className="text-slate-300 font-black italic uppercase text-xs tracking-widest">Pick a batch to generate student eligibility list</p>
        </div>
      ) : analytics.length === 0 ? (
        <div className="py-24 text-center border-4 border-dashed border-rose-100 rounded-[4rem] bg-white">
           <FiActivity size={60} className="mx-auto text-rose-100 mb-4" />
           <p className="text-rose-300 font-black italic uppercase text-xs tracking-widest">No attendance data found for this batch</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Sidebar Metrics */}
          <div className="xl:col-span-1 space-y-4 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
            {analytics.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedSubjData(item)}
                className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer group flex flex-col ${selectedSubjData?.subjectName === item.subjectName ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-50 text-slate-600 hover:border-emerald-200'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${selectedSubjData?.subjectName === item.subjectName ? 'bg-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    <FiLayers />
                  </div>
                  <span className={`text-xl font-black italic ${Number(item.avgAttendance) < 75 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {item.avgAttendance}%
                  </span>
                </div>
                <h4 className="font-black uppercase text-[10px] tracking-tight leading-tight mb-2">{item.subjectName}</h4>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/10">
                   <p className="text-[9px] font-bold uppercase opacity-40 italic">{item.subjectCode}</p>
                   <FiChevronRight className={selectedSubjData?.subjectName === item.subjectName ? "text-emerald-400" : "text-slate-200"} />
                </div>
              </div>
            ))}
          </div>

          {/* Student Roster Table */}
          <div className="xl:col-span-3">
            {selectedSubjData ? (
              <div className="bg-white rounded-[3rem] border border-emerald-50 shadow-2xl p-8 lg:p-12 animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-8">
                   <div>
                      <h3 className="text-2xl font-black italic text-slate-800 uppercase tracking-tighter leading-none">{selectedSubjData.subjectName}</h3>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] italic mt-2 italic">Student Eligibility Audit</p>
                   </div>
                   <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl text-center shadow-inner">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Strength</p>
                      <p className="text-xl font-black text-slate-800 italic">{selectedSubjData.studentBreakdown?.length || 0}</p>
                   </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] border-b border-slate-50">
                        <th className="pb-6 px-4 italic">Student Name</th>
                        <th className="pb-6 px-4 italic">Roll No</th>
                        <th className="pb-6 px-4 text-center italic">Attendance</th>
                        <th className="pb-6 px-4 text-right italic">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedSubjData.studentBreakdown?.map((student, sIdx) => (
                        <tr key={sIdx} className="group hover:bg-slate-50/50 transition-all">
                          <td className="py-6 px-4">
                             <p className="font-bold text-slate-700 uppercase italic text-xs group-hover:text-emerald-600 transition-colors">{student.name}</p>
                          </td>
                          <td className="py-6 px-4 font-black text-[10px] text-slate-400 tracking-widest italic">{student.rollNo}</td>
                          <td className="py-6 px-4 text-center">
                             <span className={`text-lg font-black italic ${Number(student.percentage) < 75 ? 'text-rose-500' : 'text-emerald-600'}`}>
                               {student.percentage}%
                             </span>
                          </td>
                          <td className="py-6 px-4 text-right">
                             <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic border ${Number(student.percentage) < 75 ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                               {Number(student.percentage) < 75 ? 'Shortage' : 'Clear'}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-100 rounded-[4rem] p-12 text-center min-h-[450px]">
                 <div className="bg-emerald-50 p-6 rounded-full mb-6">
                    <FiTarget className="text-emerald-300" size={48} />
                 </div>
                 <h4 className="text-lg font-black italic text-slate-400 uppercase tracking-tighter">Metric Selection Required</h4>
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-2 italic">Select a subject metric from the sidebar to view detailed roster</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}