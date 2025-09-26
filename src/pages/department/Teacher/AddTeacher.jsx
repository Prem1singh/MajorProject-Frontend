import React, { useState } from "react";
import api from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function AddTeacher() {
  const user = useSelector((state) => state.user.data); // DepartmentAdmin

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/departmentAdmin/teacher", {
        ...formData,
        department: user?.profile?.department,
      });
      toast.success("Teacher added successfully!");
      setMessage("✅ Teacher added successfully!");
      setFormData({ name: "", email: "", employeeId: "", password: "" });
    } catch (err) {
      console.error(err);
      toast.error("Unable to add teacher");
      setMessage("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Add New Teacher</h2>

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
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {loading ? "Adding..." : "Add Teacher"}
        </button>
      </form>
    </div>
  );
}
