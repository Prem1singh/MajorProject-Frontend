import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { 
  FiBriefcase, FiMail, FiHash, FiBook, 
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiUsers 
} from "react-icons/fi";

export default function ManageTeachers() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Departments
  useEffect(() => {
    api.get("/admin/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => setError("Failed to fetch departments"));
  }, []);

  // 2. Fetch Teachers on Dept Change
  useEffect(() => {
    if (!selectedDept) {
      setTeachers([]);
      return;
    }
    setCurrentPage(1);
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

  const filteredTeachers = teachers.filter((t) => {
    const search = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(search) ||
      t.email.toLowerCase().includes(search) ||
      (t.employeeId?.toLowerCase().includes(search) ?? false) ||
      (t.subjects?.some((s) => s.name.toLowerCase().includes(search)) ?? false)
    );
  });

  const indexOfLast = currentPage * teachersPerPage;
  const indexOfFirst = indexOfLast - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* --- Filter & Search Section --- */}
      <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-6 flex items-center gap-2">
          <FiFilter /> Faculty Access Control
        </h3>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Department Select */}
          <div className="space-y-2 lg:w-1/3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Choose Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 px-6 font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-sm"
            >
              <option value="">-- Select Dept --</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          {/* Search Input */}
          <div className="space-y-2 flex-1 group">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Search Faculty Directory</label>
            <div className="relative">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, employee ID, or subject expertise..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl border border-rose-100 text-center font-bold text-xs uppercase tracking-widest">
          {error}
        </div>
      )}


     {/* --- Faculty Table --- */}
<div className="relative">
  {loading ? (
    <div className="py-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
      <p className="mt-4 text-emerald-500 font-black italic text-xs uppercase">Polling Faculty Data...</p>
    </div>
  ) : currentTeachers.length === 0 ? (
    <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[3rem]">
      <FiUsers className="mx-auto text-slate-100 text-7xl mb-4" />
      <p className="text-slate-300 font-black italic uppercase text-sm">No Faculty Members Found</p>
    </div>
  ) : (
    <>
      <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-sm bg-white">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-emerald-50/50 border-b border-emerald-100">
              <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest whitespace-nowrap">Faculty Identity</th>
              <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest whitespace-nowrap">Official Email</th>
              <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest whitespace-nowrap">Employee ID</th>
              <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest whitespace-nowrap">Assigned Subjects</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {currentTeachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-emerald-50/20 transition-all group">
                {/* Name Cell */}
                <td className="py-6 px-8 whitespace-nowrap">
                  <p className="font-bold text-slate-700">{teacher.name}</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic mt-0.5">Verified Faculty</p>
                </td>

                {/* Email Cell */}
                <td className="py-6 px-8 text-sm font-medium text-slate-500 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                     <FiMail className="text-emerald-400 shrink-0" /> {teacher.email}
                  </div>
                </td>

                {/* Employee ID Cell (Fixed) */}
                <td className="py-6 px-8 whitespace-nowrap">
                  <span className="inline-flex bg-slate-100 px-4 py-1.5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                     {teacher.employeeId || "NOT-ASSIGNED"}
                  </span>
                </td>

                {/* Subjects Cell */}
                <td className="py-6 px-8">
                  <div className="flex flex-wrap gap-2 max-w-[300px]"> {/* Fixed width to prevent row stretching */}
                    {(teacher.subjects || []).length > 0 ? (
                      teacher.subjects.map((s, sIdx) => (
                        <span key={sIdx} className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tight border border-emerald-100 whitespace-nowrap">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-300 italic font-bold whitespace-nowrap">No Specializations</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination remains the same... */}
    </>
  )}
</div>
    </div>
  );
}