import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/common/Cards";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import api from "../../utils/axiosInstance";
import { FiLayers, FiBookOpen, FiUsers, FiUserCheck, FiActivity, FiTrendingUp } from "react-icons/fi";

export default function AdminDashboard() {
  const [overview, setOverview] = useState({});
  const [studentsPerDept, setStudentsPerDept] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/overview");

        const mappedStudents = (res.data.studentsPerDept || [])
          .map((item) => ({
            department: item.department || item.name || "Unknown",
            students: item.students || item.count || 0,
          }))
          .sort((a, b) => b.students - a.students)
          .slice(0, 10);

        setOverview(res.data.overview || {});
        setStudentsPerDept(mappedStudents);
      } catch (err) {
        console.error("Error fetching admin overview", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-emerald-600 font-black italic tracking-widest uppercase text-[10px]">Loading Master Console...</p>
      </div>
    );
  }

  const stats = [
    { title: "Departments", value: overview.departments, icon: <FiLayers />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Total Courses", value: overview.courses, icon: <FiBookOpen />, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Students", value: overview.students, icon: <FiUsers />, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Faculty", value: overview.teachers, icon: <FiUserCheck />, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="p-4 md:p-10 space-y-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-xl md:text-3xl font-black italic text-slate-800 tracking-tight uppercase">Admin Console</h1>
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mt-1 italic">University-wide System Overview</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <FiActivity className="text-emerald-600 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">System Health: Optimal</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-xl hover:shadow-emerald-100/40 transition-all duration-500">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.title}</p>
                <h3 className={`text-xl md:text-3xl font-black italic tracking-tighter ${item.color}`}>{item.value || 0}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                {React.cloneElement(item.icon, { size: 24 })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
        <div className="flex items-center justify-between mb-10 px-2">
            <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                <FiTrendingUp className="text-emerald-500" /> Department Distribution
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">Top 10 Data Points</span>
        </div>

        {studentsPerDept.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsPerDept} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="department" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                    interval={0}
                    angle={-15}
                    dx={-5}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }} 
                />
                <Bar dataKey="students" radius={[12, 12, 0, 0]} barSize={45}>
                  {studentsPerDept.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#059669"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[2rem]">
            <p className="text-slate-300 font-bold italic">No Departmental Data Collected</p>
          </div>
        )}
      </Card>

      
    </div>
  );
}