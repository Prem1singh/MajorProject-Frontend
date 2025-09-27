import React, { useState, useEffect } from "react";
import api from "../../../../utils/axiosInstance";

export default function ViewTeacherMaterials() {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title"); // or "date"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await api.get("/teachers/subjects");
      setSubjects(res.data.subjects);
    };
    fetchSubjects();
  }, []);

  // Fetch materials
  const fetchMaterials = async (subjectId = "all") => {
    setLoading(true);
    let url = "/study/teacher";
    if (subjectId !== "all") url += `?subject=${subjectId}`;
    try {
      const res = await api.get(url);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(selectedSubject);
  }, [selectedSubject]);

  // Delete material
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await api.delete(`/study/${id}`);
      setMaterials(materials.filter((m) => m._id !== id));
      alert("Material deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete material");
    }
  };

  // Edit material
  const openEditModal = (material) => {
    setEditingMaterial(material);
    setEditTitle(material.title);
    setEditDescription(material.description);
    setEditFile(null);
  };

  const handleEdit = async () => {
    if (!editTitle) return alert("Title is required");
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    if (editFile) formData.append("file", editFile);

    try {
      await api.put(`/study/${editingMaterial._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Material updated successfully");
      setEditingMaterial(null);
      fetchMaterials(selectedSubject);
    } catch (err) {
      console.error(err);
      alert("Failed to update material");
    }
  };

  // Filter & sort materials
  const filteredMaterials = materials
    .filter(
      (m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = sortBy === "title" ? a.title.toLowerCase() : new Date(a.createdAt);
      let bValue = sortBy === "title" ? b.title.toLowerCase() : new Date(b.createdAt);
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">View Uploaded Materials</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 flex-1 min-w-[200px]"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="title">Sort by Title</option>
          <option value="date">Sort by Date</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Materials List */}
      {loading ? (
        <p>Loading materials...</p>
      ) : filteredMaterials.length === 0 ? (
        <p className="text-gray-500">No materials found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredMaterials.map((m) => (
            <li
              key={m._id}
              className="border border-gray-200 p-4 rounded-lg flex justify-between items-start hover:shadow-lg transition-shadow duration-200"
            >
              <div>
                <h3 className="font-semibold text-lg">{m.title}</h3>
                <p className="text-sm text-gray-600">{m.subject.name}</p>
                <p className="mt-1 text-gray-500">{m.description}</p>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View
                </a>
                <button
                  onClick={() => openEditModal(m)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Edit Material</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none h-24"
                placeholder="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <input
                type="file"
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setEditFile(e.target.files[0])}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingMaterial(null)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
