import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/common/Cards";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import api from "../../utils/axiosInstance";
import { 
  FiBookOpen, FiUsers, FiFileText, 
  FiCheckCircle, FiCalendar, FiActivity, FiArrowRight 
} from "react-icons/fi";

export default function TeacherDashboard() {
  const [overview, setOverview] = useState({});
  const [studentsPerSubject, setStudentsPerSubject] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/teachers/overview");
        const data = res.data;
        setOverview(data.overview || {});
        setStudentsPerSubject(data.studentsPerSubject || []);
      } catch (err) {
        console.error("Error fetching teacher overview", err);
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
        <p className="mt-4 text-emerald-600 font-black italic tracking-widest uppercase text-[10px]">Syncing Faculty Data...</p>
      </div>
    );
  }

  const statCards = [
    { title: "My Subjects", value: overview.subjects, icon: <FiBookOpen />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Total Students", value: overview.totalStudents, icon: <FiUsers />, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Assignments", value: overview.assignments, icon: <FiFileText />, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Submissions", value: overview.submittedAssignments, icon: <FiCheckCircle />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { 
      title: "Today's Attendance", 
      value: `${overview.attendancePresent || 0}/${overview.attendanceTotal || 0}`, 
      icon: <FiActivity />, 
      color: "text-rose-600", 
      bg: "bg-rose-50" 
    },
  ];

  return (
    <div className="p-4 md:p-10 space-y-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black italic text-slate-800 tracking-tight uppercase">Teacher Portal</h1>
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mt-1 italic">Academic Control & Insights</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <FiCalendar className="text-emerald-600" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Session: {new Date().getFullYear()} - {new Date().getFullYear() + 1}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-xl hover:shadow-emerald-100/40 transition-all duration-500">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`p-4 rounded-2xl ${item.bg} ${item.color} mb-4 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                {item.icon}
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.title}</p>
              <h3 className={`text-xl md:text-2xl font-black italic tracking-tighter ${item.color}`}>{item.value || 0}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Enrollment Bar Chart */}
        <Card className="xl:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-2 uppercase tracking-tight mb-8">
            <FiActivity className="text-emerald-500" /> Students per Subject
          </h3>
          <div className="h-[350px]">
            {studentsPerSubject.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsPerSubject} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="students" radius={[10, 10, 0, 0]} barSize={45}>
                    {studentsPerSubject.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#059669"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                <p className="text-slate-300 font-bold italic">No Subject Data Found</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Assignments Sidebar */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <FiFileText className="text-emerald-500" /> Recent Postings
            </h3>
          </div>
          {(overview.recentAssignments || []).length > 0 ? (
            <div className="space-y-4">
              {overview.recentAssignments.map((a) => (
                <div
                  key={a._id}
                  className="group p-4 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-emerald-100 hover:bg-emerald-50/50 transition-all duration-300 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-700 truncate group-hover:text-emerald-700 transition-colors">
                      {a.title}
                    </span>
                    <FiArrowRight className="text-slate-300 group-hover:text-emerald-500 transition-all transform group-hover:translate-x-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[9px] font-black text-slate-400 uppercase">
                      Due: {new Date(a.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <FiFileText className="text-slate-100 text-6xl mb-4" />
              <p className="text-slate-400 font-bold italic text-sm">No recent uploads</p>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}