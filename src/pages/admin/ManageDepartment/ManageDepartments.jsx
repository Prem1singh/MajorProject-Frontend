import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", code: "" });
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔍 Search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/departments");
      // ✅ Sort departments alphabetically by name
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

  // Create or update department
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/department/${editingId}`, form);
        toast.success("Updated Successfully");
      } else {
        await api.post("/admin/department", form);
        toast.success("Added Successfully");
      }
      setForm({ name: "", code: "" });
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Edit department
  const handleEdit = (dept) => {
    setForm({ name: dept.name, code: dept.code });
    setEditingId(dept._id);
  };

  // Delete department
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      await api.delete(`/admin/department/${id}`);
      toast.success("Deleted Successfully");
      fetchDepartments();
    } catch (err) {
      toast.error("Delete Failed");
    }
  };

  // 🔍 Filter departments based on search term
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
  const currentDepartments = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Manage Departments
      </h2>

      {/* 🔍 Search Bar + Form */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
      
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1"
        >
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Department Name"
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
            disabled={formLoading}
          />
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Department Code"
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
            disabled={formLoading}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formLoading}
              className={`px-5 py-2 rounded-lg transition text-white ${
                formLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
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
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", code: "" });
                }}
                disabled={formLoading}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
       
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-72"
        />

      </div>

      {/* List */}
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
                      className="bg-yellow-500 w-[70px] hover:bg-yellow-600 text-white px-3 py-1 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="my-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition"
                    >
                      Delete
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
    </div>
  );
}
