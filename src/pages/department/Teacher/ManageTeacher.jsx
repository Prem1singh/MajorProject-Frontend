import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // ✅ for update/delete
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const res = await api.get("/departmentAdmin/teachers");
      setTeachers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Delete teacher
  const handleDelete = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/departmentAdmin/teacher/${teacherId}`);
      toast.success("Deleted Successfully");
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Delete Failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Update teacher
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/departmentAdmin/teachers/${selectedTeacher._id}`, selectedTeacher);
      toast.success("Updated Successfully");
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Unable to Update");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Teachers</h2>

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
            {teachers.length ? (
              teachers.map((t) => (
                <tr key={t._id}>
                  <td className="border px-3 py-2">{t.name}</td>
                  <td className="border px-3 py-2">{t.email}</td>
                  <td className="border px-3 py-2">{t.employeeId}</td>
                  <td className="border px-3 py-2 space-x-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => setSelectedTeacher(t)}
                      className={`w-[60px] px-2 py-1 rounded text-white ${
                        actionLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {actionLoading ? "..." : "Edit"}
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleDelete(t._id)}
                      className={`my-2 px-2 py-1 rounded text-white ${
                        actionLoading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {actionLoading ? "..." : "Delete"}
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

      {/* Edit Teacher Form */}
      {selectedTeacher && (
        <div className="p-4 md:p-6 bg-white rounded-lg shadow-md mt-4">
          <h3 className="text-lg font-semibold mb-4">
            Edit Teacher: {selectedTeacher.name}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex flex-col sm:flex-row sm:space-x-2">
              <button
                type="submit"
                disabled={actionLoading}
                className={`px-4 py-2 rounded text-white ${
                  actionLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {actionLoading ? "Updating..." : "Update Teacher"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 mt-2 sm:mt-0"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
