// src/pages/announcements/Announcements.jsx
import React from "react";
import { useSelector } from "react-redux";

// Teacher / Student Components
import ViewAnnouncements from "./Teacher/ViewAnnouncements.jsx";
import StudentAnnouncements from "./Student/StudentAnnouncements.jsx";

export default function Announcements() {
  const user = useSelector((state) => state.user.data);

  // If user is a student, show only student view
  if (user.role === "Student") {
    return <StudentAnnouncements />;
  }

  // If user is a teacher, show view announcements only
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <ViewAnnouncements />
        </div>
      </main>
    </div>
  );
}
