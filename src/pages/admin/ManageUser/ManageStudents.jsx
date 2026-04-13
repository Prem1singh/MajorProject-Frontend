import React, { useEffect, useState } from "react";
import api from "../../../utils/axiosInstance";
import { 
  FiUser, FiMail, FiHash, FiAward, FiFileText, 
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiList 
} from "react-icons/fi";

export default function ManageStudents() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Updated: Changed to state to allow user selection
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  // 1. Fetch Departments
  useEffect(() => {
    api.get("/admin/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => setError("Failed to fetch departments"));
  }, []);

  // 2. Fetch Courses
  useEffect(() => {
    if (!selectedDept) {
      setCourses([]); setSelectedCourse(null); setBatches([]); setSelectedBatch("");
      return;
    }
    api.get(`/admin/department/${selectedDept}/courses`)
      .then((res) => setCourses(res.data))
      .catch(() => setError("Failed to fetch courses"));
  }, [selectedDept]);

  // 3. Fetch Batches
  useEffect(() => {
    if (!selectedCourse) {
      setBatches([]); setSelectedBatch("");
      return;
    }
    api.get(`/admin/course/${selectedCourse._id}/batches`)
      .then((res) => setBatches(res.data.batches))
      .catch(() => setError("Failed to fetch batches"));
  }, [selectedCourse]);

  // 4. Fetch Students
  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]); return;
    }
    setCurrentPage(1);
    fetchStudents();
  }, [selectedBatch]);

  const fetchStudents = () => {
    setLoading(true);
    api.get(`/admin/batches/${selectedBatch}/students`)
      .then((res) => setStudents(res.data.students))
      .catch(() => setError("Failed to fetch students"))
      .finally(() => setLoading(false));
  };

  const filteredStudents = students.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search) ||
      s.rollNo?.toLowerCase().includes(search)
    );
  });

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;

  // Handle change for entries per page
  const handleEntriesChange = (e) => {
    setStudentsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing view size
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* --- Filter Section --- */}
      <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-6 flex items-center gap-2">
          <FiFilter /> Student Selection Filters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 px-6 font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="">Select Dept</option>
              {departments?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Course</label>
            <select
              value={selectedCourse?._id || ""}
              onChange={(e) => setSelectedCourse(courses.find((c) => c._id === e.target.value))}
              disabled={!courses.length}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 px-6 font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
            >
              <option value="">Select Course</option>
              {courses?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={!batches.length}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 px-6 font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all disabled:opacity-50"
            >
              <option value="">Select Batch</option>
              {batches?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* Search and Entries Control */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative group flex-grow">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Quick search by name, email or roll number..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl px-4 shadow-sm min-w-[180px]">
            <FiList className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase">Show:</span>
            <select 
              value={studentsPerPage} 
              onChange={handleEntriesChange}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl border border-rose-100 text-center font-bold text-xs uppercase tracking-widest">
          {error}
        </div>
      )}

      {/* --- Data Table --- */}
      <div className="relative">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-emerald-500 font-black italic text-xs uppercase">Syncing Roster...</p>
          </div>
        ) : currentStudents.length === 0 ? (
          <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[3rem]">
            <FiUser className="mx-auto text-slate-100 text-7xl mb-4" />
            <p className="text-slate-300 font-black italic uppercase text-sm">No Student Records Found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-sm bg-white">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest">Full Name</th>
                    <th className="py-6 px-8 text-left text-[10px] font-black uppercase text-emerald-700 tracking-widest">Identity / Email</th>
                    <th className="py-6 px-8 text-center text-[10px] font-black uppercase text-emerald-700 tracking-widest">Outcome</th>
                    <th className="py-6 px-8 text-center text-[10px] font-black uppercase text-emerald-700 tracking-widest">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {currentStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-emerald-50/20 transition-all group">
                      <td className="py-6 px-8">
                        <p className="font-bold text-slate-700">{s.name}</p>
                        <p className="text-[10px] font-black text-slate-400 italic">#{s.rollNo}</p>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                           <FiMail className="text-emerald-400" /> {s.email}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-center">
                        {s.outcome?.type ? (
                          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                            s.outcome.type === "NET-JRF" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            s.outcome.type === "IT" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100"
                          }`}>
                            {s.outcome.type}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-bold italic uppercase">Pending Update</span>
                        )}
                      </td>
                      <td className="py-6 px-8 text-center">
                        {s.outcome?.certificate ? (
                          <a href={s.outcome.certificate} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest">
                            <FiAward /> View Doc
                          </a>
                        ) : (
                          <FiFileText className="mx-auto text-slate-200" size={20} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center px-4 py-8 gap-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Displaying <span className="text-emerald-600">{indexOfFirst + 1} - {Math.min(indexOfLast, filteredStudents.length)}</span> of {filteredStudents.length} Students
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-20 transition-all"
                >
                  <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center px-6 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                  Page {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-20 transition-all"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}