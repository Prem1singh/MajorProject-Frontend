// src/pages/studyMaterial/TeacherMaterialsManager.jsx
import React, { useState, useEffect } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function TeacherMaterialsManager() {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [formSubject, setFormSubject] = useState("");

  // Action loaders
  const [loadingUploadEdit, setLoadingUploadEdit] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);

  // Search & sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjects(res.data.subjects || []);

      } catch (err) {
        console.error(err);
      }
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

  // Open upload modal
  const openUploadModal = () => {
    setEditingMaterial(null);
    setTitle("");
    setDescription("");
    setFile(null);
    setFormSubject(selectedSubject !== "all" ? selectedSubject : "");
    setShowUploadModal(true);
  };

  // Open edit modal
  const openEditModal = (material) => {
    setEditingMaterial(material);
    setTitle(material.title);
    setDescription(material.description);
    setFile(null);
    setFormSubject(material.subject._id);
    setShowUploadModal(true);
  };

  // Handle upload / update
  const handleSave = async () => {
    if (!title || !formSubject || (!file && !editingMaterial)) {
      return alert("Please fill all required fields");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", formSubject);
    if (file) formData.append("file", file);

    setLoadingUploadEdit(true);
    try {
      if (editingMaterial) {
        await api.put(`/study/${editingMaterial._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      toast.success("Material uploaded successfully");
      } else {
        await api.post("/study/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Material uploaded successfully");
      }
      setShowUploadModal(false);
      fetchMaterials(selectedSubject);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save material");
    } finally {
      setLoadingUploadEdit(false);
    }
  };

  // Delete material
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;

    setLoadingDeleteId(id);
    try {
      await api.delete(`/study/${id}`);
      setMaterials(materials.filter((m) => m._id !== id));
      alert("Material deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete material");
    } finally {
      setLoadingDeleteId(null);
    }
  };

  // Filter & sort
  const filteredMaterials = materials
    .filter(
      (m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = sortBy === "title" ? a.title.toLowerCase() : new Date(a.createdAt);
      const bValue = sortBy === "title" ? b.title.toLowerCase() : new Date(b.createdAt);
      return sortOrder === "asc" ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) : aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
      <h2 className="md:text-2xl text-xl font-bold mb-4">Study Materials</h2>
      <button
          onClick={openUploadModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Upload Material
        </button>
        </div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select
          className="border border-gray-300 rounded-lg p-2"
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
            <li key={m._id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-start hover:shadow-lg transition-shadow duration-200">
              <div>
                <h3 className="font-semibold text-lg">{m.title}</h3>
                <p className="text-sm text-gray-600">{m.subject.name}</p>
                <p className="mt-1 text-gray-500">{m.description}</p>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  View
                </a>
                <button
                  onClick={() => openEditModal(m)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  {loadingUploadEdit && editingMaterial?._id === m._id ? "Updating..." : "Edit"}
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  {loadingDeleteId === m._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <h3 className="text-xl font-bold mb-4">{editingMaterial ? "Edit Material" : "Upload Material"}</h3>

            <div className="flex flex-col gap-3">
              <select
                className="border border-gray-300 rounded-lg p-2"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>

              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                className="border border-gray-300 rounded-lg p-2 resize-none h-24"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="file"
                className="border border-gray-300 rounded-lg p-2"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition">Cancel</button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                disabled={loadingUploadEdit}
              >
                {loadingUploadEdit ? (editingMaterial ? "Updating..." : "Uploading...") : editingMaterial ? "Update" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
