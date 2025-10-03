import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";

export default function DepartmentMarksViewer() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [viewBy, setViewBy] = useState("student");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const marksPerPage = 5;

  // Fetch batches on load
  useEffect(() => {
    const fetchBatches = async () => {
      const res = await api.get("/batches");
      setBatches(res.data);
    };
    fetchBatches();
  }, []);

  // Fetch students and subjects when batch changes
  useEffect(() => {
    if (!selectedBatch) return;
    const fetchData = async () => {
      const [studentsRes, subjectsRes] = await Promise.all([
        api.get(`/departmentAdmin/students/batch?batch=${selectedBatch}`),
        api.get(`/departmentAdmin/subjects/batch?batch=${selectedBatch}`)
      ]);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
      setSelectedStudent("");
      setSelectedSubject("");
      setMarks([]);
      setExams([]);
      setSearchTerm("");
      setCurrentPage(1);
    };
    fetchData();
  }, [selectedBatch]);

  const fetchMarks = async () => {
    if (viewBy === "student" && !selectedStudent) return alert("Select a student");
    if (viewBy === "subject" && !selectedSubject) return alert("Select a subject");

    setLoading(true);
    try {
      let url = `/departmentAdmin/marks?batch=${selectedBatch}`;
      if (viewBy === "student") url += `&student=${selectedStudent}`;
      if (viewBy === "subject") url += `&subject=${selectedSubject}`;
      const res = await api.get(url);

      setExams(res.data.exams || []);
      setMarks(res.data.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch marks");
    } finally {
      setLoading(false);
    }
  };

  // Filter by search
  const filteredMarks = marks.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by rollNo ascending (if present)
  const sortedMarks = [...filteredMarks].sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));

  // Pagination
  const indexOfLastMark = currentPage * marksPerPage;
  const indexOfFirstMark = indexOfLastMark - marksPerPage;
  const currentMarks = sortedMarks.slice(indexOfFirstMark, indexOfLastMark);
  const totalPages = Math.ceil(sortedMarks.length / marksPerPage);

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">View Marks</h2>

      {/* Batch Selection */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Select Batch</label>
        <select
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">-- Select Batch --</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* View By Toggle */}
      <div className="flex items-center gap-4 mt-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="viewBy"
            value="student"
            checked={viewBy === "student"}
            onChange={() => setViewBy("student")}
            className="form-radio"
          />
          By Student
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="viewBy"
            value="subject"
            checked={viewBy === "subject"}
            onChange={() => setViewBy("subject")}
            className="form-radio"
          />
          By Subject
        </label>
      </div>

      {/* Dynamic Student or Subject Selection */}
      {viewBy === "student" && (
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Select Student</label>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {viewBy === "subject" && (
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Select Subject</label>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

    

      {/* Fetch Button */}
      <button
        onClick={fetchMarks}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Fetching..." : "Get Marks"}
      </button>
  {/* Search Input */}
  {marks.length > 0 && (
        <input
          type="text"
          placeholder={`Search by ${viewBy === "student" ? "subject" : "student"} name...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
        />
      )}
    {/* Marks Table */}
{currentMarks.length > 0 && (
  <div className="mt-6 overflow-x-auto">
    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          {viewBy === "subject" && <th className="p-3 text-left text-gray-700">Roll No</th>}
          {viewBy === "subject" && <th className="p-3 text-left text-gray-700">Student</th>}
          {viewBy === "student" && <th className="p-3 text-left text-gray-700">Subject</th>}
          {exams.map((exam) => (
            <th key={exam} className="p-3 text-left text-gray-700">{exam}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {currentMarks.map((m, i) => (
          <tr key={i} className="border-t hover:bg-gray-50">
            {viewBy === "subject" && <td className="p-3">{m.rollNo || "-"}</td>}
            {viewBy === "subject" && <td className="p-3">{m.name}</td>}
            {viewBy === "student" && <td className="p-3">{m.name}</td>}
            {exams.map((exam) => (
              <td key={exam} className="p-3 font-semibold">
                {m[exam] !== null && m[exam] !== undefined ? m[exam] : "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>

    {/* Pagination */}
    <div className="flex justify-center items-center gap-4 mt-4">
      <button
        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        onClick={() => setCurrentPage((p) => p - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        onClick={() => setCurrentPage((p) => p + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  </div>
)}
    </div>
  );
}
