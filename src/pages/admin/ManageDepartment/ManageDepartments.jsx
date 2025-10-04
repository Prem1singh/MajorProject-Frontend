import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Popup form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/departments");
      const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(sorted);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit (Add/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/department/${editingId}`, form);
        toast.success("Department Updated Successfully");
      } else {
        await api.post("/admin/department", form);
        toast.success("Department Added Successfully");
      }
      fetchDepartments();
      setShowForm(false);
      setForm({ name: "", code: "" });
      setEditingId(null);
    } catch (err) {
      toast.error(err.message || "Error saving department");
    } finally {
      setFormLoading(false);
    }
  };

  // Edit department → open popup with pre-filled data
  const handleEdit = (dept) => {
    setForm({ name: dept.name, code: dept.code });
    setEditingId(dept._id);
    setShowForm(true);
  };

  // Delete department
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/department/${id}`);
      toast.success("Deleted Successfully");
      fetchDepartments();
    } catch (err) {
      toast.error("Delete Failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter by search
  const filteredDepartments = departments.filter((dept) => {
    const search = searchTerm.toLowerCase();
    return (
      dept.name.toLowerCase().includes(search) ||
      dept.code.toLowerCase().includes(search)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDepartments = filteredDepartments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-gray-800"> Departments</h2>
        <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm({ name: "", code: "" });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            + Add 
          </button>
          </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
          />
         
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-600">Loading departments...</p>
      ) : filteredDepartments.length === 0 ? (
        <p className="text-gray-500">No departments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 border">#</th>
                <th className="p-3 border text-left">Department Name</th>
                <th className="p-3 border text-left">Department Code</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDepartments.map((dept, idx) => (
                <tr
                  key={dept._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 border text-center">
                    {indexOfFirstItem + idx + 1}
                  </td>
                  <td className="p-3 border">{dept.name}</td>
                  <td className="p-3 border">{dept.code}</td>
                  <td className="p-3 border text-center space-x-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      disabled={deletingId === dept._id}
                      className={`px-3 py-1 rounded-lg transition text-white ${
                        deletingId === dept._id
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {deletingId === dept._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Popup Modal for Add/Edit */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editingId ? "Edit Department" : "Add Department"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Department Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter department name"
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Department Code</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Enter department code"
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm({ name: "", code: "" });
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${
                    formLoading && "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {formLoading
                    ? editingId
                      ? "Updating..."
                      : "Adding..."
                    : editingId
                    ? "Update"
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
