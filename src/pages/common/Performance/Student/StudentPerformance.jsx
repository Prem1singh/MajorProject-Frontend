import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import api from "../../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { FiAward, FiTrendingUp, FiTarget, FiZap, FiActivity, FiUser } from "react-icons/fi";

export default function StudentPerformance() {
  const user = useSelector((state) => state.user.data);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get("/performance/student");
        setPerformance(res.data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  // 1️⃣ Global Insights (Total Career Score)
  const insights = useMemo(() => {
    if (!performance || !performance.marksTrend?.length) {
      return { scoreDisplay: "0/0", percentage: "0", totalSubjects: 0 };
    }

    const data = performance.marksTrend;
    const totalObtained = data.reduce((sum, item) => sum + (item.obtained || 0), 0);
    const totalPossible = data.reduce((sum, item) => sum + (item.totalMarks || 100), 0);
    const percentage = totalPossible > 0 ? ((totalObtained / totalPossible) * 100).toFixed(1) : "0";

    return {
      scoreDisplay: `${totalObtained} / ${totalPossible}`,
      percentage,
      totalSubjects: data.length
    };
  }, [performance]);

  // 2️⃣ Chart Data Logic (Grouping subjects into Exam-wise averages)
  const chartData = useMemo(() => {
    if (!performance || !performance.marksTrend) return [];

    // Grouping by Exam Name
    const examGroups = performance.marksTrend.reduce((acc, item) => {
      if (!acc[item.exam]) {
        acc[item.exam] = { exam: item.exam, totalObtained: 0, totalPossible: 0 };
      }
      acc[item.exam].totalObtained += item.obtained;
      acc[item.exam].totalPossible += item.totalMarks;
      return acc;
    }, {});

    // Mapping for AreaChart (Percentage format)
    return Object.values(examGroups).map(group => ({
      exam: group.exam,
      percentage: ((group.totalObtained / group.totalPossible) * 100).toFixed(1)
    }));
  }, [performance]);

  // 3️⃣ Batch Comparison Logic (Percentage format)
  const comparisonData = useMemo(() => {
    if (!performance || !performance.batchComparison) return [];

    // Grouping batch data by Exam Name
    const groups = performance.batchComparison.reduce((acc, item) => {
      if (!acc[item.exam]) {
        acc[item.exam] = { exam: item.exam, myObs: 0, myTotal: 0, batchAvg: 0, count: 0 };
      }
      acc[item.exam].myObs += item.myObtained;
      acc[item.exam].myTotal += item.myTotal;
      acc[item.exam].batchAvg += parseFloat(item.batchAvgObtained);
      acc[item.exam].count += 1;
      return acc;
    }, {});

    return Object.values(groups).map(g => ({
      exam: g.exam,
      myScore: ((g.myObs / g.myTotal) * 100).toFixed(1),
      // Batch ka average marks ko unke total se % mein convert kar rahe hain
      batchScore: (( (g.batchAvg / g.count) / (g.myTotal / g.count) ) * 100).toFixed(1)
    }));
  }, [performance]);

  if (loading) return <div className="p-20 text-center animate-pulse text-emerald-600 font-bold">Loading Analysis...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl md:text-xl md:text-3xl font-black text-slate-800 tracking-tight italic">My Performance</h2>
          <p className="text-slate-500 font-medium">Academic breakdown for {user?.name}</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<FiAward />} label="Total Marks" value={insights.scoreDisplay} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={<FiTarget />} label="Overall %" value={`${insights.percentage}%`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={<FiActivity />} label="Subjects" value={insights.totalSubjects} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={<FiZap />} label="Latest Status" value={parseFloat(insights.percentage) > 33 ? "Qualified" : "Critical"} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Area Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
            <FiTrendingUp className="text-emerald-500" /> Exam-wise Progression (%)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="exam" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={4} fill="url(#colorMarks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Bar Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
            <FiTarget className="text-emerald-500" /> Peer Comparison (%)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="exam" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="myScore" fill="#10b981" radius={[6, 6, 0, 0]} name="My Score %" />
                <Bar dataKey="batchScore" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Class Avg %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}