// src/pages/attendance/Teacher/DeleteAttendance.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function DeleteAttendance() {
  const user = useSelector((state) => state.user.data);

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch subjects assigned to the teacher
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err.response?.data || err.message);
        setSubjectsForTeacher([]);
      }
    };
    fetchSubjects();
  }, []);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!subject || !date) {
      alert("Please select subject and date.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this attendance?")) return;

    setLoading(true);
    try {
      const res = await api.delete(`/attendance?subject=${subject}&date=${date}`);
      alert(res.data.message || "Attendance deleted successfully!");
      setSubject("");
      setDate("");
    } catch (err) {
      console.error("Error deleting attendance:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6">🗑️ Delete Attendance</h2>
      <form onSubmit={handleDelete} className="flex flex-col space-y-4">
        {/* Subject Dropdown */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        >
          <option value="">Select Subject</option>
          {subjectsForTeacher.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>

        {/* Date Picker */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        {/* Delete Button */}
        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded-lg text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Deleting..." : "Delete Attendance"}
        </button>
      </form>
    </div>
  );
}
