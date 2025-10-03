// src/pages/announcements/AnnouncementsManager.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";


export default function AnnouncementsManager() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [announcements, setAnnouncements] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Search & Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch teacher subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        let res;
        if (selectedSubject === "all") {
          res = await api.get("/announcements"); // fetch all announcements
        } else {
          res = await api.get(`/announcements/subject/${selectedSubject}`);
        }
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error("Error fetching announcements", err);
      }
    };
    fetchAnnouncements();
  }, [selectedSubject]);

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Open modal for create/edit
  const openModal = (announcement = null) => {
    if (announcement) {
      setEditing(announcement._id);
      setFormData({
        subject: announcement.subject?._id || selectedSubject,
        title: announcement.title,
        description: announcement.description,
      });
    } else {
      setEditing(null);
      setFormData({ subject: "", title: "", description: "" });
    }
    setMsg("");
    setShowModal(true);
  };

  // Submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      if (editing) {
        await api.put(`/announcements/${editing}`, formData);
        toast.success(" Announcement updated!");
      } else {
        await api.post("/announcements", formData);
        toast.success("Announcement created!");
      }
      // refresh list
      const res = await api.get(`/announcements/subject/${formData.subject}`);
      setAnnouncements(res.data || []);
      setShowModal(false);
    } catch (err) {
      console.error("Error saving announcement", err);
      toast.error("Failed to save announcement.");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Successfully Deleted ")
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Error deleting announcement", err);
      toast.error(" Failed to delete announcement.");
    }
  };

  // Apply search + sort
  const filteredAnnouncements = useMemo(() => {
    let data = announcements;

    // Search
    if (searchTerm) {
      data = data.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "newest") {
      data = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      data = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "az") {
      data = [...data].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "za") {
      data = [...data].sort((a, b) => b.title.localeCompare(a.title));
    }

    return data;
  }, [announcements, searchTerm, sortBy]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between mb-1.5">
      <h2 className="md:text-2xl text-xl font-bold mb-4"> Announcements</h2>
      <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Announcement
          </button>
          </div>
      {/* Subject Filter + Add Button */}
      <div className="mb-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex gap-3 w-full lg:w-auto">
                  <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full lg:w-auto"
          >
            <option value="all">-- All Subjects --</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

         
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full sm:w-60"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full sm:w-auto"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">Title A–Z</option>
            <option value="za">Title Z–A</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {selectedSubject && filteredAnnouncements.length > 0 ? (
        <ul className="space-y-3">
          {filteredAnnouncements.map((a) => (
            <li
              key={a._id}
              className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-600">{a.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(a)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : selectedSubject ? (
        <p className="text-gray-500">No announcements found.</p>
      ) : (
        <p className="text-gray-500">Select a subject to view announcements.</p>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4">
              {editing ? "Edit Announcement" : "Create Announcement"}
            </h3>

            {msg && <p className="mb-2">{msg}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block font-medium mb-1">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full border px-3 py-2 rounded-lg"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="w-full border px-3 py-2 rounded-lg"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
