import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";

export default function StudentPlacements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("dateLatest"); // options: dateLatest, dateOldest, packageHigh, packageLow

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/placements"); // backend filters by req.user.batch
      setPlacements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted Placements
  const filteredPlacements = placements
    .filter(
      (p) =>
        p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.eligibility || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "dateLatest") return new Date(b.date) - new Date(a.date);
      if (sortOption === "dateOldest") return new Date(a.date) - new Date(b.date);
      if (sortOption === "packageHigh") return (b.package || 0) - (a.package || 0);
      if (sortOption === "packageLow") return (a.package || 0) - (b.package || 0);
      return 0;
    });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Placement Opportunities</h1>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by company, role, or eligibility..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="dateLatest">Date: Latest First</option>
          <option value="dateOldest">Date: Oldest First</option>
          <option value="packageHigh">Package: High to Low</option>
          <option value="packageLow">Package: Low to High</option>
        </select>
      </div>

      {loading ? (
        <p>Loading placements...</p>
      ) : filteredPlacements.length === 0 ? (
        <p className="text-gray-500">No placement opportunities found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredPlacements.map((p) => (
            <div
              key={p._id}
              className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-blue-700">{p.company}</h2>
              <p className="text-gray-700"><strong>Role:</strong> {p.role}</p>
              <p className="text-gray-700"><strong>Package:</strong> {p.package}</p>
              <p className="text-gray-700"><strong>Eligibility:</strong> {p.eligibility}</p>
              <p className="text-gray-700"><strong>Date:</strong> {new Date(p.date).toLocaleDateString()}</p>
              {p.description && (
                <p className="text-gray-600 mt-2">{p.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
