// src/pages/CoursesPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); // for fetching
  const [actionLoading, setActionLoading] = useState(false); // ✅ for add/edit/delete
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [editingCourse, setEditingCourse] = useState(null);

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

  // Reset form
  const resetForm = () => {
    setEditingCourse(null);
    setFormData({ name: "", code: "" });
  };

  // Add or update course
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

  // Edit course
  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({ name: course.name, code: course.code });
  };

  // Delete course
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

  if (loading) return <p className="text-center py-4">Loading courses...</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">🎓 Courses</h2>

      {/* Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col md:flex-row gap-3 items-center"
      >
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
          {actionLoading
            ? editingCourse
              ? "Updating..."
              : "Adding..."
            : editingCourse
            ? "Update Course"
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
            {courses.length > 0 ? (
              courses.map((course, idx) => (
                <tr
                  key={course._id}
                  className={`text-center ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="border p-2">{idx + 1}</td>
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
      </div>
    </div>
  );
}
