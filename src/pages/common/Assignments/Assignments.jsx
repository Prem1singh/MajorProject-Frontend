// src/pages/assignments/Assignments.jsx
import { useSelector } from "react-redux";
import React from "react";
// import CreateAssignment from "./Teacher/CreateAssignment";
import ManageAssignments from "./Teacher/ManageAssignments";
// import ViewSubmissions from "./Teacher/ViewSubmissions";
import StudentAssignments from "./Student/StudentAssignments";

export default function Assignments() {
  const user = useSelector((state) => state.user.data);

  // If student, directly show StudentAssignments
  if (user.role === "Student") {
    return <StudentAssignments />;
  }

  // Teacher merged view
  return (    
        <ManageAssignments />
  );
}
