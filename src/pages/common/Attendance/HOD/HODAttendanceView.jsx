import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import { 
  FiLayers, FiBarChart2, FiTarget, 
  FiActivity, FiFilter, FiChevronRight 
} from "react-icons/fi";

export default function HODAttendanceView() {
  const user = useSelector((state) => state.user.data);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [analytics, setAnalytics] = useState([]);
  const [selectedSubjData, setSelectedSubjData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);

  // 1. Fetch only this Department's Batches (Directly on Load)
  useEffect(() => {
    const fetchBatches = async () => {
    
      
      setBatchLoading(true);
      try {
        // Department ID agar object hai toh ID nikalenge, warna string use karenge
        const res = await api.get("/batches");
        console.log(res.data)
        setBatches(res.data || []);
      } catch (err) {
        console.error("Batch load error:", err);
      } finally {
        setBatchLoading(false);
      }
    };

    fetchBatches();
  }, [user?.department]);

  // 2. Fetch Attendance Analytics on Batch Change
  const handleBatchChange = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedSubjData(null);
    setAnalytics([]);
    
    if (!batchId) return;

    setLoading(true);
    try {
        console.log(batchId)
      const res = await api.get(`/attendance/analytics/${batchId}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-10 min-h-screen bg-[#f8fafc] animate-in fade-in duration-700">
      
      {/* Header - Simple & Clean */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm">
        <div>
          <h2 className="text-xl md:text-xl md:text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none flex items-center gap-3">
             <FiActivity className="text-emerald-500" /> Dept. Audit
          </h2>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
            Departmental Attendance Monitoring
          </p>
        </div>
        {selectedBatch && (
          <div className="px-6 py-3 bg-slate-900 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Batch Synchronized
          </div>
        )}
      </div>

      {/* Batch Selector Hub - Direct Choice */}
      <div className="bg-white p-8 rounded-[3rem] border border-emerald-50 shadow-sm mb-10 max-w-2xl">
         <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2">
              <FiFilter className="text-emerald-500" /> Choose Target Batch
            </label>
            <select 
              value={selectedBatch} 
              onChange={(e) => handleBatchChange(e.target.value)}
              disabled={batchLoading}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all cursor-pointer shadow-inner appearance-none"
            >
              <option value="">{batchLoading ? "Loading Batches..." : "Select Batch..."}</option>
              {batches.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name} — (Semester {b.currentSem || 'N/A'})
                </option>
              ))}
            </select>
         </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
           <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
           <p className="text-emerald-500 font-black italic uppercase text-[10px] tracking-widest animate-pulse">Analyzing Attendance Records...</p>
        </div>
      ) : !selectedBatch ? (
        <div className="py-24 text-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-white">
           <FiTarget size={60} className="mx-auto text-slate-100 mb-4" />
           <p className="text-slate-300 font-black italic uppercase text-xs tracking-widest">Select a batch from the dropdown to start audit</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Sidebar: Subject Metrics */}
          <div className="xl:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {analytics.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedSubjData(item)}
                className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer group flex flex-col ${selectedSubjData?.subjectName === item.subjectName ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-50 text-slate-600 hover:border-emerald-200 shadow-sm'}`}
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
                   <p className="text-[9px] font-bold uppercase opacity-40">Code: {item.subjectCode}</p>
                   <FiChevronRight className={selectedSubjData?.subjectName === item.subjectName ? "text-emerald-400" : "text-slate-200"} />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Student Roster */}
          <div className="xl:col-span-3">
            {selectedSubjData ? (
              <div className="bg-white rounded-[3.5rem] border border-emerald-50 shadow-2xl p-8 lg:p-12 animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-8">
                   <div>
                      <h3 className="text-xl md:text-2xl font-black italic text-slate-800 uppercase tracking-tighter leading-none">{selectedSubjData.subjectName}</h3>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2 italic">Student Eligibility Audit</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                      <p className="text-lg font-black text-slate-800 italic mt-1 uppercase">{selectedSubjData.subjectCode}</p>
                   </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] text-left border-b border-slate-50">
                        <th className="pb-6 px-4">Student Identity</th>
                        <th className="pb-6 px-4">Roll Number</th>
                        <th className="pb-6 px-4 text-center">Score %</th>
                        <th className="pb-6 px-4 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedSubjData.studentBreakdown.map((student, sIdx) => (
                        <tr key={sIdx} className="group hover:bg-slate-50/50 transition-all">
                          <td className="py-6 px-4">
                             <p className="font-bold text-slate-700 uppercase italic text-xs group-hover:text-emerald-600">{student.name}</p>
                          </td>
                          <td className="py-6 px-4 font-black text-[10px] text-slate-400 tracking-widest italic">{student.rollNo}</td>
                          <td className="py-6 px-4 text-center font-black italic text-sm">
                            <span className={Number(student.percentage) < 75 ? 'text-rose-500' : 'text-emerald-600'}>{student.percentage}%</span>
                          </td>
                          <td className="py-6 px-4 text-right">
                             <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic border ${Number(student.percentage) < 75 ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
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
                 <FiBarChart2 size={48} className="text-emerald-100 mb-4 animate-bounce" />
                 <h4 className="text-lg font-black italic text-slate-300 uppercase tracking-tighter">Metric Selection Required</h4>
                 <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mt-2 italic leading-relaxed">Select a subject metric from the sidebar <br /> to view student roster</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}