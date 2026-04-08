import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FiGrid, FiUsers, FiBook, FiCheckSquare, FiFileText, 
  FiBell, FiBookOpen, FiTrendingUp, FiLayers, FiAward, 
  FiBriefcase, FiHelpCircle, FiClipboard, FiMapPin
} from "react-icons/fi";

export default function Aside({ onItemClick }) {
  const user = useSelector((state) => state.user.data);
  const location = useLocation();

  const menus = {
    Admin: [
      { name: "Dashboard", path: "/admin/dashboard", icon: <FiGrid /> },
      { name: "Manage Users", path: "/admin/manageUser", icon: <FiUsers /> },
      { name: "Departments", path: "/admin/departments", icon: <FiLayers /> },
      { name: "Attendance", path: "/admin/Attendance", icon: <FiCheckSquare /> },
      
    ],
    Teacher: [
      { name: "Dashboard", path: "/teacher/dashboard", icon: <FiGrid /> },
      { name: "Attendance", path: "/teacher/attendance", icon: <FiCheckSquare /> },
      { name: "Marks", path: "/teacher/marks", icon: <FiAward /> },
      { name: "Assignments", path: "/teacher/assignments", icon: <FiFileText /> },
      { name: "Announcement", path: "/teacher/announcement", icon: <FiBell /> },
      { name: "Study Material", path: "/teacher/study", icon: <FiBookOpen /> },
      { name: "Performance", path: "/teacher/performance", icon: <FiTrendingUp /> },
    ],
    DepartmentAdmin: [
      { name: "Dashboard", path: "/department/dashboard", icon: <FiGrid /> },
      { name: "Teachers", path: "/department/teachers", icon: <FiUsers /> },
      { name: "Students", path: "/department/students", icon: <FiUsers /> },
      { name: "Subjects", path: "/department/subjects", icon: <FiBook /> },
      { name: "Courses", path: "/department/courses", icon: <FiLayers /> },
      { name: "Batches", path: "/department/batches", icon: <FiMapPin /> },
      { name: "Exams", path: "/department/exams", icon: <FiClipboard /> },
      { name: "Marks", path: "/department/marks", icon: <FiAward /> },
      { name: "Placement", path: "/department/placement", icon: <FiBriefcase /> },
      { name: "Performance", path: "/department/performance", icon: <FiTrendingUp /> },
      { name: "Attendance", path: "/department/Attendance", icon: <FiCheckSquare /> },
    ],
    Student: [
      { name: "Dashboard", path: "/student/dashboard", icon: <FiGrid /> },
      { name: "My Assignments", path: "/student/assignments", icon: <FiFileText /> },
      { name: "Attendance", path: "/student/attendance", icon: <FiCheckSquare /> },
      { name: "Marks", path: "/student/marks", icon: <FiAward /> },
      { name: "Announcement", path: "/student/announcement", icon: <FiBell /> },
      { name: "Study Material", path: "/student/study", icon: <FiBookOpen /> },
      { name: "Doubts", path: "/student/doubt", icon: <FiHelpCircle /> },
      { name: "Placement", path: "/student/placement", icon: <FiBriefcase /> },
      { name: "Performance", path: "/student/performance", icon: <FiTrendingUp /> },
    ],
  };

  const roleMenus = menus[user?.role] || [];

  return (
    <aside className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header Info */}
      <div className="px-8 py-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-1 italic">Access Level</p>
        <h2 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">
          {user?.role || "Guest"}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar pb-10">
        <ul className="space-y-1.5">
          {roleMenus.map((menu, idx) => {
            const isActive = location.pathname === menu.path;
            return (
              <li key={idx}>
                <Link
                  to={menu.path}
                  onClick={() => {
                    if (onItemClick) onItemClick();
                  }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-x-1"
                      : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {menu.icon}
                  </span>
                  <span className="tracking-tight uppercase text-[12px] font-black italic">
                    {menu.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Decoration */}
      <div className="p-8 border-t border-slate-50">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Stable Session</span>
          </div>
      </div>
    </aside>
  );
}