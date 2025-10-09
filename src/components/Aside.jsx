import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Aside({ onItemClick }) {
  const user = useSelector((state) => state.user.data);
  const location = useLocation();

  const menus = {
    Admin: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Manage Users", path: "/admin/manageUser" },
      { name: "Departments", path: "/admin/departments" },
    ],
    Teacher: [
      { name: "Dashboard", path: "/teacher/dashboard" },
      { name: "Attendance", path: "/teacher/attendance" },
      { name: "Marks", path: "/teacher/marks" },
      { name: "Assignments", path: "/teacher/assignments" },
      { name: "Announcement", path: "/teacher/announcement" },
      { name: "Study Material", path: "/teacher/study" },
      { name: "Performance", path: "/teacher/performance" },
    ],
    DepartmentAdmin: [
      { name: "Dashboard", path: "/department/dashboard" },
      { name: "Teachers", path: "/department/teachers" },
      { name: "Students", path: "/department/students" },
      { name: "Subjects", path: "/department/subjects" },
      { name: "Courses", path: "/department/courses" },
      { name: "Batches", path: "/department/batches" },
      { name: "Exams", path: "/department/exams" },
      { name: "Marks", path: "/department/marks" },
      { name: "Placement", path: "/department/placement" },
      { name: "Performance", path: "/department/performance" },
    ],
    Student: [
      { name: "Dashboard", path: "/student/dashboard" },
      { name: "My Assignments", path: "/student/assignments" },
      { name: "Attendance", path: "/student/attendance" },
      { name: "Marks", path: "/student/marks" },
      { name: "Announcement", path: "/student/announcement" },
      { name: "Study Material", path: "/student/study" },
      { name: "Doubts", path: "/student/doubt" },
      { name: "Placement", path: "/student/placement" },
      { name: "Performance", path: "/student/performance" },
    ],
  };

  const roleMenus = menus[user?.role] || [];

  return (
    <aside className="h-full flex flex-col bg-gray-800 text-white">
      {/* Header */}
      <div className="px-6 py-6 pt-9 text-xl font-bold border-b border-gray-700">
        {user?.role || "Guest"}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {roleMenus.map((menu, idx) => {
            const isActive = location.pathname === menu.path;
            return (
              <li key={idx}>
                <Link
                  to={menu.path}
                  onClick={() => {
                    // Close sidebar on small devices
                    if (onItemClick) onItemClick();
                  }}
                  className={`block px-4 py-2 rounded transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-gray-200"
                  }`}
                >
                  {menu.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
