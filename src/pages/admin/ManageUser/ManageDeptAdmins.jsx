import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ManageDeptAdmin() {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    departmentId: "",
  });
  const [editId, setEditId] = useState(null);

  // Fetch Department Admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/department-admins");
      setAdmins(res.data || []);
    } catch (err) {
      setError("Failed to fetch department admins.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data || []);
    } catch (err) {
      setError("Failed to fetch departments.");
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchDepartments();
  }, []);

  // Handle Input Change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Reset Form
  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", departmentId: "" });
    setEditId(null);
    setShowForm(false);
  };

  // Add or Update Admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editId) {
        await api.put(`/admin/department-admin/${editId}`, formData);
        toast.success("Updated Successfully");
      } else {
        await api.post("/admin/department-admin", formData);
        toast.success("Added Successfully");
      }
      resetForm();
      fetchAdmins();
    } catch (err) {
      toast.error("Unable to perform");
    } finally {
      setFormLoading(false);
    }
  };

  // Edit Admin
  const handleEdit = (admin) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      departmentId: admin.department?._id || "",
    });
    setEditId(admin._id);
    setShowForm(true);
  };

  // Delete Admin
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await api.delete(`/admin/department-admin/${id}`);
      toast.success("Deleted Successfully");
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error("Delete Failed");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          Manage Department Admins
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setFormData({ name: "", email: "", password: "", departmentId: "" });
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <FaPlus /> {showForm ? "Cancel" : "Add Admin"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-4 w-full max-w-lg mx-auto"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password {editId && "(Leave blank to keep current)"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring focus:ring-blue-300"
              required={!editId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring focus:ring-blue-300"
              required
            >
              <option value="">Select Department</option>
              {departments.length === 0 ? (
                <option disabled>No departments available</option>
              ) : (
                departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow w-full ${
              formLoading && "opacity-50 cursor-not-allowed"
            }`}
          >
            {editId ? "Update Admin" : "Add Admin"}
          </button>
        </form>
      )}

      {/* Error */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : admins.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            No department admins found.
          </p>
        ) : (
          <table className="w-full border rounded-lg shadow-md min-w-[500px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Name</th>
                <th className="p-3 border text-left">Email</th>
                <th className="p-3 border text-left">Department</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr
                  key={a._id}
                  className="hover:bg-gray-50 odd:bg-white even:bg-gray-50 transition duration-200"
                >
                  <td className="p-3 border">{a.name}</td>
                  <td className="p-3 border">{a.email}</td>
                  <td className="p-3 border">{a?.department?.name || "N/A"}</td>
                  <td className="p-3 border text-center flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 w-full sm:w-auto justify-center"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 w-full sm:w-auto justify-center"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
