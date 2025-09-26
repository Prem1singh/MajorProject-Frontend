import React, { useState } from "react";
import ManageStudents from "./ManageStudents";
import ManageTeachers from "./ManageTeachers";
import ManageDeptAdmins from "./ManageDeptAdmins";

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState("students");

  const adminOptions = [
    { key: "students", label: "Manage Students" },
    { key: "teachers", label: "Manage Teachers" },
    { key: "deptAdmins", label: "Manage Department Admins" },
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
        return (
          <div className="text-gray-500">
            Please select an option to manage users.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[93vh]">
      {/* Left Sidebar */}
      <div className="lg:min-w-[240px] w-full lg:w-auto bg-gray-100 p-4 border-b lg:border-b-0 lg:border-r">
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

      {/* Right Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">{renderContent()}</div>
    </div>
  );
}
