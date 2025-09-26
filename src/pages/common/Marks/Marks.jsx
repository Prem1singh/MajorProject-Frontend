// src/pages/marks/Marks.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";

// Teacher Components
import MarkMarks from "./Teacher/MarkMarks";
import UpdateMarks from "./Teacher/UpdateMarks";
import DeleteMarks from "./Teacher/DeleteMarks";

// Shared / Student Components
import ViewMarks from "./Shared/ViewMarks";
import StudentMarks from "./Student/StudentMarks";

export default function Marks() {
  const user = useSelector((state) => state.user.data);

  // If user is a student, directly render StudentMarks
  if (user.role === "Student") {
    return <StudentMarks />;
  }

  // Default active tab for teachers
  const [activeTab, setActiveTab] = useState("mark");

  const teacherOptions = [
    { key: "mark", label: "Mark Marks", component: <MarkMarks /> },
    { key: "all", label: "View All Marks", component: <ViewMarks /> },
    { key: "update", label: "Update Marks", component: <UpdateMarks /> },
    { key: "delete", label: "Delete Marks", component: <DeleteMarks /> },
  ];

  const renderContent = () => {
    const selected = teacherOptions.find((opt) => opt.key === activeTab);
    return selected ? selected.component : (
      <div className="text-gray-500">Please select a marks option.</div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar / Tabs */}
      <aside className="bg-gray-100 border-b md:border-b-0 md:border-r p-4 md:min-w-[220px] flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4 md:mb-6 md:hidden">Marks Options</h2>
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
