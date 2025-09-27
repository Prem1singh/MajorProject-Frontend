import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";

export default function ManageAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    marks: "",
    deadline: "",
    subjectId: "",
    file: null,
    existingFileUrl: null,
  });

  // Search & Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("deadline"); // title, marks, deadline
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments/my");
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/teachers/subjects");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(assignments.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete assignment");
    }
  };

  const startEdit = (assignment) => {
    setEditingId(assignment._id);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      marks: assignment.marks,
      deadline: assignment.deadline
        ? new Date(assignment.deadline).toISOString().slice(0, 10)
        : "",
      subjectId: assignment.subject?._id || "",
      file: null,
      existingFileUrl: assignment.fileUrl || null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("marks", formData.marks);
      fd.append("deadline", formData.deadline);
      fd.append("subjectId", formData.subjectId);
      if (formData.file) fd.append("file", formData.file);

      await api.put(`/assignments/${editingId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Assignment updated successfully!");
      setEditingId(null);
      fetchAssignments();
    } catch (err) {
      console.error(err);
      alert("Failed to update assignment");
    } finally {
      setUpdating(false);
    }
  };

  // Apply search
  const filteredAssignments = assignments.filter((a) => {
    const subjectName = a.subject?.name || "";
    return (
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Apply sort
  const sortedAssignments = filteredAssignments.sort((a, b) => {
    let aVal, bVal;
    if (sortBy === "title") {
      aVal = a.title.toLowerCase();
      bVal = b.title.toLowerCase();
    } else if (sortBy === "marks") {
      aVal = parseFloat(a.marks || 0);
      bVal = parseFloat(b.marks || 0);
    } else {
      aVal = new Date(a.deadline || 0).getTime();
      bVal = new Date(b.deadline || 0).getTime();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  if (loading)
    return <p className="text-gray-500 text-center mt-10">Loading assignments...</p>;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📚 Manage Assignments</h2>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by title, description, or subject"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="title">Sort by Title</option>
          <option value="marks">Sort by Marks</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {sortedAssignments.length === 0 ? (
        <p className="text-gray-600 text-center">No assignments found.</p>
      ) : (
        <div className="space-y-6">
          {sortedAssignments.map((assignment) => (
            <div
              key={assignment._id}
              className="border rounded-xl p-5 shadow-md bg-white hover:shadow-lg transition"
            >
              {editingId === assignment._id ? (
                <form onSubmit={handleUpdate} className="flex flex-col space-y-3">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="border p-3 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Title"
                    required
                  />

                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="border p-3 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Description"
                    rows={4}
                  />

                  <select
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                    className="border p-3 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((subj) => (
                      <option key={subj._id} value={subj._id}>
                        {subj.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={formData.marks}
                    onChange={(e) =>
                      setFormData({ ...formData, marks: e.target.value })
                    }
                    className="border p-3 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Marks"
                    required
                  />

                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="border p-3 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />

                  {formData.existingFileUrl && !formData.file && (
                    <p className="text-sm text-gray-600">
                      Current File:{" "}
                      <a
                        href={formData.existingFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View File
                      </a>
                    </p>
                  )}

                  <input
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file: e.target.files[0],
                        existingFileUrl: null,
                      })
                    }
                    className="border p-3 w-full rounded"
                  />

                  <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                    <button
                      type="submit"
                      disabled={updating}
                      className={`px-5 py-3 rounded-lg text-white font-medium ${
                        updating
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {updating ? "⏳ Saving..." : "💾 Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-5 py-3 rounded-lg hover:bg-gray-500"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-blue-700">{assignment.title}</h3>
                  <p className="text-gray-700">{assignment.description}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {assignment.subject?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Marks:</strong> {assignment.marks}
                  </p>
                  <p>
                    <strong>Deadline:</strong>{" "}
                    {assignment.deadline
                      ? new Date(assignment.deadline).toLocaleDateString()
                      : "N/A"}
                  </p>
                  {assignment.fileUrl && (
                    <p className="mt-2">
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        📂 View File
                      </a>
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 mt-3">
                    <button
                      onClick={() => startEdit(assignment)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
