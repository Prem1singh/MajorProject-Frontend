// src/pages/studyMaterial/StudyMaterial.jsx
import React from "react";
import { useSelector } from "react-redux";

// Teacher Components
import ViewTeacherMaterials from "./Teacher/ViewTeacherMaterials.jsx";

// Student Components
import ViewStudentMaterials from "./Student/ViewStudentMaterials.jsx";

export default function StudyMaterial() {
  const user = useSelector((state) => state.user.data);

  // Student view
  if (user.role === "Student") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <ViewStudentMaterials />
        </div>
      </div>
    );
  }

  // Teacher view
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <ViewTeacherMaterials />
      </div>
    </div>
  );
}
