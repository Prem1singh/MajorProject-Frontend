import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";

export default function CreateAnnouncement() {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch subjects teacher is assigned
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

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await api.post("/announcements", formData);
      setSuccessMsg("✅ Announcement created successfully!");
      setFormData({ subject: "", title: "", description: "" });
    } catch (err) {
      console.error("Error creating announcement", err);
      setErrorMsg("❌ Failed to create announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Announcement</h2>

      {successMsg && (
        <p className="text-green-600 mb-4">{successMsg}</p>
      )}
      {errorMsg && (
        <p className="text-red-600 mb-4">{errorMsg}</p>
      )}

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
            {subjects.map((subj) => (
              <option key={subj._id} value={subj._id}>
                {subj.name}
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
            placeholder="Enter announcement title"
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
            placeholder="Write details about the announcement..."
            rows="4"
            required
            className="w-full border px-3 py-2 rounded-lg"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Announcement"}
        </button>
      </form>
    </div>
  );
}
