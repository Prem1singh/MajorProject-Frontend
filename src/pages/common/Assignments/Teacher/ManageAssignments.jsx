// src/pages/assignments/TeacherAssignments.jsx
import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [viewingSubmissions, setViewingSubmissions] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    marks: "",
    deadline: "",
    subjectId: "",
    file: null,
    existingFileUrl: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // 🔹 For search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

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

  const openModal = (assignment = null) => {
    if (assignment) {
      // Editing
      setEditingAssignment(assignment);
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
    } else {
      // Creating
      setEditingAssignment(null);
      setFormData({
        title: "",
        description: "",
        marks: "",
        deadline: "",
        subjectId: "",
        file: null,
        existingFileUrl: null,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("marks", formData.marks);
      fd.append("deadline", formData.deadline);
      fd.append("subjectId", formData.subjectId);
      if (formData.file) fd.append("file", formData.file);

      if (editingAssignment) {
        await api.put(`/assignments/${editingAssignment._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Assignment updated successfully!");
      } else {
        await api.post("/assignments", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Assignment created successfully!");
      }

      fetchAssignments();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save assignment");
    } finally {
      setSubmitting(false);
    }
  };

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

  const fetchSubmissions = async (assignment) => {
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(res.data || []);
      setSelectedAssignment(assignment);
      setViewingSubmissions(true);
      setSearchTerm("");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch submissions");
    }
  };

  const handleUpdateSubmission = async (submissionId, updates) => {
    try {
      await api.patch(
        `/assignments/${selectedAssignment._id}/submissions/${submissionId}`,
        updates
      );
      fetchSubmissions(selectedAssignment);
    } catch (err) {
      console.error(err);
      alert("Failed to update submission");
    }
  };

  // 🔹 Filter assignments based on search + subject
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" || a.subject?._id === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // 🔹 Filter submissions based on search by student name/roll no
  const filteredSubmissions = submissions.filter((s) => {
    const name = s.student?.name || "";
    const roll = s.student?.rollNo || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      {/* Header + Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Assignment
        </button>
      </div>

      {/* 🔹 Filters */}
      {!viewingSubmissions && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!viewingSubmissions && (
        <>
          {loading ? (
            <p className="text-center text-gray-500">Loading assignments...</p>
          ) : filteredAssignments.length === 0 ? (
            <p className="text-center text-gray-500">No assignments found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-blue-700">{assignment.title}</h3>
                  <p className="text-gray-700">{assignment.description}</p>
                  <p className="text-sm text-gray-600">
                    Subject: {assignment.subject?.name || "N/A"}
                  </p>
                  <p>Marks: {assignment.marks}</p>
                  <p>
                    Deadline:{" "}
                    {assignment.deadline
                      ? new Date(assignment.deadline).toLocaleDateString()
                      : "N/A"}
                  </p>
                  {assignment.fileUrl && (
                    <a
                      href={assignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline block mt-1"
                    >
                      📂 View File
                    </a>
                  )}
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => openModal(assignment)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                    <button
                      onClick={() => fetchSubmissions(assignment)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      📂 View Submissions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Submissions View */}
      {viewingSubmissions && selectedAssignment && (
        <div className="mt-6">
          <button
            onClick={() => setViewingSubmissions(false)}
            className="mb-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            ← Back to Assignments
          </button>

          <h3 className="text-xl font-semibold mb-4">
            Submissions for: <span className="text-blue-600">{selectedAssignment.title}</span>
          </h3>

          <input
            type="text"
            placeholder="Search by student name or roll no"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />

          {filteredSubmissions.length === 0 ? (
            <p className="text-gray-500">No submissions found.</p>
          ) : (
            filteredSubmissions.map((s) => (
              <div
                key={s._id}
                className="bg-white shadow-md rounded-xl p-5 mb-4 border hover:shadow-lg transition"
              >
                <div className="flex items-center space-x-4 mb-4">
                  {s.student?.profilePicture && (
                    <img
                      src={s.student.profilePicture}
                      alt="profile"
                      className="w-12 h-12 rounded-full border object-cover"
                    />
                  )}
                  <div>
                    <h4 className="text-lg font-semibold">{s.student?.name || "N/A"}</h4>
                    <p className="text-sm text-gray-500">
                      Roll No: {s.student?.rollNo || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`ml-auto text-sm px-3 py-1 rounded-full ${
                      s.status === "graded"
                        ? "bg-green-100 text-green-700"
                        : s.status === "reject"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.status || "pending"}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <a
                    href={s.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    📎 View File
                  </a>{" "}
                  • {new Date(s.createdAt).toLocaleString()}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                    <input
                      type="number"
                      min="0"
                      max={selectedAssignment?.marks || 100}
                      defaultValue={s.obtainedMarks || ""}
                      onChange={(e) =>
                        (s.obtainedMarks = Number(e.target.value))
                      }
                      className="border rounded px-3 py-1 w-24 focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-gray-600">
                      / {selectedAssignment?.marks || 100}
                    </span>
                  </div>

                  <div className="flex space-x-2 flex-wrap">
                    {(!s.status || s.status === "submitted") && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateSubmission(s._id, {
                              obtainedMarks: Number(s.obtainedMarks),
                              status: "graded",
                            })
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Grade
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateSubmission(s._id, { status: "reject" })
                          }
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {s.status === "graded" && (
                      <button
                        onClick={() =>
                          handleUpdateSubmission(s._id, {
                            obtainedMarks: Number(s.obtainedMarks),
                            status: "graded",
                          })
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Update Grade
                      </button>
                    )}
                    {s.status === "reject" && (
                      <button
                        onClick={() =>
                          handleUpdateSubmission(s._id, {
                            obtainedMarks: Number(s.obtainedMarks),
                            status: "graded",
                          })
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Grade Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal for Create/Edit Assignment */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ❌
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {editingAssignment ? "Edit Assignment" : "Create Assignment"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Title"
                className="border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
                className="border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={4}
              />
              <input
                type="number"
                value={formData.marks}
                onChange={(e) =>
                  setFormData({ ...formData, marks: e.target.value })
                }
                placeholder="Marks"
                className="border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <select
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value })
                }
                className="border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="border p-3 rounded"
              />

              <button
                type="submit"
                disabled={submitting}
                className={`py-3 rounded-lg text-white font-medium ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting
                  ? "Saving..."
                  : editingAssignment
                  ? "Update Assignment"
                  : "Create Assignment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
