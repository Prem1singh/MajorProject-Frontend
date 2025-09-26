// src/pages/attendance/Student/StudentAttendance.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./attendanceCalendar.css"; // your custom CSS for tile colors

export default function StudentAttendance() {
  const user = useSelector((state) => state.user.data);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [records, setRecords] = useState([]);
  const [overallPercentage, setOverallPercentage] = useState(null);
  const [subjectPercentage, setSubjectPercentage] = useState(null);

  // Fetch subjects and overall attendance
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user?.batch || !user?.semester) return;
      try {
        const res = await api.get(`/batches/${user.batch}/subjects`);
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err.response?.data || err.message);
      }
    };

    const fetchOverall = async () => {
      try {
        const res = await api.get("/attendance/student/overall");
        setOverallPercentage(res.data.percentage ?? 0);
      } catch (err) {
        console.error("Error fetching overall attendance:", err.response?.data || err.message);
      }
    };

    fetchSubjects();
    fetchOverall();
  }, [user]);

  // Fetch attendance for selected subject
  useEffect(() => {
    if (!selectedSubject) {
      setRecords([]);
      setSubjectPercentage(null);
      return;
    }

    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance/student", {
          params: { subjectId: selectedSubject },
        });

        const allRecords = res.data.records.map((rec) => ({
          date: new Date(rec.date),
          status: rec.status?.toLowerCase() || "unknown",
        }));
        setRecords(allRecords);

        // Calculate subject percentage
        const presentCount = allRecords.filter((r) => r.status === "present").length;
        const percentage = allRecords.length > 0 ? ((presentCount / allRecords.length) * 100).toFixed(1) : 0;
        setSubjectPercentage(percentage);
      } catch (err) {
        console.error("Error fetching subject attendance:", err.response?.data || err.message);
        setRecords([]);
        setSubjectPercentage(null);
      }
    };

    fetchAttendance();
  }, [selectedSubject]);

  // Determine tile class for calendar
  const tileClassName = ({ date }) => {
    const record = records.find((r) => r.date.toDateString() === date.toDateString());
    if (!record) return "";
    if (record.status === "present") return "present-day";
    if (record.status === "absent") return "absent-day";
    return "";
  };

  return (
    <div className="max-w-full sm:max-w-3xl md:max-w-5xl mx-auto p-4 sm:p-6 space-y-6 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">📊 My Attendance</h2>

      {/* Overall Attendance */}
      <div className="p-4 bg-white rounded-lg shadow text-center">
        <h3 className="text-lg sm:text-xl font-semibold">Overall Attendance</h3>
        <p className="text-2xl sm:text-3xl font-bold">{overallPercentage !== null ? `${overallPercentage}%` : "N/A"}</p>
      </div>

      {/* Subject Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <label className="font-medium w-full sm:w-auto">Select Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full sm:w-64 border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">-- Choose a subject --</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Attendance Percentage */}
      {selectedSubject && (
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <h3 className="text-lg sm:text-xl font-semibold">
            {subjects.find((s) => s._id === selectedSubject)?.name} Attendance
          </h3>
          <p className="text-xl sm:text-2xl font-bold">{subjectPercentage !== null ? `${subjectPercentage}%` : "N/A"}</p>
        </div>
      )}

      {/* Calendar View */}
      {selectedSubject && (
        <div className="p-4 bg-white rounded-lg shadow overflow-x-auto">
          <Calendar
            tileClassName={tileClassName}
            className="w-full sm:w-auto"
          />
        </div>
      )}
    </div>
  );
}
