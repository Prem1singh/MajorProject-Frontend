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

  // Search, sort & pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rollNo"); // rollNo, name, percent/status
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Prepare unique students for summary
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

  // Apply search
  const filteredData = (isSummary ? uniqueStudents : attendanceRecords).filter((record) => {
    const name = record.name || record.student?.name || "";
    const roll = record.rollNo || record.student?.rollNo || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Apply sort
  const sortedData = filteredData.sort((a, b) => {
    let aVal, bVal;
    if (isSummary) {
      if (sortBy === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortBy === "percent") {
        aVal = parseFloat(overallPercent[a._id] || 0);
        bVal = parseFloat(overallPercent[b._id] || 0);
      } else {
        aVal = a.rollNo.toLowerCase();
        bVal = b.rollNo.toLowerCase();
      }
    } else {
      if (sortBy === "name") {
        aVal = a.student?.name?.toLowerCase() || "";
        bVal = b.student?.name?.toLowerCase() || "";
      } else if (sortBy === "status") {
        aVal = a.status || "";
        bVal = b.status || "";
      } else {
        aVal = a.student?.rollNo?.toLowerCase() || "";
        bVal = b.student?.rollNo?.toLowerCase() || "";
      }
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Apply pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">📋 View Attendance</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 flex-wrap items-center">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border rounded-lg p-2"
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
          <br />
        <input
          type="text"
          placeholder="Search by name or roll"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg p-2 flex-1 min-w-[200px]"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg p-2"
        >
          {isSummary ? (
            <>
              <option value="rollNo">Roll No</option>
              <option value="name">Name</option>
              <option value="percent">Overall %</option>
            </>
          ) : (
            <>
              <option value="rollNo">Roll No</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </>
          )}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Attendance Table */}
      {hasFetched && (
        <div className="overflow-x-auto bg-white p-4 rounded-lg shadow">
          {paginatedData.length > 0 ? (
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
                  ? paginatedData.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="border p-2">{student.rollNo}</td>
                        <td className="border p-2">{student.name}</td>
                        <td className="border p-2 font-semibold">
                          {overallPercent[student._id] ?? "-"}%
                        </td>
                      </tr>
                    ))
                  : paginatedData.map((record) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
