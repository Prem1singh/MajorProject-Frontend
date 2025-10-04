import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId,setDeleteLoadingId]=useState(null)
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState(null);

  const initialForm = {
    company: "",
    role: "",
    package: "",
    eligibility: "",
    description: "",
    date: "",
    batches: [],
  };
  const [form, setForm] = useState(initialForm);

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
      toast.error("Failed to fetch placements");
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await api.get("/batches");
      setBatches(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batches");
    }
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditingPlacement(null);
    setIsModalOpen(true);
  };

  const openEditModal = (placement) => {
    setForm({
      company: placement.company,
      role: placement.role,
      package: placement.package,
      eligibility: placement.eligibility,
      description: placement.description,
      date: placement.date.split("T")[0],
      batches: placement.batches.map((b) => (typeof b === "string" ? b : b._id)), // <- ensures all are IDs
    });
    setEditingPlacement(placement);
    setIsModalOpen(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPlacement) {
        await api.put(`/placements/${editingPlacement._id}`, form);
        toast.success("Placement updated successfully");
      } else {
        await api.post("/placements", form);
        toast.success("Placement added successfully");
      }
      fetchPlacements();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save placement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this placement?")) return;
    setDeleteLoadingId(id);
    // setLoading(true);
    try {
      await api.delete(`/placements/${id}`);
      toast.success("Placement deleted successfully");
      fetchPlacements();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete placement");
    } finally {
      // setLoading(false);
      setDeleteLoadingId(null);
    }
  };

  // Search & Sort
  useEffect(() => {
    let data = [...placements];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          p.company.toLowerCase().includes(term) ||
          p.role.toLowerCase().includes(term) ||
          p.eligibility.toLowerCase().includes(term)
      );
    }

    if (sortOption === "date-asc") data.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortOption === "date-desc") data.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortOption === "company-asc") data.sort((a, b) => a.company.localeCompare(b.company));
    if (sortOption === "company-desc") data.sort((a, b) => b.company.localeCompare(a.company));

    setFilteredPlacements(data);
  }, [searchTerm, sortOption, placements]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between">
      <h1 className="md:text-2xl text-xl font-bold text-gray-800"> Placements</h1>
      <button
          onClick={openAddModal}
          className="bg-green-600 text-white md:px-4 px-3 md:py-2 py-1 rounded hover:bg-green-700"
        >
          ➕ Add Placement
        </button>
        </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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

      {/* Placements Grid */}
      {filteredPlacements.length === 0 ? (
        <p className="text-gray-500 mt-4">No placements found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredPlacements.map((p) => (
            <div
              key={p._id}
              className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-blue-700">{p.company}</h2>
                <p><strong>Role:</strong> {p.role}</p>
                <p><strong>Package:</strong> {p.package}</p>
                <p><strong>Eligibility:</strong> {p.eligibility}</p>
                <p><strong>Date:</strong> {new Date(p.date).toLocaleDateString()}</p>
                {p.description && <p className="mt-2">{p.description}</p>}
              </div>
              <div className="flex justify-between mt-3">
                <button
                  onClick={() => openEditModal(p)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  {deleteLoadingId==p._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-lg p-6 relative shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingPlacement ? "Edit Placement" : "Add Placement"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
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
              <div>
                <h3 className="font-semibold">Select Batches:</h3>
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
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (editingPlacement ? "Updating..." : "Adding...") : (editingPlacement ? "Update" : "Add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
