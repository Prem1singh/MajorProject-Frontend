import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../../../utils/axiosInstance";

export default function SubjectPerformance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Fetch subjects for teacher
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjects(res.data.subjects);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch performance for selected subject
  const fetchPerformance = async (subjectId) => {
    if (!subjectId) return;
    setLoading(true);
    setPerformance(null);
    try {
      const res = await api.get(`/performance/subject/${subjectId}`);
      // Sort students descending by total marks
      const sortedStudents = res.data.students.sort((a, b) => {
        const totalA = Object.values(a.marks).reduce((sum, v) => sum + v, 0);
        const totalB = Object.values(b.marks).reduce((sum, v) => sum + v, 0);
        return totalB - totalA;
      });
      setPerformance({ ...res.data, students: sortedStudents });
      setCurrentPage(1); // Reset page
    } catch (err) {
      console.error("Error fetching performance:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading performance...</p>;

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = performance?.students.slice(indexOfFirstStudent, indexOfLastStudent) || [];
  const totalPages = Math.ceil((performance?.students.length || 0) / studentsPerPage);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Subject Performance</h2>

      {/* Subject Selection */}
      <div>
        <label className="font-medium text-gray-700">Select Subject:</label>
        <select
          className="ml-2 border rounded p-2"
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            fetchPerformance(e.target.value);
          }}
        >
          <option value="">-- Select --</option>
          {subjects.map((subj) => (
            <option key={subj._id} value={subj._id}>
              {subj.name}
            </option>
          ))}
        </select>
      </div>

      {performance && (
        <>
          {/* Top N Students Chart */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Top 10 Students</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance.students.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {performance.exams.map((exam, i) => (
                  <Bar
                    key={exam}
                    dataKey={`marks.${exam}`}
                    fill={["#2563eb", "#10b981", "#f59e0b"][i % 3]}
                    name={exam}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Student Trend Line Chart */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Average Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performance.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Paginated Student Table */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">All Students</h3>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Student</th>
                  {performance.exams.map((exam) => (
                    <th key={exam} className="border p-2">{exam}</th>
                  ))}
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s) => {
                  const total = Object.values(s.marks).reduce((sum, v) => sum + v, 0);
                  return (
                    <tr key={s.studentId}>
                      <td className="border p-2">{s.name}</td>
                      {performance.exams.map((exam) => (
                        <td key={exam} className="border p-2">{s.marks[exam] ?? "-"}</td>
                      ))}
                      <td className="border p-2 font-semibold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    page === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
