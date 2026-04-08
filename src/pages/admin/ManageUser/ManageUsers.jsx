import React, { useState } from "react";
import ManageStudents from "./ManageStudents";
import ManageTeachers from "./ManageTeachers";
import ManageDeptAdmins from "./ManageDeptAdmins";
import { FiUsers, FiBriefcase, FiShield, FiUserPlus } from "react-icons/fi";

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState("students");

  const adminOptions = [
    { key: "students", label: "Students Directory", icon: <FiUsers /> },
    { key: "teachers", label: "Faculty Records", icon: <FiBriefcase /> },
    { key: "deptAdmins", label: "Dept Administrators", icon: <FiShield /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "students": return <ManageStudents />;
      case "teachers": return <ManageTeachers />;
      case "deptAdmins": return <ManageDeptAdmins />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] animate-in fade-in duration-700">
      
      {/* --- TOP CONTROL PANEL --- */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black italic text-slate-800 tracking-tighter uppercase leading-none">
              User Management
            </h2>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
              Centralized Control Center / {activeTab}
            </p>
          </div>
          

         
        </div>

        {/* --- HORIZONTAL GLASS TABS (Replacing 2nd Sidebar) --- */}
        <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-emerald-50 shadow-sm flex flex-wrap gap-2">
          {adminOptions.map((opt) => {
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
                <span className={`text-lg ${isActive ? "text-white" : "text-emerald-500"}`}>
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-emerald-100/20 border border-emerald-50 p-6 lg:p-12 min-h-[600px] relative overflow-hidden transition-all duration-500">
        
        {/* Subtle Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10 animate-in slide-in-from-bottom-6 duration-700">
           {renderContent()}
        </div>

        {/* Action Status Footer */}
        <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center opacity-30">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Security Layer: Active</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Syncing with CUH Database</span>
        </div>
      </div>
    </div>
  );
}