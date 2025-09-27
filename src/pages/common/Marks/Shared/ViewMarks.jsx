import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function ViewMarks() {
  const user = useSelector((state) => state.user.data);
  const [subject, setSubject] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rollNo"); // rollNo, name, or any exam
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch subjects assigned to teacher
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err.response?.data || err.message);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch marks for selected subject
  const handleView = async () => {
    if (!subject) {
      alert("Please select a subject");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/marks", { params: { subject } });
      const marks = res.data || [];

      // Extract all exam keys dynamically
      const types = marks.length
        ? Array.from(
            new Set(
              marks.flatMap((m) =>
                Object.keys(m).filter((k) => k !== "student" && k !== "_id")
              )
            )
          )
        : [];

      setExamTypes(types);
      setMarksData(marks);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching marks:", err.response?.data || err.message);
      setMarksData([]);
      setExamTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search term
  const filtered = marksData.filter(
    (s) =>
      s.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.student?.rollNo && s.student.rollNo.toString().includes(searchTerm))
  );

  // Sorting function
  const sorted = [...filtered].sort((a, b) => {
    let aValue, bValue;

    if (sortBy === "rollNo") {
      aValue = a.student?.rollNo || "";
      bValue = b.student?.rollNo || "";
    } else if (sortBy === "name") {
      aValue = a.student?.name.toLowerCase() || "";
      bValue = b.student?.name.toLowerCase() || "";
    } else {
      // sort by exam
      aValue = parseFloat(a[sortBy]) || 0;
      bValue = parseFloat(b[sortBy]) || 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sorted.length / rowsPerPage);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">📊 View Marks</h2>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
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

        <button
          onClick={handleView}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Load Marks
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mb-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search by name or roll no"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full md:w-1/3"
        />

        <div className="flex gap-2 items-center">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border p-2 rounded">
            <option value="rollNo">Roll No</option>
            <option value="name">Name</option>
            {examTypes.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border p-2 rounded">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading marks...</p>
      ) : currentRows.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border shadow-md rounded-lg overflow-hidden">
              <thead className="bg-blue-600 text-white text-sm uppercase">
                <tr>
                  <th className="p-3 border text-left cursor-pointer" onClick={() => { setSortBy("rollNo"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>Roll No</th>
                  <th className="p-3 border text-left cursor-pointer" onClick={() => { setSortBy("name"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>Name</th>
                  {examTypes.map((ex) => (
                    <th key={ex} className="p-3 border text-center cursor-pointer" onClick={() => { setSortBy(ex); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
                      {ex}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((s, idx) => (
                  <tr
                    key={s.student?._id || idx}
                    className={`hover:bg-gray-50 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <td className="p-2 border font-medium">{s.student?.rollNo}</td>
                    <td className="p-2 border">{s.student?.name}</td>
                    {examTypes.map((ex) => (
                      <td key={ex} className="p-2 border text-center font-semibold">
                        {s[ex] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center mt-4">
          {subject ? "No marks found for this subject" : "Select a subject to view marks"}
        </p>
      )}
    </div>
  );
}
