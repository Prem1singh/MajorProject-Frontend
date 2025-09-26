import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true); // for fetching students
  const [actionLoading, setActionLoading] = useState(false); // for update/delete
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");

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
      setStudents(res.data || []);
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
      await api.put(`/departmentAdmin/student/${selectedStudent._id}`, selectedStudent);
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

  if (loading) return <p className="text-center py-4">Loading students...</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Manage Students</h2>

      {/* Batch Filter */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="font-medium">Filter by Batch:</label>
        <select
          value={selectedBatch}
          onChange={handleBatchFilter}
          className="p-2 border rounded w-full sm:w-auto"
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} {b.year ? `(${b.year})` : ""}
            </option>
          ))}
        </select>
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
            {students.length > 0 ? (
              students.map((s) => (
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
