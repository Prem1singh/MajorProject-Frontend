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
      toast.success("Doubt posted to the community!");
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
    if (!window.confirm("Remove this discussion permanently?")) return;
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
        // Option 1 logic: checking populated fields
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc] animate-in fade-in duration-700">
      
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-100">
              <FiMessageSquare size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase leading-none">Community Forum</h2>
          </div>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Peer-to-Peer Academic Support</p>
        </div>
      </header>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-50 mb-10 flex flex-col xl:flex-row gap-4">
        <div className="relative flex-grow group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search discussions, users or batch nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-6 outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-600 shadow-inner"
          />
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="xl:w-64 bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 font-bold text-slate-600 outline-none cursor-pointer focus:bg-white focus:border-emerald-500 transition-all shadow-inner appearance-none"
        >
          <option value="latest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Ask Doubt Area */}
      <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100 mb-12 flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          className="flex-1 w-full bg-emerald-500/30 border-2 border-emerald-400/50 rounded-2xl p-4 outline-none placeholder:text-emerald-100 text-white font-bold focus:bg-emerald-500/50 transition-all shadow-inner"
          placeholder="Stuck on a problem? Describe it for the community..."
          value={newDoubt}
          onChange={(e) => setNewDoubt(e.target.value)}
        />
        <button
          onClick={handlePostDoubt}
          className="w-full sm:w-auto px-10 py-4 bg-white text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all active:scale-95 shadow-lg uppercase text-xs tracking-[0.2em]"
        >
          Post
        </button>
      </div>

      {/* Doubts List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(n => <div key={n} className="h-48 bg-white/50 animate-pulse rounded-[2.5rem] border border-slate-50"></div>)}
        </div>
      ) : filteredDoubts.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[3rem] py-24 text-center">
          <FiInfo className="mx-auto text-emerald-100 text-6xl mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No active discussions found</p>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredDoubts.map((doubt) => (
            <div key={doubt._id} className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-emerald-50 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-lg shadow-inner">
                    {(doubt.student?.name || doubt.studentName || "A").charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-800 leading-none">
                        {doubt.student?.name || doubt.studentName || "Anonymous User"}
                      </p>
                      {/* Pulling Batch Name directly from Deep Population (Option 1) */}
                      {(doubt.student?.batch?.name || doubt.batchName) && (
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-widest italic">
                          {doubt.student?.batch?.name || doubt.batchName}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-black flex items-center gap-1 mt-1.5 uppercase tracking-widest italic">
                      <FiClock /> {new Date(doubt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {doubt.canDelete && (
                  <button onClick={() => handleDeleteDoubt(doubt._id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    <FiTrash2 size={20} />
                  </button>
                )}
              </div>

              <p className="text-xl font-bold text-slate-700 mb-10 pl-2 italic border-l-4 border-emerald-500 px-4 leading-relaxed">
                "{doubt.question}"
              </p>

              {/* Answers Section */}
              <div className="space-y-4 lg:ml-10">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4 italic">Community Answers</p>
                {doubt.answers && doubt.answers.length > 0 ? (
                  doubt.answers.map((ans) => (
                    <div key={ans._id} className="flex justify-between items-start bg-slate-50/50 p-5 rounded-3xl border border-slate-100 group/ans hover:bg-white hover:border-emerald-100 transition-all shadow-sm">
                      <div className="flex gap-4">
                        <FiCornerDownRight className="text-emerald-400 mt-1 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest italic leading-none">
                              {ans.user?.name || ans.userName || "Participant"}
                            </p>
                            {/* Option 1: Accessing Batch Name via Nested User Object */}
                            {(ans.user?.batch?.name || ans.userBatchName) && (
                              <span className="bg-white text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-slate-100 uppercase italic tracking-tighter shadow-sm">
                                {ans.user?.batch?.name || ans.userBatchName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed">{ans.text}</p>
                        </div>
                      </div>
                      {ans.canDelete && (
                        <button onClick={() => handleDeleteAnswer(doubt._id, ans._id)} className="opacity-0 group-hover/ans:opacity-100 p-2 text-rose-300 hover:text-rose-500 transition-all">
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <FiInfo /> Discussion Pending • Be the first to reply
                    </p>
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
    <div className="flex gap-3 mt-8">
      <input
        type="text"
        className="flex-1 bg-white border-2 border-slate-100 rounded-[1.5rem] py-4 px-6 outline-none focus:border-emerald-500 text-sm font-bold text-slate-700 transition-all shadow-inner"
        placeholder="Post a helpful solution..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        className="px-6 bg-slate-900 text-white rounded-[1.5rem] hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center justify-center"
      >
        <FiSend size={18} />
      </button>
    </div>
  );
}