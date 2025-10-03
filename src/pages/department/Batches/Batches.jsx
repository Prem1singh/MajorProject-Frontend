// src/pages/BatchesPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openAddModal = () => {
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
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      closeModal();
      fetchBatches(selectedCourse);
    } catch (err) {
      console.error("Error saving batch:", err);
      toast.error(err.response?.data?.message || "Failed to save batch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    setDeleteLoadingId(id);
    try {
      await api.delete(`/batches/${id}`);
      toast.success("Batch deleted successfully");
      fetchBatches(selectedCourse);
    } catch (err) {
      console.error("Error deleting batch:", err);
      toast.error(err.response?.data?.message || "Failed to delete batch");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleCourseFilter = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    closeModal();
    fetchBatches(courseId);
  };

  // Filter & Sort
  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.course?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBatches = [...filteredBatches].sort((a, b) => b.year - a.year);

  // Pagination
  const indexOfLastBatch = currentPage * batchesPerPage;
  const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  const currentBatches = sortedBatches.slice(indexOfFirstBatch, indexOfLastBatch);
  const totalPages = Math.ceil(sortedBatches.length / batchesPerPage);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between mb-1.5">

     
      <h2 className="md:text-2xl text-xl  font-bold mb-4 text-center md:text-left">📚 Batches</h2>
      <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Add Batch
        </button> </div>
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
            setCurrentPage(1);
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
                        onClick={() => openEditModal(batch)}
                        disabled={actionLoading}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(batch._id)}
                        disabled={deleteLoadingId === batch._id}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleteLoadingId === batch._id ? "Deleting..." : "Delete"}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {editingBatch ? "Edit Batch" : "Add Batch"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Batch Name (e.g. BCA-2023)"
                className="w-full p-2 border rounded"
                required
                disabled={actionLoading}
              />
              <input
                type="number"
                name="totalSem"
                value={formData.totalSem}
                onChange={handleChange}
                placeholder="Total Semesters"
                className="w-full p-2 border rounded"
                required
                disabled={actionLoading}
              />
              <select
                name="currentSem"
                value={formData.currentSem}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                disabled={!formData.totalSem || actionLoading}
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
                value={formData.year}
                onChange={handleChange}
                placeholder="Admission Year"
                className="w-full p-2 border rounded"
                required
                disabled={actionLoading}
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                disabled={actionLoading}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="dissertation"
                  checked={formData.dissertation}
                  onChange={handleChange}
                  disabled={actionLoading}
                />
                Dissertation
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                disabled={actionLoading}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-between gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 rounded text-white ${
                    actionLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {actionLoading
                    ? editingBatch
                      ? "Updating..."
                      : "Adding..."
                    : editingBatch
                    ? "Update Batch"
                    : "Add Batch"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
