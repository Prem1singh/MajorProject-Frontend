// src/pages/performance/Performance.jsx
import React from "react";
import { useSelector } from "react-redux";

// Student Component
import StudentPerformance from "./Student/StudentPerformance.jsx";

// Teacher Components
import SubjectPerformance from "./Teacher/SubjectPerformance.jsx";

// Department Admin Components
import BatchPerformance from "./Department/BatchPerformance.jsx";

export default function Performance() {
  const user = useSelector((state) => state.user.data);

  // Render component based on role
  switch (user.role) {
    case "Student":
      return <StudentPerformance />;

    case "Teacher":
      return <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <SubjectPerformance />
        </div>
      </div>;

    case "DepartmentAdmin":
      return <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <BatchPerformance />
        </div>
      </div>;

    default:
      return <div className="p-6 text-gray-700">Unauthorized Role</div>;
  }
}
