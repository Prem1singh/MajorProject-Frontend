import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/common/Cards";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import api from "../../utils/axiosInstance";
import { FiUsers, FiBookOpen, FiUserCheck, FiTrendingUp, FiActivity } from "react-icons/fi";

export default function DepartmentAdminDashboard() {
  const [overview, setOverview] = useState({});
  const [studentsPerCourse, setStudentsPerCourse] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/departmentAdmin/overview");
        setOverview(res.data.overview || {});
        setStudentsPerCourse(res.data.studentsPerCourse || []);
        setRecentTeachers(res.data.recentTeachers || []);
      } catch (err) {
        console.error("Error fetching department admin overview", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-emerald-600 font-black italic tracking-widest uppercase text-xs">Loading Analytics...</p>
      </div>
    );
  }

  // Stats Data Array for cleaner mapping
  const stats = [
    { title: "Total Courses", value: overview.courses, icon: <FiBookOpen />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Active Students", value: overview.students, icon: <FiUsers />, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Department Faculty", value: overview.teachers, icon: <FiUserCheck />, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Avg. Performance", value: "84%", icon: <FiTrendingUp />, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="p-4 md:p-10 space-y-10 bg-[#f8fafc] min-h-screen font-sans animate-in fade-in duration-700">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black italic text-slate-800 tracking-tight uppercase">Dept. Analytics</h1>
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mt-1">Real-time Departmental Overview</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Live</span>
        </div>
      </div>

      {/* Header Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500 bg-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${item.bg} ${item.color} transition-transform group-hover:scale-110 duration-500`}>
                  {React.cloneElement(item.icon, { size: 24 })}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.title}</p>
                  <h3 className={`text-xl md:text-3xl font-black italic tracking-tighter ${item.color}`}>{item.value || 0}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Students per Course Chart */}
        <Card className="xl:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <FiActivity className="text-emerald-500" /> Enrollment Distribution
            </h3>
          </div>
          
          {studentsPerCourse.length > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsPerCourse} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="course" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="students" radius={[10, 10, 0, 0]} barSize={40}>
                    {studentsPerCourse.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#059669"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem]">
               <p className="text-slate-400 font-bold italic">Insufficient data for visualization</p>
            </div>
          )}
        </Card>

        {/* Recently Added Teachers */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-2 uppercase tracking-tight mb-8">
            <FiUserCheck className="text-emerald-500" /> Latest Faculty
          </h3>
          {recentTeachers.length > 0 ? (
            <div className="space-y-4">
              {recentTeachers.map((teacher, idx) => (
                <div
                  key={teacher._id}
                  className="group p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-emerald-100 hover:bg-emerald-50/50 transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {teacher.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-700 group-hover:text-emerald-700 transition-colors">{teacher.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Department Faculty</p>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 mt-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                View All Directory
              </button>
            </div>
          ) : (
            <div className="py-20 text-center">
              <FiUsers className="mx-auto text-slate-200 text-5xl mb-4" />
              <p className="text-slate-400 font-bold italic">No recent faculty updates</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}