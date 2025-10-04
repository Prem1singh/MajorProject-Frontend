import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";

export default function ManageTeachers() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 10;

  // 🔍 Search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch departments for dropdown
  useEffect(() => {
    api
      .get("/admin/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => setError("Failed to fetch departments"));
  }, []);

  // Fetch teachers whenever department changes
  useEffect(() => {
    if (!selectedDept) {
      setTeachers([]);
      return;
    }
    setCurrentPage(1); // reset page when dept changes
    fetchTeachers(selectedDept);
  }, [selectedDept]);

  const fetchTeachers = async (deptId) => {
    setLoading(true);
    try {
      const res = await api.get(`/access/admin/teachers/${deptId}`);
      setTeachers(res.data.teachers || []);
    } catch (err) {
      setError("Failed to fetch teachers.");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filter teachers based on search term
  const filteredTeachers = teachers.filter((t) => {
    const search = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(search) ||
      t.email.toLowerCase().includes(search) ||
      (t.employeeId?.toLowerCase().includes(search) ?? false) ||
      (t.subjects?.some((s) => s.name.toLowerCase().includes(search)) ?? false)
    );
  });

  // Pagination logic
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="md:text-2xl text-xl font-bold text-gray-800"> Teachers</h2>

      {/* Department Select + Search */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full sm:w-72 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">
              Search Teachers
            </label>
            <input
              type="text"
              placeholder="Search by name, email, employee ID, or subjects..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset page on search
              }}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 mb-4 font-medium bg-red-50 p-2 rounded-lg text-center">
          {error}
        </p>
      )}

      {/* Teachers Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-gray-600 text-center py-4">Loading teachers...</p>
        ) : currentTeachers.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">
            No teachers found.
          </p>
        ) : (
          <>
            <table className="w-full min-w-[500px] border rounded-lg shadow-md overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Employee ID</th>
                  <th className="px-4 py-3 text-left">Subjects</th>
                </tr>
              </thead>
              <tbody>
                {currentTeachers.map((teacher, idx) => (
                  <tr
                    key={teacher._id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="px-4 py-3">{teacher.name}</td>
                    <td className="px-4 py-3">{teacher.email}</td>
                    <td className="px-4 py-3">{teacher.employeeId || "N/A"}</td>
                    <td className="px-4 py-3">
                      {(teacher.subjects || []).map((s) => s.name).join(", ") ||
                        "No subjects"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
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
          </>
        )}
      </div>
    </div>
  );
}
