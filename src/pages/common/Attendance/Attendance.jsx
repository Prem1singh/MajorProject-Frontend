import React, { useState } from "react";
import { useSelector } from "react-redux";

// Teacher Components
import MarkAttendance from "./Teacher/MarkAttendance"; 
import DeleteAttendance from "./Teacher/DeleteAttendance";
import ViewAttendance from "./Shared/ViewAttendance";

// Student Component
import StudentAttendance from "./Student/StudentAttendance";

// Icons
import { FiCheckSquare, FiEye, FiTrash2, FiCalendar, FiActivity } from "react-icons/fi";

export default function Attendance() {
  const user = useSelector((state) => state.user.data);

  // 1. Student Redirect (As it is)
  if (user?.role === "Student") {
    return <StudentAttendance />;
  }

  // 2. Teacher/Admin Tabs State
  const [activeTab, setActiveTab] = useState("manage");

  const teacherOptions = [
    { 
      key: "manage", 
      label: "Daily Roll Call", 
      icon: <FiCheckSquare />, 
      component: <MarkAttendance /> 
    },
    { 
      key: "all", 
      label: "History Logs", 
      icon: <FiEye />, 
      component: <ViewAttendance /> 
    },
    { 
      key: "delete", 
      label: "Cleanup Records", 
      icon: <FiTrash2 />, 
      component: <DeleteAttendance /> 
    },
  ];

  const activeComponent = teacherOptions.find((opt) => opt.key === activeTab)?.component;

  return (
    <div className="min-h-screen bg-[#f8fafc] animate-in fade-in duration-700">
      
      {/* --- TOP CONTROL PANEL --- */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none flex items-center gap-3">
              <FiCalendar className="text-emerald-500" /> Attendance Center
            </h2>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic ml-1">
              Centralized Academic Registry / {activeTab}
            </p>
          </div>

          {/* Quick Status Badge */}
          <div className="hidden md:flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-emerald-50 shadow-sm">
             <FiActivity className="text-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Sync Active</span>
          </div>
        </div>

        {/* --- HORIZONTAL GLASS TABS (No more sidebar) --- */}
        <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-emerald-50 shadow-sm flex flex-wrap gap-2">
          {teacherOptions.map((opt) => {
            const isActive = activeTab === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setActiveTab(opt.key)}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-3 px-6 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500
                  ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-y-[-2px]"
                      : "text-slate-400 hover:bg-white hover:text-emerald-600"
                  }`}
              >
                <span className={`text-lg transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- CONTENT AREA (Large Card) --- */}
      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-emerald-100/20 border border-emerald-50 p-6 lg:p-12 min-h-[600px] relative overflow-hidden transition-all duration-500">
        
        {/* Decorative Blur Circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/40 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50/30 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10 animate-in slide-in-from-bottom-6 duration-700">
           {activeComponent}
        </div>

        {/* Footer Logic Status */}
        <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-center md:text-left">
              Secure Attendance Protocol: 2.1-SR
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-center md:text-right">
              Institutional Records • CUH Haryana
            </span>
        </div>
      </div>
    </div>
  );
}