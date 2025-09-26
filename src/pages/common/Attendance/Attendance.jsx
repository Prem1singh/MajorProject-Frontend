// src/pages/attendance/Attendance.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";

// Teacher Components
import MarkAttendance from "./Teacher/MarkAttendance";
import UpdateAttendance from "./Teacher/UpdateAttendance";
import DeleteAttendance from "./Teacher/DeleteAttendance";
import ViewAttendance from "./Shared/ViewAttendance";

// Student Component
import StudentAttendance from "./Student/StudentAttendance";

export default function Attendance() {
  const user = useSelector((state) => state.user.data);

  // Directly show student attendance if role is Student
  if (user.role === "Student") {
    return <StudentAttendance />;
  }

  // Default active tab for teachers
  const [activeTab, setActiveTab] = useState("mark");

  const teacherOptions = [
    { key: "mark", label: "Mark Attendance", component: <MarkAttendance /> },
    { key: "all", label: "View All Attendance", component: <ViewAttendance /> },
    { key: "update", label: "Update Attendance", component: <UpdateAttendance /> },
    { key: "delete", label: "Delete Attendance", component: <DeleteAttendance /> },
  ];

  const renderContent = () => {
    const selected = teacherOptions.find((opt) => opt.key === activeTab);
    return selected ? selected.component : <div className="text-gray-500">Please select an attendance option.</div>;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar / Tabs */}
      <aside className="md:min-w-[220px] bg-gray-100 p-4 border-b md:border-b-0 md:border-r flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4 md:mb-6 md:hidden">Attendance Options</h2>
        <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto">
          {teacherOptions.map((opt) => (
            <li key={opt.key}>
              <button
                onClick={() => setActiveTab(opt.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap w-full text-left transition font-medium text-sm md:text-base ${
                  activeTab === opt.key
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}
