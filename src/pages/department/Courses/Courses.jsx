// src/pages/CoursesPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [formData, setFormData] = useState({ name: "", code: "" });
  const [editingCourse, setEditingCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5;

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Sort
  const [sortAsc, setSortAsc] = useState(true);

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/courses");
      setCourses(res.data.courses || res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({ name: "", code: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({ name: course.name, code: course.code });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({ name: "", code: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, formData);
        toast.success("Course updated successfully");
      } else {
        await api.post("/courses", formData);
        toast.success("Course added successfully");
      }
      closeModal();
      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error(err.response?.data?.message || "Failed to save course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setDeleteLoadingId(id);
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error(err.response?.data?.message || "Failed to delete course");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Filter & Sort
  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);

  if (loading) return <p className="text-center py-4">Loading courses...</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between mb-1.5">
      <h2 className="md:text-2xl text-xl font-bold mb-4 text-center md:text-left">🎓 Courses</h2>
      <button
          onClick={openAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ➕ Add Course
        </button>
        </div>
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-4">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded flex-1 w-full sm:w-auto"
        />
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded"
        >
          Sort by Name {sortAsc ? "↑" : "↓"}
        </button>
       
      </div>

      {/* Courses Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Code</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCourses.length > 0 ? (
              currentCourses.map((course, idx) => (
                <tr
                  key={course._id}
                  className={`text-center ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                >
                  <td className="border p-2">{indexOfFirstCourse + idx + 1}</td>
                  <td className="border p-2">{course.name}</td>
                  <td className="border p-2">{course.code}</td>
                  <td className="border p-2 flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(course)}
                      disabled={actionLoading}
                      className={`${
                        actionLoading
                          ? "bg-yellow-300 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      } text-white px-2 py-1 rounded`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      disabled={deleteLoadingId === course._id}
                      className={`${
                        deleteLoadingId === course._id
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      } text-white px-2 py-1 rounded`}
                    >
                      {deleteLoadingId === course._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {editingCourse ? "Edit Course" : "Add Course"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Course Name"
                className="w-full p-2 border rounded"
                required
                disabled={actionLoading}
              />
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Course Code"
                className="w-full p-2 border rounded"
                required
                disabled={actionLoading}
              />
              <div className="flex justify-between gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 rounded text-white ${
                    actionLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {actionLoading
                    ? editingCourse
                      ? "Updating..."
                      : "Adding..."
                    : editingCourse
                    ? "Update Course"
                    : "Add Course"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
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
