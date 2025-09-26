import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function StudentAssignmentsView() {
  const user = useSelector((state) => state.user.data);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [pending, setPending] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileMap, setFileMap] = useState({}); // file per assignment
  const [submittingId, setSubmittingId] = useState(null);

  // Load subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user?.batch) return;
      try {
        const res = await api.get(`/batches/${user.batch}/subjects`);
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, [user]);

  // Load assignments when subject changes
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedSubject) return;
      setLoading(true);
      try {
        const res = await api.get(`/assignments/submissions/${selectedSubject}`);
        setPending(res.data.pending || []);
        setSubmitted(res.data.submitted || []);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [selectedSubject]);

  const handleSubmit = async (e, assignmentId) => {
    e.preventDefault();
    const file = fileMap[assignmentId];
    if (!file) return alert("Please select a file before submitting.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setSubmittingId(assignmentId);
      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Submitted successfully!");
      setFileMap((prev) => ({ ...prev, [assignmentId]: null }));

      // refresh assignments
      const res = await api.get(`/assignments/submissions/${selectedSubject}`);
      setPending(res.data.pending || []);
      setSubmitted(res.data.submitted || []);
    } catch (err) {
      console.error("Error submitting assignment", err);
      alert("Failed to submit assignment.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📚 My Assignments</h2>

      {/* Subject Selector */}
      <label className="block mb-2 font-medium">Select Subject:</label>
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="border p-2 rounded w-full max-w-sm mb-4"
      >
        <option value="">-- Select --</option>
        {subjects.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      {loading && <p>Loading assignments...</p>}

      {!loading && selectedSubject && (
        <>
          {/* Pending Assignments */}
          <h3 className="text-lg font-medium mt-4">📌 Pending Assignments</h3>
          {pending.length === 0 ? (
            <p className="text-gray-500">No pending assignments 🎉</p>
          ) : (
            pending
              .filter((a) => new Date(a.deadline) >= new Date())
              .map((a) => (
                <div
                  key={a._id}
                  className="bg-white p-4 shadow rounded mb-4 border"
                >
                  <h3 className="font-semibold">{a.title}</h3>
                  <p>{a.description}</p>
                  <p className="text-sm text-gray-600">
                    Deadline: {new Date(a.deadline).toLocaleDateString()}
                  </p>
                  {a.fileUrl && (
                    <a
                      href={a.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Download Assignment
                    </a>
                  )}

                  <form
                    onSubmit={(e) => handleSubmit(e, a._id)}
                    className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-2"
                  >
                    <input
                      type="file"
                      onChange={(e) =>
                        setFileMap((prev) => ({ ...prev, [a._id]: e.target.files[0] }))
                      }
                      className="border p-1 rounded mb-2 sm:mb-0"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingId === a._id}
                      className={`px-3 py-1 rounded text-white ${
                        submittingId === a._id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {submittingId === a._id ? "Submitting..." : "Submit"}
                    </button>
                  </form>
                </div>
              ))
          )}

          {/* Submitted Assignments */}
          <h3 className="text-lg font-medium mt-6">✅ Submitted Assignments</h3>
          {submitted.length === 0 ? (
            <p className="text-gray-500">No submitted assignments yet</p>
          ) : (
            submitted.map((a) => (
              <div
                key={a._id}
                className="bg-green-50 p-4 shadow rounded mb-4 border border-green-300"
              >
                <h3 className="font-semibold">{a.title}</h3>
                <p>{a.description}</p>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-bold underline"
                  href={a.fileUrl}
                >
                  Download
                </a>
                <p className="text-green-700 mt-1">Already Submitted ✅</p>
                {a.submission?.status === "graded" && (
                  <p className="font-medium">
                    Marks: {a.submission.obtainedMarks}/{a.marks}
                  </p>
                )}
                {a.submission?.status === "late" && (
                  <p className="text-red-600">Submitted Late ⏰</p>
                )}
                {a.submission?.status === "reject" && (
                  <p className="text-red-600">Rejected ❌</p>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
