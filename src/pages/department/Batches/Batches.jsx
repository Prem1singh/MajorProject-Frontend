// src/pages/BatchesPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    totalSem: "",
    currentSem: "",
    year: "",
    status: "Active",
    dissertation: false,
    course: "",
  });
  const [editingBatch, setEditingBatch] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const batchesPerPage = 5;

  const fetchBatches = async (courseId = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/batches${courseId ? `?courseId=${courseId}` : ""}`);
      setBatches(res.data.batches || res.data);
    } catch (err) {
      console.error("Error fetching batches:", err);
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.courses || res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchCourses();
  }, []);

  const resetForm = () => {
    setEditingBatch(null);
    setFormData({
      name: "",
      totalSem: "",
      currentSem: "",
      year: "",
      status: "Active",
      dissertation: false,
      course: "",
    });
  };

  const handleCourseFilter = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    resetForm();
    fetchBatches(courseId);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingBatch) {
        await api.put(`/batches/${editingBatch._id}`, formData);
        toast.success("Batch updated successfully");
      } else {
        await api.post("/batches", formData);
        toast.success("Batch created successfully");
      }
      resetForm();
      fetchBatches(selectedCourse);
    } catch (err) {
      console.error("Error saving batch:", err);
      toast.error(err.response?.data?.message || "Failed to save batch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      totalSem: batch.totalSem,
      currentSem: batch.currentSem || "",
      year: batch.year,
      status: batch.status,
      dissertation: batch.dissertation,
      course: batch.course._id,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/batches/${id}`);
      toast.success("Batch deleted successfully");
      fetchBatches(selectedCourse);
    } catch (err) {
      console.error("Error deleting batch:", err);
      toast.error(err.response?.data?.message || "Failed to delete batch");
    } finally {
      setActionLoading(false);
    }
  };

  // 🔍 Filter by search term (batch name or course name)
  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.course?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔃 Sort by year descending (recent first)
  const sortedBatches = [...filteredBatches].sort((a, b) => b.year - a.year);

  // Pagination logic
  const indexOfLastBatch = currentPage * batchesPerPage;
  const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  const currentBatches = sortedBatches.slice(indexOfFirstBatch, indexOfLastBatch);
  const totalPages = Math.ceil(sortedBatches.length / batchesPerPage);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">📚 Batches</h2>



      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Batch Name (e.g. BCA-2023)"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="totalSem"
          placeholder="Total Semesters"
          value={formData.totalSem}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <select
          name="currentSem"
          value={formData.currentSem}
          onChange={handleChange}
          className="border p-2 rounded"
          required
          disabled={!formData.totalSem}
        >
          <option value="">Select Current Semester</option>
          {Array.from({ length: Number(formData.totalSem) || 0 }, (_, i) => i + 1).map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="year"
          placeholder="Admission Year"
          value={formData.year}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <select name="status" value={formData.status} onChange={handleChange} className="border p-2 rounded">
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Suspended">Suspended</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="dissertation" checked={formData.dissertation} onChange={handleChange} />
          Dissertation
        </label>
        <select name="course" value={formData.course} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="col-span-1 md:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={actionLoading}
            className={`px-4 py-2 rounded text-white ${
              actionLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {actionLoading ? (editingBatch ? "Updating..." : "Adding...") : editingBatch ? "Update" : "Add"} Batch
          </button>
          {editingBatch && (
            <button
              type="button"
              onClick={resetForm}
              disabled={actionLoading}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center">
        <label className="font-semibold">Filter by Course:</label>
        <select
          value={selectedCourse}
          onChange={handleCourseFilter}
          className="border p-2 rounded w-full sm:w-64"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by batch or course..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
          className="border p-2 rounded flex-1 sm:flex-none sm:w-64"
        />
      </div>
      {/* Batches Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading batches...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-center">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Total Sem</th>
                <th className="p-2 border">Current Sem</th>
                <th className="p-2 border">Year</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Dissertation</th>
                <th className="p-2 border">Course</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBatches.length > 0 ? (
                currentBatches.map((batch, idx) => (
                  <tr
                    key={batch._id}
                    className={`text-center ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                  >
                    <td className="border p-2">{indexOfFirstBatch + idx + 1}</td>
                    <td className="border p-2">{batch.name}</td>
                    <td className="border p-2">{batch.totalSem}</td>
                    <td className="border p-2">{batch.currentSem || "-"}</td>
                    <td className="border p-2">{batch.year}</td>
                    <td className="border p-2">{batch.status}</td>
                    <td className="border p-2">{batch.dissertation ? "Yes" : "No"}</td>
                    <td className="border p-2">{batch.course?.name || "-"}</td>
                    <td className="border p-2 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(batch)}
                        disabled={actionLoading}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(batch._id)}
                        disabled={actionLoading}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-4 text-center">
                    No batches found
                  </td>
                </tr>
              )}
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
