import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function AddSubject() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacher: "",
    batch: "",
    semester: "",
    credit: "",
    type: "Core",
  });

  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, bRes] = await Promise.all([
          api.get("/departmentAdmin/teachers"),
          api.get("/batches"),
        ]);

        setTeachers(tRes.data);
        setBatches(bRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch teachers or batches");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "batch") {
      const selectedBatch = batches.find((b) => b._id === value);
      if (selectedBatch) {
        const options = Array.from({ length: selectedBatch.totalSem }, (_, i) => i + 1);
        setSemesterOptions(options);
        setFormData({ ...formData, batch: value, semester: "" });
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/departmentAdmin/subject", formData);
      toast.success("Subject added successfully!");
      setFormData({
        name: "",
        code: "",
        teacher: "",
        batch: "",
        semester: "",
        credit: "",
        type: "Core",
      });
      setSemesterOptions([]);
      setMessage("✅ Subject created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create subject");
      setMessage("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Add New Subject</h2>

      {message && (
        <div
          className={`p-2 mb-4 rounded ${
            message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Subject Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="text"
          name="code"
          placeholder="Subject Code"
          value={formData.code}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <select
          name="teacher"
          value={formData.teacher}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">Select Teacher</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          name="batch"
          value={formData.batch}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">Select Batch</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        {semesterOptions.length > 0 && (
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Semester</option>
            {semesterOptions.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          name="credit"
          placeholder="Credits"
          value={formData.credit}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
          min={1}
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Core">Core</option>
          <option value="Elective">Elective</option>
          <option value="Lab">Lab</option>
          <option value="Project">Project</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {loading ? "Creating..." : "Create Subject"}
        </button>
      </form>
    </div>
  );
}
