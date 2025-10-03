// src/pages/department/Subjects.jsx
import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Subjects() {
  // Subjects data
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & search
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  // Add/Edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form data
  const initialForm = {
    name: "",
    code: "",
    teacher: "",
    batch: "",
    semester: "",
    credits: "",
    type: "Core",
  };
  const [formData, setFormData] = useState(initialForm);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch subjects, teachers, batches
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, bRes, sRes] = await Promise.all([
        api.get("/departmentAdmin/teachers"),
        api.get("/batches"),
        api.get("/departmentAdmin/subjects"),
      ]);
      setTeachers(tRes.data);
      setBatches(bRes.data);
      setSubjects(sRes.data.sort((a, b) => (a.code || "").localeCompare(b.code || "")));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "batch") {
      const selectedBatch = batches.find((b) => b._id === value);
      if (selectedBatch) {
        const options = Array.from({ length: selectedBatch.totalSem }, (_, i) => i + 1);
        setSemesterOptions(options);
        setFormData({ ...formData, batch: value, semester: "" });
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  // Open add modal
  const openAddModal = () => {
    setFormData(initialForm);
    setSemesterOptions([]);
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      teacher: subject.teacher?._id || subject.teacher,
      batch: subject.batch?._id || subject.batch,
      semester: subject.semester,
      credits: subject.credits,
      type: subject.type,
    });

    // Set semester options based on batch
    const batchObj = batches.find((b) => b._id === (subject.batch?._id || subject.batch));
    if (batchObj) {
      const options = Array.from({ length: batchObj.totalSem }, (_, i) => i + 1);
      setSemesterOptions(options);
    }

    setShowEditModal(true);
  };

  // Add or Update subject
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (showAddModal) {
        await api.post("/departmentAdmin/subject", formData);
        toast.success("Subject added successfully!");
      } else if (showEditModal && selectedSubject) {
        await api.put(`/departmentAdmin/subject/${selectedSubject._id}`, formData);
        toast.success("Subject updated successfully!");
      }
      fetchData();
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedSubject(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  // Delete subject
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/departmentAdmin/subject/${id}`);
      toast.success("Deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and paginate
  const filteredSubjects = subjects.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code || "").toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((s) => (selectedBatch ? (s.batch?._id || s.batch) === selectedBatch : true));

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSubjects = filteredSubjects.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <p className="text-center py-4">Loading...</p>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="md:text-2xl text-xl font-semibold">Subjects</h2>
        <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Add Subject
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="p-2 border rounded w-full sm:w-auto"
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by name or code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full sm:w-64"
        />
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
            {currentSubjects.length ? currentSubjects.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{s.name}</td>
                <td className="border px-3 py-2">{s.code}</td>
                <td className="border px-3 py-2">{s.teacher?.name || "-"}</td>
                <td className="border px-3 py-2">{s.batch?.name || "-"}</td>
                <td className="border px-3 py-2 text-center">{s.semester}</td>
                <td className="border px-3 py-2 text-center">{s.credits}</td>
                <td className="border px-3 py-2">{s.type}</td>
                <td className="border px-3 py-2 flex gap-2 flex-wrap">
                  <button
                    onClick={() => openEditModal(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    disabled={deletingId === s._id}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    {deletingId === s._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="text-center py-4">No subjects found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ✅ Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {showAddModal ? "Add Subject" : `Edit Subject: ${selectedSubject?.name}`}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Subject Name"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Subject Code"
                className="w-full p-2 border rounded"
                required
              />
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Batch</option>
                {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              {semesterOptions.length > 0 && (
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                placeholder="Credits"
                className="w-full p-2 border rounded"
                required
                min={1}
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Lab">Lab</option>
                <option value="Project">Project</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {saving ? (showAddModal ? "Creating..." : "Updating...") : (showAddModal ? "Create" : "Update")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedSubject(null); }}
                  className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
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
