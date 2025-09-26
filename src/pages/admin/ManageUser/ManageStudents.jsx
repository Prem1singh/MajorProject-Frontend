import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";

export default function ManageStudents() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch departments
  useEffect(() => {
    api
      .get("/admin/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => setError("Failed to fetch departments"));
  }, []);

  // Fetch courses when department changes
  useEffect(() => {
    if (!selectedDept) {
      setCourses([]);
      setSelectedCourse(null);
      setBatches([]);
      setSelectedBatch("");
      return;
    }
    api
      .get(`/admin/department/${selectedDept}/courses`)
      .then((res) => setCourses(res.data))
      .catch(() => setError("Failed to fetch courses"));
  }, [selectedDept]);

  // Fetch batches when course changes
  useEffect(() => {
    if (!selectedCourse) {
      setBatches([]);
      setSelectedBatch("");
      return;
    }
    api
      .get(`/admin/course/${selectedCourse._id}/batches`)
      .then((res) => setBatches(res.data.batches))
      .catch(() => setError("Failed to fetch batches"));
  }, [selectedCourse]);

  // Fetch students when batch changes
  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      return;
    }
    fetchStudents();
  }, [selectedBatch]);

  const fetchStudents = () => {
    setLoading(true);
    api
      .get(`/admin/batches/${selectedBatch}/students`)
      .then((res) => setStudents(res.data.students))
      .catch(() => setError("Failed to fetch students"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-4 sm:p-6 bg-white shadow-md rounded-xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Manage Students</h2>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Filter Students
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Department Select */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          >
            <option value="">Select Department</option>
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Course Select */}
          <select
            value={selectedCourse?._id || ""}
            onChange={(e) =>
              setSelectedCourse(courses.find((c) => c._id === e.target.value))
            }
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
            disabled={!courses.length}
          >
            <option value="">Select Course</option>
            {courses?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Batch Select */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
            disabled={!batches.length}
          >
            <option value="">Select Batch</option>
            {batches?.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 mb-4 font-medium bg-red-50 p-2 rounded-lg text-center">
          {error}
        </p>
      )}

      {/* Students Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-gray-600 text-center py-4">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">
            No students found for the selected filters.
          </p>
        ) : (
          <table className="w-full border rounded-lg shadow-md min-w-[400px]">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Roll No</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr
                  key={s._id}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.rollNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
