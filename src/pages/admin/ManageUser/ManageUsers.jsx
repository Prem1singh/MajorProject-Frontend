import React, { useState } from "react";
import ManageStudents from "./ManageStudents";
import ManageTeachers from "./ManageTeachers";
import ManageDeptAdmins from "./ManageDeptAdmins";

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState("students");

  const adminOptions = [
    { key: "students", label: "Students" },
    { key: "teachers", label: "Teachers" },
    { key: "deptAdmins", label: "Dept Admins" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "students":
        return <ManageStudents />;
      case "teachers":
        return <ManageTeachers />;
      case "deptAdmins":
        return <ManageDeptAdmins />;
      default:
        return <div className="text-gray-500">Please select an option.</div>;
    }
  };

  return (
    <div className="flex h-[93vh] flex-col lg:flex-row">
      {/* Small screen: Horizontal Top Nav */}
      <div className="lg:hidden sticky top-0 z-20 bg-gray-100 border-b">
        <div className="flex overflow-x-auto no-scrollbar">
          {adminOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveTab(opt.key)}
              className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition 
                ${
                  activeTab === opt.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Large screen: Vertical Sticky Sidebar */}
      <div className="hidden lg:block lg:w-[240px] flex-shrink-0 bg-gray-100 p-4 border-r sticky top-0 h-[93vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">User Management</h2>
        <ul className="space-y-2">
          {adminOptions.map((opt) => (
            <li key={opt.key}>
              <button
                onClick={() => setActiveTab(opt.key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
