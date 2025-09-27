import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const studentsPerPage = 10;

  // Sorting
  const [sortOrder, setSortOrder] = useState("asc");

  // 🔍 Search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch batches
  const fetchBatches = async () => {
    try {
      const res = await api.get("/batches");
      setBatches(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batches");
    }
  };

  // Fetch students
  const fetchStudents = async (batchId = "") => {
    try {
      setLoading(true);
      let url = "/departmentAdmin/students";
      if (batchId) url += `?batchId=${batchId}`;
      const res = await api.get(url);

      let data = res.data || [];

      // ✅ Sort by rollNo
      data = data.sort((a, b) => {
        const rollA = a.rollNo || "";
        const rollB = b.rollNo || "";
        if (sortOrder === "asc")
          return rollA.localeCompare(rollB, "en", { numeric: true });
        return rollB.localeCompare(rollA, "en", { numeric: true });
      });

      setStudents(data);
      setPage(1); // reset to first page on new fetch
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchStudents();
  }, []);

  // Refetch when sort order changes
  useEffect(() => {
    fetchStudents(selectedBatch);
  }, [sortOrder]);

  // Handle batch filter
  const handleBatchFilter = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    fetchStudents(batchId);
  };

  // Delete student
  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      setActionLoading(true);
      await api.delete(`/departmentAdmin/student/${studentId}`);
      toast.success("Student deleted successfully!");
      fetchStudents(selectedBatch);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit form change
  const handleChange = (e) => {
    setSelectedStudent({ ...selectedStudent, [e.target.name]: e.target.value });
  };

  const handleBatchChange = (e) => {
    setSelectedStudent({ ...selectedStudent, batch: e.target.value });
  };

  // Open edit form
  const handleEdit = (student) => {
    setSelectedStudent({
      ...student,
      batch: student.batch?._id || "",
    });
  };

  // Submit updated student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.put(
        `/departmentAdmin/student/${selectedStudent._id}`,
        selectedStudent
      );
      toast.success("Student updated successfully!");
      setSelectedStudent(null);
      fetchStudents(selectedBatch);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update student");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Filter students based on search
  const filteredStudents = students.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search) ||
      s.rollNo?.toLowerCase().includes(search) ||
      s.batch?.name?.toLowerCase().includes(search)
    );
  });

  // Pagination logic (apply after filtering)
  const indexOfLast = page * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  if (loading) return <p className="text-center py-4">Loading students...</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Manage Students
      </h2>

      {/* Top Controls */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Batch Filter */}
        <div className="flex items-center gap-2">
          <label className="font-medium">Batch:</label>
          <select
            value={selectedBatch}
            onChange={handleBatchFilter}
            className="p-2 border rounded w-full sm:w-auto"
          >
            <option value="">All</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} {b.year ? `(${b.year})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, roll no, batch..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // reset page when searching
            }}
            className="w-full sm:w-64 p-2 border rounded"
          />
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sort by Roll No ({sortOrder === "asc" ? "Asc" : "Desc"})
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Roll No</th>
              <th className="border px-3 py-2 text-left">Batch</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{s.name}</td>
                  <td className="border px-3 py-2">{s.email}</td>
                  <td className="border px-3 py-2">{s.rollNo}</td>
                  <td className="border px-3 py-2">{s.batch?.name || "-"}</td>
                  <td className="border px-3 py-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-[70px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      disabled={actionLoading}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      {actionLoading ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Student Form */}
      {selectedStudent && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Edit Student: {selectedStudent.name}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={selectedStudent.name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="email"
              name="email"
              value={selectedStudent.email}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              name="rollNo"
              value={selectedStudent.rollNo}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <select
              value={selectedStudent.batch || ""}
              onChange={handleBatchChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} {b.year ? `(${b.year})` : ""}
                </option>
              ))}
            </select>
            <div className="flex justify-between gap-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {actionLoading ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
