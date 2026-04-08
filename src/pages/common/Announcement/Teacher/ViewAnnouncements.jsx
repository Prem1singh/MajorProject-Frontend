import React, { useEffect, useState, useMemo } from "react";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiPlus, FiSearch, FiEdit3, FiTrash2, FiBell, 
  FiFilter, FiBook, FiX, FiCalendar, FiClock 
} from "react-icons/fi";

export default function AnnouncementsManager() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        let res;
        if (selectedSubject === "all") {
          res = await api.get("/announcements");
        } else {
          res = await api.get(`/announcements/subject/${selectedSubject}`);
        }
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error("Error fetching announcements", err);
      }
    };
    fetchAnnouncements();
  }, [selectedSubject]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openModal = (announcement = null) => {
    if (announcement) {
      setEditing(announcement._id);
      setFormData({
        subject: announcement.subject?._id || selectedSubject,
        title: announcement.title,
        description: announcement.description,
      });
    } else {
      setEditing(null);
      setFormData({ subject: "", title: "", description: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/announcements/${editing}`, formData);
        toast.success("Notice updated successfully");
      } else {
        await api.post("/announcements", formData);
        toast.success("Notice broadcasted!");
      }
      const res = await api.get(selectedSubject === "all" ? "/announcements" : `/announcements/subject/${selectedSubject}`);
      setAnnouncements(res.data || []);
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to broadcast announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Broadcast will be removed. Confirm delete?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Announcement removed");
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const filteredAnnouncements = useMemo(() => {
    let data = [...announcements];
    if (searchTerm) {
      data = data.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortBy === "newest") data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "oldest") data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "az") data.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "za") data.sort((a, b) => b.title.localeCompare(a.title));
    return data;
  }, [announcements, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Notice Board Admin</span>
            <h2 className=" text-xl md:text-xl md:text-3xl font-black text-slate-800 tracking-tight italic">Announcements</h2>
          </div>
          <p className="text-slate-500 font-medium italic">Broadcast important updates and academic schedules to students.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 font-bold"
        >
          <FiPlus strokeWidth={3} /> Post New Notice
        </button>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 flex flex-col xl:flex-row gap-4 items-center">
        <div className="relative w-full xl:w-64">
          <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all appearance-none outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="relative flex-grow w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>

        <div className="relative w-full xl:w-56">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-50 rounded-xl font-bold text-slate-600 outline-none appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A-Z</option>
          </select>
        </div>
      </div>

      {/* Announcements Cards */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[2.5rem] py-24 text-center">
          <FiBell className="mx-auto text-emerald-100 text-6xl mb-4" />
          <p className="text-slate-400 font-bold italic">No announcements found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredAnnouncements.map((a) => (
            <div
              key={a._id}
              className="group bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/40 transition-all duration-500 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform"></div>
              
              <div className="relative flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl shadow-inner">
                    <FiBell size={24} className="animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(a)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <FiEdit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(a._id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-emerald-600 transition-colors tracking-tight">{a.title}</h3>
                <p className="text-emerald-600 font-black text-xs mb-4 flex items-center gap-2 uppercase tracking-widest italic">
                  <FiBook className="shrink-0" /> {a.subject?.name || "General Notice"}
                </p>
                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                  {a.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1"><FiCalendar /> {new Date(a.createdAt).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1"><FiClock /> {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            <div className="bg-emerald-600 p-10 text-white flex justify-between items-center relative">
              <div className="relative z-10">
                <h3 className="text-xl md:text-3xl font-black tracking-tight">{editing ? "Update Broadcast" : "New Announcement"}</h3>
                <p className="text-emerald-100 font-medium mt-1 italic">Authorized Communication Panel</p>
              </div>
              <FiBell size={50} className="opacity-10 absolute right-10 top-10" />
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 hover:bg-emerald-500 rounded-full transition-colors z-10"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 appearance-none"
                  required
                >
                  <option value="">Select Category...</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="e.g. Sessional Exam Postponed"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Broadcast Message</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  rows="4"
                  placeholder="Write the full details of the notice here..."
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-8 py-5 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-8 py-5 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  {loading ? "Syncing..." : editing ? "Update Notice" : "Confirm Broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}