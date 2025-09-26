// src/pages/attendance/Teacher/ViewAttendance.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function ViewAttendance() {
  const user = useSelector((state) => state.user.data);

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [overallPercent, setOverallPercent] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

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

  const fetchAttendance = async () => {
    if (!subject) {
      alert("Please select a subject");
      return;
    }

    setLoading(true);
    try {
      let url = `/attendance?subject=${subject}`;
      if (date) url += `&date=${date}`;

      const res = await api.get(url);
      const records = res.data || [];
      setAttendanceRecords(records);

      // Calculate summary percentages if no date filter
      if (!date) {
        const studentMap = {};
        records.forEach((r) => {
          const sid = r.student?._id;
          if (!sid) return;
          if (!studentMap[sid]) {
            studentMap[sid] = {
              present: 0,
              total: 0,
              name: r.student.name,
              rollNo: r.student.rollNo,
            };
          }
          studentMap[sid].total += 1;
          if (r.status === "present") studentMap[sid].present += 1;
        });

        const percentMap = {};
        Object.keys(studentMap).forEach((sid) => {
          const { present, total } = studentMap[sid];
          percentMap[sid] = total ? ((present / total) * 100).toFixed(2) : "0.00";
        });

        setOverallPercent(percentMap);
      } else {
        setOverallPercent({});
      }

      setHasFetched(true);
    } catch (err) {
      console.error("Error fetching attendance:", err.response?.data || err.message);
      setAttendanceRecords([]);
      setOverallPercent({});
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const isSummary = !date;
  const uniqueStudents = isSummary
    ? Object.keys(overallPercent).map((sid) => {
        const student = attendanceRecords.find((r) => r.student?._id === sid)?.student;
        return {
          _id: sid,
          name: student?.name || "-",
          rollNo: student?.rollNo || "-",
        };
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">📋 View Attendance</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border rounded-lg p-2 flex-1"
        >
          <option value="">Select Subject</option>
          {subjectsForTeacher.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg p-2"
        />

        <button
          onClick={fetchAttendance}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Get Attendance"}
        </button>
      </div>

      {/* Attendance Table */}
      {hasFetched && (
        <div className="overflow-x-auto bg-white p-4 rounded-lg shadow">
          {attendanceRecords.length > 0 ? (
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Roll No</th>
                  <th className="border p-2">Name</th>
                  {isSummary ? (
                    <th className="border p-2">Overall %</th>
                  ) : (
                    <>
                      <th className="border p-2">Status</th>
                      <th className="border p-2">Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isSummary
                  ? uniqueStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="border p-2">{student.rollNo}</td>
                        <td className="border p-2">{student.name}</td>
                        <td className="border p-2 font-semibold">
                          {overallPercent[student._id] ?? "-"}%
                        </td>
                      </tr>
                    ))
                  : attendanceRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="border p-2">{record.student?.rollNo || "-"}</td>
                        <td className="border p-2">{record.student?.name || "-"}</td>
                        <td
                          className={`border p-2 font-semibold ${
                            record.status === "present"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {record.status || "unknown"}
                        </td>
                        <td className="border p-2">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center">
              {loading ? "Fetching records..." : "No attendance records found"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
