// src/pages/CoursesPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [editingCourse, setEditingCourse] = useState(null);

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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
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
      resetForm();
      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error(err.response?.data?.message || "Failed to save course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({ name: course.name, code: course.code });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error(err.response?.data?.message || "Failed to delete course");
    } finally {
      setActionLoading(false);
    }
  };

  // 🔍 Filter by search
  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔃 Sort by name
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortAsc) return a.name.localeCompare(b.name);
    else return b.name.localeCompare(a.name);
  });

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">🎓 Courses</h2>

      {/* Form */}
      <form className="mb-6 flex flex-col md:flex-row gap-3 items-center" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Course Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded flex-1 w-full md:w-auto"
          required
          disabled={actionLoading}
        />
        <input
          type="text"
          name="code"
          placeholder="Course Code"
          value={formData.code}
          onChange={handleChange}
          className="border p-2 rounded flex-1 w-full md:w-auto"
          required
          disabled={actionLoading}
        />
        <button
          type="submit"
          disabled={actionLoading}
          className={`${
            actionLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-2 rounded`}
        >
          {editingCourse
            ? actionLoading
              ? "Updating..."
              : "Update Course"
            : actionLoading
            ? "Adding..."
            : "Add Course"}
        </button>
        {editingCourse && (
          <button
            type="button"
            onClick={resetForm}
            disabled={actionLoading}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Search & Sort */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
          className="border p-2 rounded flex-1"
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
                      onClick={() => handleEdit(course)}
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
                      disabled={actionLoading}
                      className={`${
                        actionLoading
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      } text-white px-2 py-1 rounded`}
                    >
                      Delete
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

        {/* Pagination */}
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
      </div>
    </div>
  );
}
