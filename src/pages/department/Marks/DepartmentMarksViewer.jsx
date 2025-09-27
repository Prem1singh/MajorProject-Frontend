import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";

export default function DepartmentMarksViewer() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [viewBy, setViewBy] = useState("student"); // "student" or "subject"
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState([]);
  const [exams, setExams] = useState([]); // dynamic exam columns
  const [loading, setLoading] = useState(false);

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

      setExams(res.data.exams || []); // dynamic exam names
      setMarks(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch marks");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Marks Table */}
      {marks.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                {/* Conditionally show first column */}
                {viewBy === "subject" && <th className="p-3 text-left text-gray-700">Student</th>}
                {viewBy === "student" && <th className="p-3 text-left text-gray-700">Subject</th>}

                {/* Dynamic exam columns */}
                {exams.map((exam) => (
                  <th key={exam} className="p-3 text-left text-gray-700">{exam}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marks.map((m, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
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
        </div>
      )}
    </div>
  );
}
