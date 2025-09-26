import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");

  // Fetch teachers & batches
  const fetchMeta = async () => {
    try {
      const [tRes, bRes] = await Promise.all([
        api.get("/departmentAdmin/teachers"),
        api.get("/batches"),
      ]);
      setTeachers(tRes.data);
      setBatches(bRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers or batches");
    }
  };

  // Fetch subjects
  const fetchSubjects = async (batchId = "") => {
    try {
      setLoading(true);
      let url = "/departmentAdmin/subjects";
      if (batchId) url += `?batchId=${batchId}`;
      const res = await api.get(url);
      setSubjects(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchSubjects();
  }, []);

  // Batch filter
  const handleBatchFilter = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    fetchSubjects(batchId);
  };

  // Delete subject
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      setActionLoading(true);
      await api.delete(`/departmentAdmin/subject/${id}`);
      toast.success("Deleted Successfully");
      fetchSubjects(selectedBatch);
    } catch (err) {
      console.error(err);
      toast.error("Delete Failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit updated subject
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.put(`/departmentAdmin/subject/${selectedSubject._id}`, selectedSubject);
      toast.success("Updated Successfully");
      setSelectedSubject(null);
      fetchSubjects(selectedBatch);
    } catch (err) {
      console.error(err);
      toast.error("Update Failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="text-center py-4">Loading...</p>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Manage Subjects</h2>

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

      {/* Subjects Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Code</th>
              <th className="border px-3 py-2">Teacher</th>
              <th className="border px-3 py-2">Batch</th>
              <th className="border px-3 py-2">Semester</th>
              <th className="border px-3 py-2">Credits</th>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{s.name}</td>
                  <td className="border px-3 py-2">{s.code}</td>
                  <td className="border px-3 py-2">{s.teacher?.name || "-"}</td>
                  <td className="border px-3 py-2">{s.batch?.name || "-"}</td>
                  <td className="border px-3 py-2 text-center">{s.semester}</td>
                  <td className="border px-3 py-2 text-center">{s.credits}</td>
                  <td className="border px-3 py-2">{s.type}</td>
                  <td className="border px-3 py-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSubject(s)}
                      className=" bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-[70px]"
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
                <td colSpan="8" className="text-center py-4">
                  No subjects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Subject Form */}
      {selectedSubject && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Edit Subject: {selectedSubject.name}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={selectedSubject.name}
              onChange={(e) =>
                setSelectedSubject({ ...selectedSubject, name: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              value={selectedSubject.code}
              onChange={(e) =>
                setSelectedSubject({ ...selectedSubject, code: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <select
              value={selectedSubject.teacher?._id || selectedSubject.teacher || ""}
              onChange={(e) =>
                setSelectedSubject({ ...selectedSubject, teacher: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              value={selectedSubject.batch?._id || selectedSubject.batch || ""}
              onChange={(e) =>
                setSelectedSubject({ ...selectedSubject, batch: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedSubject.semester}
              onChange={(e) =>
                setSelectedSubject({ ...selectedSubject, semester: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="number"
              value={selectedSubject.credits}
              onChange={(e) =>
                setSelectedSubject({ ...selectedSubject, credits: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <select
              value={selectedSubject.type || "Core"}
              onChange={(e) =>
                setSelectedSubject({ ...selectedSubject, type: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="Core">Core</option>
              <option value="Elective">Elective</option>
              <option value="Lab">Lab</option>
              <option value="Project">Project</option>
            </select>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {actionLoading ? "Updating..." : "Update Subject"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
