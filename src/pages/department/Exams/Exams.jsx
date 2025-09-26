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

  const handleChange = (e) => {
    setExamForm({ ...examForm, [e.target.name]: e.target.value });
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return toast.error("Select a batch first");

    setLoading(true);
    try {
      const res = await api.post("/exams", { ...examForm, batch: selectedBatch });
      toast.success("Exam added successfully");
      setExams((prev) => [...prev, res.data]);
      setExamForm({ name: "", type: "", totalMarks: "", description: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add exam");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    setLoading(true);
    try {
      await api.delete(`/exams/${examId}`);
      toast.success("Exam deleted successfully");
      setExams((prev) => prev.filter((ex) => ex._id !== examId));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen my-8">
      <h2 className="text-2xl font-bold text-center mb-6">📚 Manage Exams</h2>

      {/* Batch Selector */}
      <div className="mb-6">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="border rounded-lg p-2 w-full md:w-1/2"
        >
          <option value="">Select Batch</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

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
                  className={`text-center ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="border p-2">{ex.name}</td>
                  <td className="border p-2 capitalize">{ex.type}</td>
                  <td className="border p-2">{ex.totalMarks}</td>
                  <td className="border p-2">{ex.description || "-"}</td>
                  <td className="border p-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleDeleteExam(ex._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedBatch ? (
        <p className="text-center text-gray-500 py-4">
          No exams found for this batch.
        </p>
      ) : null}

      {/* Add Exam Form */}
      {selectedBatch && (
        <form
          onSubmit={handleAddExam}
          className="bg-white p-4 rounded-lg shadow-md space-y-4"
        >
          <h3 className="font-semibold text-lg">➕ Add New Exam</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              name="name"
              placeholder="Exam Name"
              value={examForm.name}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1 w-full"
              required
            />
            <select
              name="type"
              value={examForm.type}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1 w-full"
              required
            >
              <option value="">Select Exam Type</option>
              {examTypes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="number"
              name="totalMarks"
              placeholder="Total Marks"
              value={examForm.totalMarks}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1 w-full"
              required
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={examForm.description}
              onChange={handleChange}
              className="border rounded-lg p-2 flex-1 w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            {loading ? "Adding..." : "Add Exam"}
          </button>
        </form>
      )}
    </div>
  );
}
