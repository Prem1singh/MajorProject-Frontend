import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function Teachers() {
  const user = useSelector((state) => state.user.data); // DepartmentAdmin

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // Selected teacher for edit
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const teachersPerPage = 5;

  // Sorting
  const [sortOrder, setSortOrder] = useState("asc");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Form state for adding
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    password: "",
  });

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/departmentAdmin/teachers");
      let data = res.data || [];

      data = data.sort((a, b) => {
        const empA = a.employeeId || "";
        const empB = b.employeeId || "";
        return sortOrder === "asc"
          ? empA.localeCompare(empB, "en", { numeric: true })
          : empB.localeCompare(empA, "en", { numeric: true });
      });

      setTeachers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [sortOrder]);

  // Delete teacher
  const handleDelete = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    setDeletingId(teacherId);
    try {
      await api.delete(`/departmentAdmin/teacher/${teacherId}`);
      toast.success("Deleted Successfully");
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Delete Failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Update teacher
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/departmentAdmin/teachers/${selectedTeacher._id}`, selectedTeacher);
      toast.success("Updated Successfully");
      setSelectedTeacher(null);
      setIsEditModalOpen(false);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Unable to Update");
    } finally {
      setActionLoading(false);
    }
  };

  // Add teacher
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post("/departmentAdmin/teacher", {
        ...addFormData,
        department: user?.profile?.department,
      });
      toast.success("Teacher added successfully!");
      setAddFormData({ name: "", email: "", employeeId: "", password: "" });
      setIsAddModalOpen(false);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Unable to add teacher");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered & paginated
  const filteredTeachers = teachers.filter((t) => {
    const search = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(search) ||
      t.email?.toLowerCase().includes(search) ||
      t.employeeId?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);
  const indexOfLast = page * teachersPerPage;
  const indexOfFirst = indexOfLast - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirst, indexOfLast);

  if (loading) return <p className="text-center p-3">Loading...</p>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between mb-1.5">
      <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
        Teachers
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 text-white md:px-4 md:py-2 px-3 py-1 rounded hover:bg-green-700"
        >
          ➕ Add Teacher
        </button>
        </div>
      

      {/* Search + Sort */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="text"
          placeholder="Search by name, email, or employee ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-72 p-2 border rounded"
        />
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sort by Employee ID ({sortOrder === "asc" ? "Ascending" : "Descending"})
        </button>
      </div>

      {/* Teachers Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border mb-6 min-w-[500px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Email</th>
              <th className="border px-3 py-2">Employee ID</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTeachers.length ? (
              currentTeachers.map((t) => (
                <tr key={t._id}>
                  <td className="border px-3 py-2">{t.name}</td>
                  <td className="border px-3 py-2">{t.email}</td>
                  <td className="border px-3 py-2">{t.employeeId}</td>
                  <td className="border px-3 py-2 space-x-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => {
                        setSelectedTeacher(t);
                        setIsEditModalOpen(true);
                      }}
                      className={`w-[60px] px-2 py-1 rounded text-white ${
                        actionLoading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {actionLoading ? "..." : "Edit"}
                    </button>
                    <button
                      disabled={deletingId === t._id}
                      onClick={() => handleDelete(t._id)}
                      className={`my-2 px-2 py-1 rounded text-white ${
                        deletingId === t._id
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {deletingId === t._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No teachers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
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

      {/* Edit Modal */}
      {isEditModalOpen && selectedTeacher && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Edit Teacher: {selectedTeacher.name}
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                value={selectedTeacher.name}
                onChange={(e) =>
                  setSelectedTeacher({ ...selectedTeacher, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Full Name"
                required
              />
              <input
                type="email"
                value={selectedTeacher.email}
                onChange={(e) =>
                  setSelectedTeacher({ ...selectedTeacher, email: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Email"
                required
              />
              <input
                type="text"
                value={selectedTeacher.employeeId || ""}
                onChange={(e) =>
                  setSelectedTeacher({
                    ...selectedTeacher,
                    employeeId: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                placeholder="Employee ID"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedTeacher(null);
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded text-white ${
                    actionLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {actionLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Teacher</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={addFormData.name}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, name: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Full Name"
                required
              />
              <input
                type="email"
                name="email"
                value={addFormData.email}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, email: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Email"
                required
              />
              <input
                type="text"
                name="employeeId"
                value={addFormData.employeeId}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, employeeId: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Employee ID"
                required
              />
              <input
                type="password"
                name="password"
                value={addFormData.password}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, password: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="Password"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded text-white ${
                    actionLoading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionLoading ? "Adding..." : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
