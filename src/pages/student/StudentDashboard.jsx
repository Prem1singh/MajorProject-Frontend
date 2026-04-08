import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/common/Cards";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import api from "../../utils/axiosInstance";
import { 
  FiBook, FiClock, FiCheckCircle, 
  FiPieChart, FiTrendingUp, FiCalendar, FiActivity 
} from "react-icons/fi";

export default function StudentDashboard() {
  const [overview, setOverview] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignmentsTrend, setAssignmentsTrend] = useState([]);
  const [marksTrend, setMarksTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await api.get("/students/overview");
        const data = res.data;
        setOverview(data.overview || {});
        setAttendanceData(data.attendance || []);
        setAssignmentsTrend(data.assignmentsTrend || []);
        setMarksTrend(data.marksTrend || []);
      } catch (err) {
        console.error("Error fetching student overview", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-emerald-600 font-black italic tracking-widest uppercase text-[10px]">Syncing Profile...</p>
      </div>
    );
  }

  // COLORS for Pie Chart
  const COLORS = ["#10b981", "#f43f5e"]; // Emerald for Present, Rose for Absent

  const statCards = [
    { title: "Subjects", value: overview.subjects, icon: <FiBook />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Pending", value: overview.pendingAssignments, icon: <FiClock />, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Submitted", value: overview.submittedAssignments, icon: <FiCheckCircle />, color: "text-blue-600", bg: "bg-blue-50" },
    { 
      title: "Attendance", 
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
          <h1 className="text-3xl font-black italic text-slate-800 tracking-tight uppercase">My Dashboard</h1>
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.2em] mt-1">Academic Performance & Progress</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <FiCalendar className="text-emerald-600" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-500">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.title}</p>
                <h3 className={`text-2xl font-black italic tracking-tighter ${item.color}`}>{item.value || 0}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                {item.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Attendance Pie Chart */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-2 uppercase tracking-tight mb-8">
            <FiPieChart className="text-emerald-500" /> Attendance Log
          </h3>
          <div className="h-[280px]">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                <p className="text-slate-300 font-bold italic text-sm">No Attendance Logged</p>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Present
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div> Absent
             </div>
          </div>
        </Card>

        {/* Assignments Line Chart */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-2 uppercase tracking-tight mb-8">
            <FiActivity className="text-amber-500" /> Submission Trend
          </h3>
          <div className="h-[280px]">
            {assignmentsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assignmentsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="submitted" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                <p className="text-slate-300 font-bold italic text-sm">No Assignment Activity</p>
              </div>
            )}
          </div>
        </Card>

        {/* Marks Progression Chart */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-2 uppercase tracking-tight mb-8">
            <FiTrendingUp className="text-blue-500" /> Grade Progress
          </h3>
          <div className="h-[280px]">
            {marksTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marksTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="exam" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="step" dataKey="marks" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                <p className="text-slate-300 font-bold italic text-sm">No Examination Records</p>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}