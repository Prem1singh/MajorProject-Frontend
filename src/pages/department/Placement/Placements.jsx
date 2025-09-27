import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";


export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
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

  useEffect(() => {
    fetchPlacements();
    fetchBatches();
  }, []);

  const fetchPlacements = () => {
    api.get("/placements")
      .then(res => setPlacements(res.data))
      .catch(err => console.error(err));
  };

  const fetchBatches = () => {
    api.get("/batches")
      .then(res => setBatches(res.data))
      .catch(err => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/placements", form);
      setForm({ company: "", role: "", package: "", eligibility: "", description: "", date: "", batches: [] });
      fetchPlacements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/placements/${id}`);
      fetchPlacements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchChange = (batchId) => {
    setForm(prev => {
      const alreadySelected = prev.batches.includes(batchId);
      return {
        ...prev,
        batches: alreadySelected
          ? prev.batches.filter(id => id !== batchId)
          : [...prev.batches, batchId],
      };
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Placements</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4 border p-4 rounded-lg">
        <input type="text" placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="border p-2 w-full" required />
        <input type="text" placeholder="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="border p-2 w-full" required />
        <input type="text" placeholder="Package" value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} className="border p-2 w-full" required />
        <input type="text" placeholder="Eligibility" value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} className="border p-2 w-full" required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border p-2 w-full" />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border p-2 w-full" required />

        {/* ✅ Batch selection */}
        <div>
          <h2 className="font-semibold">Select Batches:</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {batches.map(batch => (
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

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Placement</button>
      </form>

      {/* Placements list */}
      <div className="grid gap-4">
        {placements.map(p => (
          <div key={p._id} className="p-4 border rounded-lg shadow-md flex justify-between">
            <div>
              <h2 className="text-xl font-semibold">{p.company} - {p.role}</h2>
              <p><strong>Package:</strong> {p.package}</p>
              <p><strong>Eligibility:</strong> {p.eligibility}</p>
              <p><strong>Date:</strong> {new Date(p.date).toLocaleDateString()}</p>
              <p><strong>Batches:</strong> {p.batches?.map(b => b.name).join(", ")}</p>
              {p.description && <p>{p.description}</p>}
            </div>
            <button onClick={() => handleDelete(p._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
