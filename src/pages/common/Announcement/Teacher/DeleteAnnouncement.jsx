import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";

export default function DeleteAnnouncement() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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

  // Fetch announcements when subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/announcements/subject/${selectedSubject}`);
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error("Error fetching announcements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [selectedSubject]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    setLoading(true);
    setMsg("");

    try {
      await api.delete(`/announcements/${id}`);
      setMsg("✅ Announcement deleted successfully!");
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Error deleting announcement", err);
      setMsg("❌ Failed to delete announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-xl font-bold">Delete Announcement</h2>

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
      {loading ? (
        <p className="text-gray-500">Loading announcements...</p>
      ) : selectedSubject && announcements.length > 0 ? (
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
                onClick={() => handleDelete(a._id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : selectedSubject ? (
        <p className="text-gray-500">No announcements found for this subject.</p>
      ) : null}

      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}
