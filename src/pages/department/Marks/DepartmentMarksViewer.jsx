import React, { useState, useEffect } from "react";
import api from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiUsers, FiBook, FiLayers, FiSearch, 
  FiChevronLeft, FiChevronRight, FiFilter, FiBarChart2 
} from "react-icons/fi";

export default function DepartmentMarksViewer() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [viewBy, setViewBy] = useState("student");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const marksPerPage = 8;

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        setBatches(res.data);
      } catch (err) {
        toast.error("Failed to load batches");
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    const fetchData = async () => {
      try {
        const [studentsRes, subjectsRes] = await Promise.all([
          api.get(`/departmentAdmin/students/batch?batch=${selectedBatch}`),
          api.get(`/departmentAdmin/subjects/batch?batch=${selectedBatch}`)
        ]);
        setStudents(studentsRes.data);
        setSubjects(subjectsRes.data);
        // Reset selections
        setSelectedStudent("");
        setSelectedSubject("");
        setMarks([]);
        setExams([]);
        setSearchTerm("");
        setCurrentPage(1);
      } catch (err) {
        toast.error("Error loading batch data");
      }
    };
    fetchData();
  }, [selectedBatch]);

  const fetchMarks = async () => {
    if (viewBy === "student" && !selectedStudent) return toast.error("Please select a student");
    if (viewBy === "subject" && !selectedSubject) return toast.error("Please select a subject");

    setLoading(true);
    try {
      let url = `/departmentAdmin/marks?batch=${selectedBatch}`;
      if (viewBy === "student") url += `&student=${selectedStudent}`;
      if (viewBy === "subject") url += `&subject=${selectedSubject}`;
      const res = await api.get(url);

      setExams(res.data.exams || []);
      setMarks(res.data.data || []);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Failed to fetch marks");
    } finally {
      setLoading(false);
    }
  };

  const filteredMarks = marks.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMarks = [...filteredMarks].sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));
  const totalPages = Math.ceil(sortedMarks.length / marksPerPage);
  const currentMarks = sortedMarks.slice((currentPage - 1) * marksPerPage, currentPage * marksPerPage);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">HOD Analytics</span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Department Marks Viewer</h2>
        </div>
        <p className="text-slate-500 font-medium">Analyze student performance across subjects and examinations.</p>
      </header>

      {/* Control Panel Card */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-emerald-50 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
          
          {/* Batch Select */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              <FiLayers className="text-emerald-500" /> Select Batch
            </label>
            <select
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">Choose Batch...</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              <FiFilter className="text-emerald-500" /> View Perspective
            </label>
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setViewBy("student")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${viewBy === "student" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <FiUsers size={18} /> Student
              </button>
              <button
                onClick={() => setViewBy("subject")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${viewBy === "subject" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <FiBook size={18} /> Subject
              </button>
            </div>
          </div>

          {/* Target Select */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              {viewBy === "student" ? <FiUsers className="text-emerald-500" /> : <FiBook className="text-emerald-500" />} 
              Specific {viewBy === "student" ? "Student" : "Subject"}
            </label>
            <select
              disabled={!selectedBatch}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none disabled:opacity-50"
              value={viewBy === "student" ? selectedStudent : selectedSubject}
              onChange={(e) => viewBy === "student" ? setSelectedStudent(e.target.value) : setSelectedSubject(e.target.value)}
            >
              <option value="">-- Select {viewBy === "student" ? "Student" : "Subject"} --</option>
              {(viewBy === "student" ? students : subjects).map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={fetchMarks}
            disabled={loading || !selectedBatch}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Syncing..." : <><FiBarChart2 /> Generate Report</>}
          </button>
          
          {marks.length > 0 && (
            <div className="flex-1 relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Quick search ${viewBy === "student" ? "subject" : "student"}...`}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-slate-600 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Results Table Section */}
      {currentMarks.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-emerald-50">
                    {viewBy === "subject" && <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>}
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {viewBy === "subject" ? "Student Name" : "Subject Name"}
                    </th>
                    {exams.map((exam) => (
                      <th key={exam} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{exam}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentMarks.map((m, i) => (
                    <tr key={i} className="hover:bg-emerald-50/30 transition-colors group">
                      {viewBy === "subject" && (
                        <td className="p-6 font-bold text-slate-400 group-hover:text-emerald-600">{m.rollNo || "N/A"}</td>
                      )}
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                            {m.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700">{m.name}</span>
                        </div>
                      </td>
                      {exams.map((exam) => (
                        <td key={exam} className="p-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-lg font-black ${m[exam] !== null ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-slate-300'}`}>
                            {m[exam] !== null && m[exam] !== undefined ? m[exam] : "--"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm font-bold text-slate-400">
                  Showing <span className="text-slate-700">{indexOfFirstMark + 1}</span> to <span className="text-slate-700">{Math.min(indexOfLastMark, sortedMarks.length)}</span> of {sortedMarks.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-black text-emerald-600 shadow-sm">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[2.5rem] py-20 text-center px-4">
          <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiBarChart2 className="text-emerald-500 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No marks report generated</h3>
          <p className="text-slate-400 mt-2 max-w-xs mx-auto">Configure the batch and perspective settings above to view the departmental performance records.</p>
        </div>
      )}
    </div>
  );
}

const indexOfLastMark = 0; // Handled dynamically in currentMarks logic now
const indexOfFirstMark = 0;