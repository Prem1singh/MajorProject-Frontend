// src/pages/department/DeptSubjects.jsx
import React, { useState } from "react";
import AddSubject from "./AddSubject.jsx";
import ManageSubjects from "./ManageSubject.jsx";

export default function DeptSubjects() {
  const [activeTab, setActiveTab] = useState("add");

  const subjectOptions = [
    { key: "add", label: "Add Subject" },
    { key: "manage", label: "Manage Subjects" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "add":
        return <AddSubject />;
      case "manage":
        return <ManageSubjects />;
      default:
        return (
          <div className="text-gray-500">
            Select an option from the menu.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen">
      {/* Sidebar */}
      <aside className="lg:w-[220px] w-full lg:h-screen bg-gray-100 p-4 border-b lg:border-b-0 lg:border-r">
        <h2 className="text-lg font-semibold mb-4">Subject Options</h2>
        <ul className="space-y-2">
          {subjectOptions.map((opt) => (
            <li key={opt.key}>
              <button
                onClick={() => setActiveTab(opt.key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
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
      </aside>

      {/* Right Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {/* Optional dynamic title */}
        <h2 className="text-2xl font-semibold mb-6">
          {subjectOptions.find((opt) => opt.key === activeTab)?.label}
        </h2>
        {renderContent()}
      </main>
    </div>
  );
}
