import React, { useState } from "react";
import AddTeacher from "./AddTeacher.jsx";
import ManageTeacher from "./ManageTeacher.jsx";

export default function DeptTeachers() {
  const [activeTab, setActiveTab] = useState("add");

  const teacherOptions = [
    { key: "add", label: "Add Teacher" },
    { key: "manage", label: "Manage Teachers" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "add":
        return <AddTeacher />;
      case "manage":
        return <ManageTeacher />;
      default:
        return <div className="text-gray-500">Select an option from the left menu.</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Sidebar */}
      <div className="min-w-[220px] bg-gray-100 p-4 border-b md:border-b-0 md:border-r min-h-[10vh]">
        <h2 className="text-lg font-semibold mb-4">Teacher Options</h2>
        <ul className="space-y-2">
          {teacherOptions.map((opt) => (
            <li key={opt.key}>
              <button
                onClick={() => setActiveTab(opt.key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === opt.key
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-white hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">{renderContent()}</div>
    </div>
  );
}
