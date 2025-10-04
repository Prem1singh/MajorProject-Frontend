import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ManageDeptAdmin() {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
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
      let fetched = res.data || [];

      fetched.sort((a, b) => {
        const deptA = a?.department?.name?.toLowerCase() || "";
        const deptB = b?.department?.name?.toLowerCase() || "";
        return deptA.localeCompare(deptB);
      });

      setAdmins(fetched);
    } catch (err) {
      setError("Failed to fetch department admins.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", departmentId: "" });
    setEditId(null);
    setShowForm(false);
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/admin/department-admin/${id}`);
      toast.success("Deleted Successfully");
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error("Delete Failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  // 🔍 Search
  const [searchTerm, setSearchTerm] = useState("");
  const filteredAdmins = admins.filter((a) => {
    const search = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(search) ||
      a.email.toLowerCase().includes(search) ||
      (a.department?.name.toLowerCase().includes(search) ?? false)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex justify-between w-full">
        <h2 className="md:text-2xl text-xl font-semibold text-gray-700">
           Department Admins
        </h2>
        <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setFormData({
                name: "",
                email: "",
                password: "",
                departmentId: "",
              });
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <FaPlus /> Add 
          </button>
          </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-lg w-full sm:w-64 focus:ring focus:ring-blue-300"
          />

         
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : filteredAdmins.length === 0 ? (
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
              {filteredAdmins.map((a) => (
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
                      disabled={deleteLoading === a._id}
                      className={`${
                        deleteLoading === a._id
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      } text-white px-3 py-1 rounded flex items-center gap-1 w-full sm:w-auto justify-center`}
                    >
                      {deleteLoading === a._id ? (
                        "Deleting..."
                      ) : (
                        <>
                          <FaTrash /> Delete
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔹 Popup Form (Modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Admin" : "Add Admin"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium mb-1">
                  Department
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring focus:ring-blue-300"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow ${
                    formLoading && "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {formLoading
                    ? editId
                      ? "Updating..."
                      : "Adding..."
                    : editId
                    ? "Update Admin"
                    : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
