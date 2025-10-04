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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // 🔍 Search
  const [searchTerm, setSearchTerm] = useState("");

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
    setCurrentPage(1); // reset page on batch change
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

  // 🔍 Filter students based on search term
  const filteredStudents = students.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      (s.rollNo?.toLowerCase().includes(search) ?? false)
    );
  });

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="p-4 sm:p-6 bg-white shadow-md rounded-xl space-y-6">
      <h2 className="md:text-2xl text-xl font-bold text-gray-800"> Students</h2>

      {/* Filters + Search */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Filter Students</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by name, email, roll no..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
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
        ) : currentStudents.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">
            No students found for the selected filters.
          </p>
        ) : (
          <>
            <table className="w-full border rounded-lg shadow-md min-w-[400px]">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Roll No</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s, idx) => (
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
          </>
        )}
      </div>
    </div>
  );
}
