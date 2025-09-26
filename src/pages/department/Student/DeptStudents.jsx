import React, { useState } from "react";

// Import your CRUD components
import AddStudent from "./AddStudent.jsx";
import ManageStudent from "./ManageStudent.jsx";

export default function DeptStudents() {
  const [activeTab, setActiveTab] = useState("add");

  const studentOptions = [
    { key: "add", label: "Add Student" },
    { key: "manage", label: "Manage Students" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "add":
        return <AddStudent />;
      case "manage":
        return <ManageStudent />;
      default:
        return <div className="text-gray-500">Select an option from the menu.</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[93vh] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-[220px] bg-gray-100 p-4 border-b md:border-b-0 md:border-r">
        <h2 className="text-lg font-semibold mb-4">Student Options</h2>
        <ul className="space-y-2">
          {studentOptions.map((opt) => (
            <li key={opt.key}>
              <button
                onClick={() => setActiveTab(opt.key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === opt.key
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right content */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
}
