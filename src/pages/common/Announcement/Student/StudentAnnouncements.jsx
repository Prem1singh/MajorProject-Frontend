import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function StudentAnnouncements() {
  const user = useSelector((state) => state.user.data);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

  // Fetch student subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/students/subjects"); 
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch announcements whenever selected subject changes
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        let url = "/announcements/student";
        if (selectedSubject !== "all") {
          url += `?subject=${selectedSubject}`;
        }
        const res = await api.get(url);
        setAnnouncements(res.data || []);
        setSearchTerm(""); // Reset search when changing subject
      } catch (err) {
        console.error("Error fetching announcements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [selectedSubject]);

  // Filtered and sorted announcements
  const filteredAnnouncements = announcements
    .filter(
      (a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold">My Announcements</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <label className="font-medium">Filter by Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded-lg flex-1"
        />

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Announcements List */}
      {loading ? (
        <p className="text-gray-500">Loading announcements...</p>
      ) : filteredAnnouncements.length > 0 ? (
        <ul className="space-y-4">
          {filteredAnnouncements.map((a) => (
            <li
              key={a._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{a.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{a.description}</p>
              <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                {a.subject?.name || "General"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-center">No announcements available</p>
      )}
    </div>
  );
}
