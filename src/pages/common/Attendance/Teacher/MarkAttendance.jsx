// src/pages/attendance/Teacher/MarkAttendance.jsx
import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";

export default function MarkAttendance() {
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch subjects assigned to the logged-in teacher
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching teacher subjects:", err.response?.data || err.message);
        setSubjectsForTeacher([]);
      }
    };

    fetchSubjects();
  }, []);

  // Fetch students when a subject is selected
  useEffect(() => {
    if (!subject) {
      setStudents([]);
      setAttendanceMap({});
      return;
    }

    const fetchStudents = async () => {
      try {
        const res = await api.get(`/teachers/subjects/${subject}/students`);
        setStudents(res.data.students || []);

        const map = {};
        (res.data.students || []).forEach((s) => (map[s._id] = "absent"));
        setAttendanceMap(map);
      } catch (err) {
        console.error("Error fetching students:", err.response?.data || err.message);
        setStudents([]);
        setAttendanceMap({});
      }
    };

    fetchStudents();
  }, [subject]);

  const toggleAttendance = (id) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject || !date) {
      alert("Please select subject and date");
      return;
    }

    if (students.length === 0) {
      alert("No students found for this subject");
      return;
    }

    const records = students.map((s) => ({
      student: s._id,
      subject,
      date,
      status: attendanceMap[s._id],
    }));

    setLoading(true);
    try {
      await api.post("/attendance", { records });
      alert("Attendance marked successfully!");
      setSubject("");
      setDate("");
      setStudents([]);
      setAttendanceMap({});
    } catch (err) {
      console.error("Error marking attendance:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">📝 Mark Attendance</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 bg-white p-6 rounded-lg shadow-md"
      >
        {/* Subject Selection */}
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

        {/* Students Table */}
        {students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Roll No</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="border p-2">{s?.rollNo || "N/A"}</td>
                    <td className="border p-2">{s.name}</td>
                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggleAttendance(s._id)}
                        className={`px-3 py-1 rounded ${
                          attendanceMap[s._id] === "present"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {attendanceMap[s._id]}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded-lg text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Save Attendance"}
        </button>
      </form>
    </div>
  );
}
