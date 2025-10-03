// src/pages/Exams.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Exams() {
  const user = useSelector((state) => state.user.data);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const examTypes = ["sessional", "assignment", "attendance", "semester"];
  const [examForm, setExamForm] = useState({
    name: "",
    type: "",
    totalMarks: "",
    description: "",
  });

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        setBatches(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch batches");
      }
    };
    fetchBatches();
  }, []);

  // Fetch exams when batch changes
  useEffect(() => {
    if (!selectedBatch) {
      setExams([]);
      return;
    }
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/exams?batch=${selectedBatch}`);
        setExams(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch exams");
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [selectedBatch]);

  // Handle form changes
  const handleChange = (e) => {
    setExamForm({ ...examForm, [e.target.name]: e.target.value });
  };

  // Open add/edit modal
  const openAddModal = () => {
    setEditingExam(null);
    setExamForm({ name: "", type: "", totalMarks: "", description: "" });
    setModalOpen(true);
  };
  const openEditModal = (exam) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      type: exam.type,
      totalMarks: exam.totalMarks,
      description: exam.description || "",
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Save exam (add or edit)
  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return toast.error("Select a batch first");
    setActionLoading(true);
    try {
      if (editingExam) {
        // Edit
        await api.put(`/exams/${editingExam._id}`, { ...examForm, batch: selectedBatch });
        toast.success("Exam updated successfully");
        setExams((prev) =>
          prev.map((ex) => (ex._id === editingExam._id ? { ...ex, ...examForm } : ex))
        );
      } else {
        // Add
        const res = await api.post("/exams", { ...examForm, batch: selectedBatch });
        toast.success("Exam added successfully");
        setExams((prev) => [...prev, res.data]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save exam");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete exam
  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    setDeleteLoadingId(examId);
    try {
      await api.delete(`/exams/${examId}`);
      toast.success("Exam deleted successfully");
      setExams((prev) => prev.filter((ex) => ex._id !== examId));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete exam");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen my-8">
      <h2 className="text-2xl font-bold text-center mb-6">📚 Manage Exams</h2>

      {/* Batch Selector */}
      <div className="mb-6 w-full text-center">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="border rounded-lg p-2 w-full md:w-1/2 "
        >
          <option value="">Select Batch</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Exam Button */}
      {selectedBatch && (
        <div className="flex justify-end mb-4">
          <button
            onClick={openAddModal}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            ➕ Add Exam
          </button>
        </div>
      )}

      {/* Exams Table */}
      {loading ? (
        <p className="text-center text-gray-500 py-4">Loading...</p>
      ) : exams.length > 0 ? (
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-center">
                <th className="border p-2">Name</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Total Marks</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((ex, idx) => (
                <tr
                  key={ex._id}
                  className={`text-center ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                >
                  <td className="border p-2">{ex.name}</td>
                  <td className="border p-2 capitalize">{ex.type}</td>
                  <td className="border p-2">{ex.totalMarks}</td>
                  <td className="border p-2">{ex.description || "-"}</td>
                  <td className="border p-2 flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(ex)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExam(ex._id)}
                      disabled={deleteLoadingId === ex._id}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteLoadingId === ex._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedBatch ? (
        <p className="text-center text-gray-500 py-4">No exams found for this batch.</p>
      ) : null}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {editingExam ? "✏️ Edit Exam" : "➕ Add Exam"}
            </h3>
            <form onSubmit={handleSaveExam} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Exam Name"
                value={examForm.name}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <select
                name="type"
                value={examForm.type}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Exam Type</option>
                {examTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="totalMarks"
                placeholder="Total Marks"
                value={examForm.totalMarks}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={examForm.description}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <div className="flex justify-between gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 rounded text-white ${
                    actionLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {actionLoading
                    ? editingExam
                      ? "Updating..."
                      : "Adding..."
                    : editingExam
                    ? "Update Exam"
                    : "Add Exam"}
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
