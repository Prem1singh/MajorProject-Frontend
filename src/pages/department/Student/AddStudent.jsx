import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function AddStudent() {
  const user = useSelector((state) => state.user.data); // DepartmentAdmin user

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    password: "",
    batch: "",
  });

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches"); // endpoint to fetch batches
        setBatches(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch batches");
      }
    };
    fetchBatches();
  }, []);

  // Handle form field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        department: user?.department, // assign department from logged-in admin
      };

      await api.post("/departmentAdmin/student", payload);
      toast.success("Student added successfully!");
      setMessage("✅ Student added successfully!");
      setFormData({
        name: "",
        email: "",
        rollNo: "",
        password: "",
        batch: "",
      });
    } catch (err) {
      toast.error("Failed to add student");
      setMessage("❌ Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Add New Student</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-center font-medium ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Email */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* Roll No & Password */}
        <input
          type="text"
          name="rollNo"
          placeholder="Roll Number"
          value={formData.rollNo}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* Batch Selection */}
        <select
          value={formData.batch}
          name="batch"
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">Select Batch</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} - {b.year} {b.currentSem ? `(Sem ${b.currentSem})` : ""}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Adding..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}
