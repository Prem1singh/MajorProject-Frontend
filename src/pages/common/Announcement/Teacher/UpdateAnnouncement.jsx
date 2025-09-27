import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";

export default function UpdateAnnouncement() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [editing, setEditing] = useState(null); // announcement being edited
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Fetch teacher subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        console.log(res.data)
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch announcements when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get(`/announcements/subject/${selectedSubject}`);
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

  // Handle edit click
  const startEdit = (announcement) => {
    setEditing(announcement._id);
    setFormData({
      title: announcement.title,
      description: announcement.description,
    });
    setMsg("");
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;

    setLoading(true);
    setMsg("");

    try {
      await api.put(`/announcements/${editing}`, formData);
      setMsg("✅ Announcement updated successfully!");

      // Refresh list
      const res = await api.get(`/announcements/subject/${selectedSubject}`);
      setAnnouncements(res.data || []);
      setEditing(null);
      setFormData({ title: "", description: "" });
    } catch (err) {
      console.error("Error updating announcement", err);
      setMsg("❌ Failed to update announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-xl font-bold">Update Announcement</h2>

      {/* Subject Filter */}
      <div>
        <label className="block font-medium mb-1">Select Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        >
          <option value="">-- Choose Subject --</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Announcements List */}
      {selectedSubject && announcements.length > 0 ? (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li
              key={a._id}
              className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-600">{a.description}</p>
              </div>
              <button
                onClick={() => startEdit(a)}
                className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      ) : selectedSubject ? (
        <p className="text-gray-500">No announcements found for this subject.</p>
      ) : null}

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleUpdate} className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Edit Announcement</h3>

          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border px-3 py-2 rounded-lg"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Announcement"}
          </button>
        </form>
      )}

      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}
