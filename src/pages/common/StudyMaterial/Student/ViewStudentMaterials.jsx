import React, { useState, useEffect } from "react";
import api from "../../../../utils/axiosInstance";

export default function ViewStudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("titleAsc"); // options: titleAsc, titleDesc, subjectAsc, subjectDesc

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await api.get("/students/subjects");
      setSubjects(res.data);
    };
    fetchSubjects();
  }, []);

  // Fetch materials
  const fetchMaterials = async (subjectId = "all") => {
    setLoading(true);
    let url = "/study/student";
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

  // Filtered and sorted materials
  const filteredMaterials = materials
    .filter(
      (m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "titleAsc":
          return a.title.localeCompare(b.title);
        case "titleDesc":
          return b.title.localeCompare(a.title);
        case "subjectAsc":
          return a.subject.name.localeCompare(b.subject.name);
        case "subjectDesc":
          return b.subject.name.localeCompare(a.subject.name);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6 p-8">
      <h2 className="text-2xl font-bold text-gray-800">Study Materials</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
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
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="titleAsc">Title A-Z</option>
          <option value="titleDesc">Title Z-A</option>
          <option value="subjectAsc">Subject A-Z</option>
          <option value="subjectDesc">Subject Z-A</option>
        </select>
      </div>

      {/* Materials List */}
      {loading ? (
        <p className="text-gray-500">Loading materials...</p>
      ) : filteredMaterials.length === 0 ? (
        <p className="text-gray-500">No materials found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((m) => (
            <li
              key={m._id}
              className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white flex flex-col justify-between"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{m.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{m.subject.name}</p>
                <p className="text-gray-600 text-sm">{m.description}</p>
              </div>
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Material
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
