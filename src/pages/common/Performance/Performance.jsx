import React, { useState } from "react";
import { useSelector } from "react-redux";

// Student Component
import StudentPerformance from "./Student/StudentPerformance.jsx";

// Teacher Components
import SubjectPerformance from "./Teacher/SubjectPerformance.jsx";
// import BatchComparison from "./Teacher/BatchComparison.jsx";

// Department Admin Components
// import DepartmentPerformance from "./Department/DepartmentPerformance.jsx";
import BatchPerformance from "./Department/BatchPerformance.jsx";

export default function Performance() {
  const user = useSelector((state) => state.user.data);

  // 1️⃣ Student role → directly show their performance
  if (user.role === "Student") {
    return <StudentPerformance />;
  }

  // 2️⃣ Teacher role → options for analyzing their subjects/batches
  if (user.role === "Teacher") {
    const [activeTab, setActiveTab] = useState("subject");

    const teacherOptions = [
      { key: "subject", label: "Subject Performance", component: <SubjectPerformance /> },
      // { key: "batch", label: "Batch Comparison", component: <BatchComparison /> },
    ];

    const renderContent = () => {
      const selected = teacherOptions.find((opt) => opt.key === activeTab);
      return selected ? selected.component : <div className="text-gray-500">Please select a performance option.</div>;
    };

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Sidebar / Tabs */}
        <aside className="md:min-w-[220px] bg-gray-100 p-4 border-b md:border-b-0 md:border-r flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4 md:mb-6 md:hidden">Performance Options</h2>
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

  // 3️⃣ Department Admin role → options for department-wide analysis
  if (user.role === "DepartmentAdmin") {
    const [activeTab, setActiveTab] = useState("batch");

    const adminOptions = [
      { key: "batch", label: "Batch Performance", component: <BatchPerformance /> },
      // { key: "department", label: "Department Performance", component: <DepartmentPerformance /> },
    ];

    const renderContent = () => {
      const selected = adminOptions.find((opt) => opt.key === activeTab);
      return selected ? selected.component : <div className="text-gray-500">Please select a performance option.</div>;
    };

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Sidebar / Tabs */}
        <aside className="md:min-w-[220px] bg-gray-100 p-4 border-b md:border-b-0 md:border-r flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4 md:mb-6 md:hidden">Performance Options</h2>
          <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto">
            {adminOptions.map((opt) => (
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

  return <div className="p-6">Unauthorized Role</div>;
}
