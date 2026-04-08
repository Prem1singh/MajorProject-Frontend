import React, { useState, useEffect, useMemo } from "react";
import api from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FiMessageSquare, FiSend, FiTrash2, FiUser, 
  FiSearch, FiFilter, FiClock, FiCornerDownRight, FiPlus, FiInfo 
} from "react-icons/fi";

export default function StudentDoubtForum() {
  const [doubts, setDoubts] = useState([]);
  const [newDoubt, setNewDoubt] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doubts");
      setDoubts(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handlePostDoubt = async () => {
    if (!newDoubt.trim()) return toast.error("Please enter your doubt.");
    try {
      await api.post("/doubts", { question: newDoubt });
      setNewDoubt("");
      fetchDoubts();
      toast.success("Doubt posted!");
    } catch (err) {
      toast.error("Failed to post doubt.");
    }
  };

  const handleAddAnswer = async (doubtId, answer) => {
    if (!answer.trim()) return;
    try {
      await api.post(`/doubts/${doubtId}/answer`, { answer });
      fetchDoubts();
    } catch (err) {
      toast.error("Failed to post answer.");
    }
  };

  const handleDeleteDoubt = async (doubtId) => {
    if (!window.confirm("Remove this discussion?")) return;
    try {
      await api.delete(`/doubts/${doubtId}`);
      toast.success("Discussion deleted.");
      fetchDoubts();
    } catch (err) {
      toast.error("Failed to delete doubt.");
    }
  };

  const handleDeleteAnswer = async (doubtId, answerId) => {
    if (!window.confirm("Remove this answer?")) return;
    try {
      await api.delete(`/doubts/${doubtId}/answer/${answerId}`);
      fetchDoubts();
    } catch (err) {
      toast.error("Failed to delete answer.");
    }
  };

  const filteredDoubts = useMemo(() => {
    return doubts
      .filter((d) => {
        const search = searchTerm.toLowerCase();
        const studentName = d.student?.name || d.studentName || "";
        const batchName = d.student?.batch?.name || d.batchName || "";
        return (
          d.question.toLowerCase().includes(search) ||
          studentName.toLowerCase().includes(search) ||
          batchName.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        if (sortOrder === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
  }, [doubts, searchTerm, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc] animate-in fade-in duration-700">
      
      {/* Header Section */}
      <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-emerald-600 p-2 md:p-2.5 rounded-xl md:rounded-2xl text-white shadow-lg">
              <FiMessageSquare size={20} className="md:w-6 md:h-6" />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight italic uppercase leading-none">Community</h2>
          </div>
          <p className="text-emerald-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 italic">Peer-to-Peer Support</p>
        </div>
      </header>

      {/* Control Panel - Stacked on Mobile */}
      <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-emerald-50 mb-6 md:mb-10 flex flex-col xl:flex-row gap-3 md:gap-4">
        <div className="relative flex-grow group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl md:rounded-2xl py-3 md:py-4 pl-11 pr-4 outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-600 text-sm"
          />
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full xl:w-64 bg-slate-50 border-2 border-slate-50 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 font-bold text-slate-600 outline-none text-sm cursor-pointer shadow-inner"
        >
          <option value="latest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Ask Doubt Area - Stacked on Mobile */}
      <div className="bg-emerald-600 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-emerald-100 mb-8 md:mb-12 flex flex-col md:flex-row gap-3 md:gap-4 items-center">
        <input
          type="text"
          className="w-full bg-emerald-500/30 border-2 border-emerald-400/50 rounded-xl md:rounded-2xl p-3 md:p-4 outline-none placeholder:text-emerald-100 text-white font-bold text-sm md:text-base"
          placeholder="Stuck on a problem? Ask here..."
          value={newDoubt}
          onChange={(e) => setNewDoubt(e.target.value)}
        />
        <button
          onClick={handlePostDoubt}
          className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-white text-emerald-600 font-black rounded-xl md:rounded-2xl hover:bg-emerald-50 transition-all active:scale-95 text-[10px] md:text-xs tracking-widest uppercase"
        >
          Post
        </button>
      </div>

      {/* Doubts List */}
      {loading ? (
        <div className="space-y-4 md:space-y-6">
          {[1, 2].map(n => <div key={n} className="h-32 md:h-48 bg-white animate-pulse rounded-[1.5rem] md:rounded-[2.5rem]"></div>)}
        </div>
      ) : filteredDoubts.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-50 rounded-[2rem] py-16 text-center">
          <FiInfo className="mx-auto text-emerald-100 text-5xl mb-3" />
          <p className="text-slate-300 font-black uppercase tracking-widest text-[10px] italic">No discussions found</p>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-10">
          {filteredDoubts.map((doubt) => (
            <div key={doubt._id} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-10 border border-emerald-50 shadow-sm relative overflow-hidden">
              
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-[1.2rem] bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm md:text-lg">
                    {(doubt.student?.name || doubt.studentName || "A").charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                      <p className="text-xs md:text-sm font-black text-slate-800 leading-tight">
                        {doubt.student?.name || doubt.studentName || "User"}
                      </p>
                      {(doubt.student?.batch?.name || doubt.batchName) && (
                        <span className="w-fit bg-emerald-50 text-emerald-600 text-[7px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded border border-emerald-100 uppercase italic">
                          {doubt.student?.batch?.name || doubt.batchName}
                        </span>
                      )}
                    </div>
                    <p className="text-[8px] md:text-[10px] text-slate-300 font-black flex items-center gap-1 mt-1 uppercase italic">
                      <FiClock /> {new Date(doubt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {doubt.canDelete && (
                  <button onClick={() => handleDeleteDoubt(doubt._id)} className="p-2 text-slate-200 hover:text-rose-500 transition-all">
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>

              <p className="text-sm md:text-xl font-bold text-slate-700 mb-6 md:mb-10 pl-3 md:pl-2 italic border-l-4 border-emerald-500 leading-relaxed">
                "{doubt.question}"
              </p>

              {/* Answers Section */}
              <div className="space-y-3 md:space-y-4 md:ml-10">
                <p className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] md:tracking-[0.4em] mb-2 italic">Answers</p>
                {doubt.answers && doubt.answers.length > 0 ? (
                  doubt.answers.map((ans) => (
                    <div key={ans._id} className="flex justify-between items-start bg-slate-50/50 p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 group/ans hover:bg-white transition-all">
                      <div className="flex gap-2 md:gap-4">
                        <FiCornerDownRight className="text-emerald-300 mt-1 shrink-0" />
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                            <p className="text-[9px] md:text-[11px] font-black text-emerald-600 uppercase tracking-widest italic leading-none">
                              {ans.user?.name || ans.userName || "Peer"}
                            </p>
                            {(ans.user?.batch?.name || ans.userBatchName) && (
                              <span className="bg-white text-slate-400 text-[7px] md:text-[8px] font-black px-1 py-0.5 rounded border border-slate-100 uppercase italic">
                                {ans.user?.batch?.name || ans.userBatchName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed">{ans.text}</p>
                        </div>
                      </div>
                      {ans.canDelete && (
                        <button onClick={() => handleDeleteAnswer(doubt._id, ans._id)} className="md:opacity-0 group-hover/ans:opacity-100 p-1 text-rose-200 hover:text-rose-500 transition-all">
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-100 text-center">
                    <p className="text-[8px] text-slate-200 font-black uppercase tracking-widest">No replies yet</p>
                  </div>
                )}

                <AddAnswerInput doubtId={doubt._id} onAddAnswer={handleAddAnswer} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddAnswerInput({ doubtId, onAddAnswer }) {
  const [answer, setAnswer] = useState("");
  const handleSubmit = () => {
    if (!answer.trim()) return;
    onAddAnswer(doubtId, answer);
    setAnswer("");
  };

  return (
    <div className="flex gap-2 md:gap-3 mt-6">
      <input
        type="text"
        className="flex-1 bg-white border-2 border-slate-100 rounded-xl md:rounded-[1.5rem] py-3 md:py-4 px-4 md:px-6 outline-none focus:border-emerald-500 text-xs md:text-sm font-bold text-slate-700 transition-all shadow-inner"
        placeholder="Post solution..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        className="px-4 md:px-6 bg-slate-900 text-white rounded-xl md:rounded-[1.5rem] hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center justify-center"
      >
        <FiSend size={16} />
      </button>
    </div>
  );
}