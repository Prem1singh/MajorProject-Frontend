import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiTrendingUp, FiLayers, FiBook, FiBarChart2, 
  FiAward, FiTarget, FiActivity, FiArrowUpRight 
} from "react-icons/fi";

export default function BatchPerformance() {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        setBatches(res.data);
      } catch (err) {
        toast.error("Failed to load batches");
      }
    };
    fetchBatches();
  }, []);

  // 2. Fetch Subjects on Batch Change
  useEffect(() => {
    if (!selectedBatch) return;
    const fetchSubjects = async () => {
      try {
        const res = await api.get(`/departmentAdmin/subjects/batch?batch=${selectedBatch}`);
        setSubjects(res.data);
        setSelectedSubject("");
        setPerformance(null);
      } catch (err) {
        toast.error("Failed to load subjects");
      }
    };
    fetchSubjects();
  }, [selectedBatch]);

  // 3. Dynamic Stats Calculation (Fixes the "Avg" functionality)
  const stats = useMemo(() => {
    if (!performance || !performance.subjects) return { overall: 0, topSubject: "N/A" };
    
    const subjectData = performance.subjects;
    const avgSum = subjectData.reduce((acc, curr) => acc + (parseFloat(curr.average) || 0), 0);
    const overallAvg = (avgSum / subjectData.length).toFixed(2);
    
    const top = [...subjectData].sort((a, b) => b.average - a.average)[0];
    
    return {
      overall: overallAvg,
      topSubject: top ? top.subject : "N/A"
    };
  }, [performance]);

  const fetchPerformance = async () => {
    if (!selectedBatch) return toast.error("Please select a batch.");
    setLoading(true);
    try {
      let url = `/performance/department/batch?batch=${selectedBatch}`;
      if (selectedSubject) url += `&subject=${selectedSubject}`;
      const res = await api.get(url);
      setPerformance(res.data);
      toast.success("Analytics Updated");
    } catch (err) {
      toast.error("Error fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* HOD Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">HOD Insights</span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Performance Analytics</h2>
        </div>
        <p className="text-slate-500 font-medium">Tracking batch trends and academic excellence.</p>
      </header>

      {/* Control Panel */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-emerald-50 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Target Batch</label>
            <select
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all appearance-none"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">Select Batch...</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>

          {/* <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Subject Filter</label>
            <select
              disabled={!selectedBatch}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all appearance-none disabled:opacity-50"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div> */}

          <button
            onClick={fetchPerformance}
            disabled={loading || !selectedBatch}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-[60px] rounded-2xl font-black transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Calculating..." : <><FiActivity /> Run Analysis</>}
          </button>
        </div>
      </div>

      {performance ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FiTrendingUp />} label="Batch Avg" value={`${stats.overall}%`} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard icon={<FiAward />} label="Top Subject" value={stats.topSubject} color="text-blue-600" bg="bg-blue-50" />
            <StatCard icon={<FiTarget />} label="Evaluations" value={performance.exams?.length || 0} color="text-purple-600" bg="bg-purple-50" />
            <StatCard icon={<FiArrowUpRight />} label="Subjects" value={performance.subjects?.length || 0} color="text-orange-600" bg="bg-orange-50" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Visual Trend Chart */}
            <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-emerald-50">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                <FiBarChart2 className="text-emerald-500" /> Progression Trend
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
                    <XAxis dataKey="exam" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                    <Area type="monotone" dataKey="average" stroke="#10b981" strokeWidth={4} fill="url(#colorAvg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-emerald-50 overflow-hidden">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                <FiBook className="text-emerald-500" /> Detailed Metrics
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                      {performance.exams.map(ex => (
                        <th key={ex} className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{ex}</th>
                      ))}
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {performance.subjects.map((subj, i) => (
                      <tr key={i} className="group hover:bg-emerald-50/40 transition-colors">
                        <td className="py-5 font-bold text-slate-700">{subj.subject}</td>
                        {performance.exams.map(ex => (
                          <td key={ex} className="py-5 text-center text-sm font-semibold text-slate-400">
                            {subj.marks[ex] ?? "--"}
                          </td>
                        ))}
                        <td className="py-5 text-right">
                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-black text-sm border border-emerald-100">
                            {subj.average}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-28 text-center px-4">
          <div className="bg-emerald-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-12">
            <FiActivity className="text-emerald-500 text-4xl" />
          </div>
          <h3 className="text-2xl font-black text-slate-700">Analytics Engine Ready</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto">Select a batch and initiate analysis to visualize performance patterns.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className={`text-xl font-black text-slate-800 truncate`}>{value}</p>
      </div>
    </div>
  );
}