import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";

export default function StudentPlacements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/placements"); // ✅ backend filters by req.user.batch
      setPlacements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Placement Opportunities</h1>

      {loading ? (
        <p>Loading placements...</p>
      ) : placements.length === 0 ? (
        <p className="text-gray-500">No placement opportunities available for your batch.</p>
      ) : (
        <div className="grid gap-4">
          {placements.map((p) => (
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
