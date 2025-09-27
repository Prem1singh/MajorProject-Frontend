import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    company: "",
    role: "",
    package: "",
    eligibility: "",
    description: "",
    date: "",
    batches: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");

  useEffect(() => {
    fetchPlacements();
    fetchBatches();
  }, []);

  const fetchPlacements = async () => {
    try {
      const res = await api.get("/placements");
      setPlacements(res.data);
      setFilteredPlacements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get("/batches");
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/placements", form);
      setForm({
        company: "",
        role: "",
        package: "",
        eligibility: "",
        description: "",
        date: "",
        batches: [],
      });
      fetchPlacements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this placement?")) return;
    try {
      await api.delete(`/placements/${id}`);
      fetchPlacements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchChange = (batchId) => {
    setForm((prev) => {
      const alreadySelected = prev.batches.includes(batchId);
      return {
        ...prev,
        batches: alreadySelected
          ? prev.batches.filter((id) => id !== batchId)
          : [...prev.batches, batchId],
      };
    });
  };

  // Search & Sort
  useEffect(() => {
    let data = [...placements];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          p.company.toLowerCase().includes(term) ||
          p.role.toLowerCase().includes(term) ||
          p.eligibility.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortOption === "date-asc") data.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortOption === "date-desc") data.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortOption === "company-asc") data.sort((a, b) => a.company.localeCompare(b.company));
    if (sortOption === "company-desc") data.sort((a, b) => b.company.localeCompare(a.company));

    setFilteredPlacements(data);
  }, [searchTerm, sortOption, placements]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Manage Placements</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Add New Placement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Package"
            value={form.package}
            onChange={(e) => setForm({ ...form, package: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Eligibility"
            value={form.eligibility}
            onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded w-full"
        />

        {/* Batch selection */}
        <div>
          <h2 className="font-semibold">Select Batches:</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {batches.map((batch) => (
              <label key={batch._id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={batch._id}
                  checked={form.batches.includes(batch._id)}
                  onChange={() => handleBatchChange(batch._id)}
                />
                {batch.name}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Add Placement
        </button>
      </form>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by company, role, eligibility..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3"
        >
          <option value="date-desc">Date: Newest First</option>
          <option value="date-asc">Date: Oldest First</option>
          <option value="company-asc">Company: A-Z</option>
          <option value="company-desc">Company: Z-A</option>
        </select>
      </div>

      {/* Placements list */}
      {filteredPlacements.length === 0 ? (
        <p className="text-gray-500 mt-4">No placements found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredPlacements.map((p) => (
            <div key={p._id} className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-700">{p.company}</h2>
                <p><strong>Role:</strong> {p.role}</p>
                <p><strong>Package:</strong> {p.package}</p>
                <p><strong>Eligibility:</strong> {p.eligibility}</p>
                <p><strong>Date:</strong> {new Date(p.date).toLocaleDateString()}</p>
                <p><strong>Batches:</strong> {p.batches?.map((b) => b.name).join(", ")}</p>
                {p.description && <p className="mt-2">{p.description}</p>}
              </div>
              <button
                onClick={() => handleDelete(p._id)}
                className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
