import React, { useState, useEffect } from "react";
import api from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function StudentDoubtForum() {
  const [doubts, setDoubts] = useState([]);
  const [newDoubt, setNewDoubt] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest"); // options: latest, oldest

  // Fetch doubts
  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doubts"); // backend returns canDelete flags
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  // Post new doubt
  const handlePostDoubt = async () => {
    if (!newDoubt.trim()) return toast.error("Please enter your doubt.");
    try {
      await api.post("/doubts", { question: newDoubt });
      setNewDoubt("");
      fetchDoubts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post doubt.");
    }
  };

  // Add answer
  const handleAddAnswer = async (doubtId, answer) => {
    if (!answer.trim()) return;
    try {
      await api.post(`/doubts/${doubtId}/answer`, { answer });
      fetchDoubts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post answer.");
    }
  };

  // Delete doubt
  const handleDeleteDoubt = async (doubtId) => {
    if (!window.confirm("Are you sure you want to delete this doubt?")) return;
    try {
      await api.delete(`/doubts/${doubtId}`);
      fetchDoubts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete doubt.");
    }
  };

  // Delete answer
  const handleDeleteAnswer = async (doubtId, answerId) => {
    if (!window.confirm("Are you sure you want to delete this answer?")) return;
    try {
      await api.delete(`/doubts/${doubtId}/answer/${answerId}`);
      fetchDoubts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete answer.");
    }
  };

  // Filter and sort doubts
  const filteredDoubts = doubts
    .filter(
      (d) =>
        d.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.studentName || "Anonymous").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      else return new Date(a.createdAt) - new Date(b.createdAt);
    });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Student Doubt Forum</h2>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Search doubts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Post a new doubt */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ask your doubt..."
          value={newDoubt}
          onChange={(e) => setNewDoubt(e.target.value)}
        />
        <button
          onClick={handlePostDoubt}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Post
        </button>
      </div>

      {/* Doubts list */}
      {loading ? (
        <p>Loading doubts...</p>
      ) : filteredDoubts.length === 0 ? (
        <p>No doubts match your search.</p>
      ) : (
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => (
            <div key={doubt._id} className="border rounded-lg p-4 bg-gray-50 relative">
              <p className="font-semibold">{doubt.studentName || "Anonymous"} asked:</p>
              <p className="mb-2">{doubt.question}</p>

              {/* Delete Doubt */}
              {doubt.canDelete && (
                <button
                  onClick={() => handleDeleteDoubt(doubt._id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}

              {/* Answers */}
              <div className="space-y-2 pl-4 border-l border-gray-300">
                {doubt.answers && doubt.answers.length > 0 ? (
                  doubt.answers.map((ans) => (
                    <div key={ans._id} className="flex justify-between items-center">
                      <p className="text-gray-700">
                        <span className="font-semibold">{ans.userName || "Someone"}:</span> {ans.text}
                      </p>
                      {ans.canDelete && (
                        <button
                          onClick={() => handleDeleteAnswer(doubt._id, ans._id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No answers yet.</p>
                )}

                {/* Add answer input */}
                <AddAnswerInput doubtId={doubt._id} onAddAnswer={handleAddAnswer} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add Answer Component
function AddAnswerInput({ doubtId, onAddAnswer }) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    onAddAnswer(doubtId, answer);
    setAnswer("");
  };

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        placeholder="Add your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Answer
      </button>
    </div>
  );
}
