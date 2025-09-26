// src/pages/assignments/Assignments.jsx
import { useSelector } from "react-redux";
import React, { useState } from "react";
import CreateAssignment from "./Teacher/CreateAssignment";
import ManageAssignments from "./Teacher/ManageAssignments";
import ViewSubmissions from "./Teacher/ViewSubmissions";
import StudentAssignments from "./Student/StudentAssignments";

export default function Assignments() {
  const user = useSelector((state) => state.user.data);

  // If student, directly show StudentAssignments
  if (user.role === "Student") {
    return <StudentAssignments />;
  }

  // Default tab for teachers
  const [activeTab, setActiveTab] = useState("create");

  const teacherOptions = [
    { key: "create", label: "Create Assignment", component: <CreateAssignment /> },
    { key: "manage", label: "Manage Assignment", component: <ManageAssignments /> },
    { key: "submissions", label: "View Student Submissions", component: <ViewSubmissions /> },
  ];

  const renderContent = () => {
    const selected = teacherOptions.find((opt) => opt.key === activeTab);
    return selected ? selected.component : <div className="text-gray-500">Please select an option.</div>;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="md:min-w-[220px] bg-gray-100 p-4 border-b md:border-b-0 md:border-r flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4 md:mb-6 md:hidden">Assignment Options</h2>
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
