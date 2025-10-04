// src/pages/attendance/Teacher/UpdateAttendance.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function UpdateAttendance() {
  const user = useSelector((state) => state.user.data);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
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

  // Fetch attendance records for selected subject and date
  useEffect(() => {
    if (!subject || !date) {
      setAttendanceRecords([]);
      setAttendanceMap({});
      return;
    }

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/attendance?subject=${subject}&date=${date}`);
        const records = res.data || [];
        setAttendanceRecords(records);

        // Map for toggling status
        const map = {};
        records.forEach((r) => {
          if (r.student) map[r._id] = r.status;
        });
        setAttendanceMap(map);
      } catch (err) {
        console.error("Error fetching attendance:", err.response?.data || err.message);
        setAttendanceRecords([]);
        setAttendanceMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [subject, date]);

  const toggleAttendance = (id) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attendanceRecords.length) {
      toast.error("No attendance records to update");
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        attendanceRecords.map((record) =>
          api.put(`/attendance/${record._id}`, { status: attendanceMap[record._id] })
        )
      );
      toast.success("Attendance updated successfully!");
    } catch (err) {
      console.error("Error updating attendance:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6">📝 Update Attendance</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 bg-white p-6 rounded-lg shadow-md"
      >
        {/* Select Subject */}
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

        {/* Select Date */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        {/* Attendance Table */}
        {attendanceRecords.length > 0 && (
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
                {attendanceRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="border p-2">{r.student?.rollNo || "-"}</td>
                    <td className="border p-2">{r.student?.name || "-"}</td>
                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggleAttendance(r._id)}
                        className={`px-3 py-1 rounded ${
                          attendanceMap[r._id] === "present"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {attendanceMap[r._id]}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded-lg text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating..." : "Update Attendance"}
        </button>
      </form>
    </div>
  );
}
