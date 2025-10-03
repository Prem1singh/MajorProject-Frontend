import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function StudentCRUD() {
  const user = useSelector((state) => state.user.data);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    password: "",
    batch: "",
  });

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // ⭐ Batch filter state
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [page, setPage] = useState(1);
  const studentsPerPage = 10;

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        setBatches(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch batches");
      }
    };
    fetchBatches();
  }, []);

  // Fetch students (with batch filter)
  const fetchStudents = async (batchId = "all") => {
    try {
    
      setLoading(true);
      let url = "/departmentAdmin/students";
      if (batchId !== "all") url += `?batch=${batchId}`;
      const res = await api.get(url);
     
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(selectedBatchFilter);
  }, [selectedBatchFilter]);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (selectedStudent) {
      setSelectedStudent({ ...selectedStudent, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    if (selectedStudent) {
      setSelectedStudent({ ...selectedStudent, batch: batchId }); // ⭐ always store _id
    } else {
      setFormData({ ...formData, batch: batchId });
    }
  };

  // Add student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/departmentAdmin/student", {
        ...formData,
        department: user?.department,
      });
      toast.success("Student added successfully!");
      setFormData({ name: "", email: "", rollNo: "", password: "", batch: "" });
      setAddModalOpen(false);
      fetchStudents(selectedBatchFilter);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await api.delete(`/departmentAdmin/student/${id}`);
      toast.success("Student deleted successfully!");
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  };

  // Edit student
  const handleEdit = (student) => {
    // ⭐ make sure batch is stored as id for editing
    setSelectedStudent({
      ...student,
      batch: student.batch?._id || "",
    });
  };

  // Update student
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      await api.put(`/departmentAdmin/student/${selectedStudent._id}`, selectedStudent);
      toast.success("Student updated successfully!");
      setSelectedStudent(null);
      fetchStudents(selectedBatchFilter);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update student");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Filter + pagination
  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.rollNo?.toLowerCase().includes(term) ||
      s.batch?.name?.toLowerCase().includes(term)
    );
  });

  const sortedStudents = filteredStudents.sort((a, b) =>
    sortOrder === "asc"
      ? a.rollNo.localeCompare(b.rollNo, "en", { numeric: true })
      : b.rollNo.localeCompare(a.rollNo, "en", { numeric: true })
  );

  const indexOfLast = page * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between flex-col sm:flex-row gap-3">
        <h2 className="md:text-2xl text-xl font-semibold">Students</h2>

        {/* ⭐ Batch Filter */}
        <select
          value={selectedBatchFilter}
          onChange={(e) => setSelectedBatchFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Batches</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} {b.year ? `(${b.year})` : ""}
            </option>
          ))}
        </select>

        {/* Add Student Button */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Add Student
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-center my-4">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border p-2 rounded w-full sm:w-1/2"
          />
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sort Roll No ({sortOrder === "asc" ? "Asc" : "Desc"})
          </button>
        </div>

        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Roll No</th>
              <th className="border px-3 py-2 text-left">Batch</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{s.name}</td>
                  <td className="border px-3 py-2">{s.email}</td>
                  <td className="border px-3 py-2">{s.rollNo}</td>
                  <td className="border px-3 py-2">{s.batch?.name || "-"}</td>
                  <td className="border px-3 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Student Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-center">Add Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="Roll Number"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <select
                value={formData.batch}
                name="batch"
                onChange={handleBatchChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} {b.year ? `(${b.year})` : ""}
                  </option>
                ))}
              </select>
              <div className="flex justify-between gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Edit Student
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                name="name"
                value={selectedStudent.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="email"
                name="email"
                value={selectedStudent.email}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="text"
                name="rollNo"
                value={selectedStudent.rollNo}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              />
              <select
                value={selectedStudent.batch || ""}
                onChange={handleBatchChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} {b.year ? `(${b.year})` : ""}
                  </option>
                ))}
              </select>
              <div className="flex justify-between gap-2">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {updateLoading ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
