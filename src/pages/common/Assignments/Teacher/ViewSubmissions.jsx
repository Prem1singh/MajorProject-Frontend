import React, { useEffect, useState } from "react";
import api from "../../../../utils/axiosInstance";

export default function ViewSubmissions() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Search state

  // Fetch teacher's assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/assignments/my");
        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error("Error fetching assignments", err);
      }
    };
    fetchAssignments();
  }, []);

  // Fetch submissions for selected assignment
  const fetchSubmissions = async (id) => {
    try {
      const res = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(res.data || []);
      setSelectedAssignment(assignments.find((a) => a._id === id));
      setSearchTerm(""); // Reset search when switching assignment
    } catch (err) {
      console.error("Error fetching submissions", err);
    }
  };

  // Update submission (marks/reject/grade)
  const handleUpdateSubmission = async (submissionId, updates) => {
    try {
      await api.patch(
        `/assignments/${selectedAssignment._id}/submissions/${submissionId}`,
        updates
      );
      setMessage("✅ Submission updated successfully!");
      fetchSubmissions(selectedAssignment._id);
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error("Error updating submission", err);
      setMessage("❌ Failed to update submission");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  // Submission Card
  const SubmissionCard = ({ submission }) => {
    const [marks, setMarks] = useState(submission.obtainedMarks || "");

    return (
      <div className="bg-white shadow-md rounded-xl p-5 mb-4 border hover:shadow-lg transition">
        <div className="flex items-center space-x-4 mb-4">
          {submission.student?.profilePicture && (
            <img
              src={submission.student.profilePicture}
              alt="profile"
              className="w-12 h-12 rounded-full border object-cover"
            />
          )}
          <div>
            <h4 className="text-lg font-semibold text-gray-800">
              {submission.student?.name || "N/A"}
            </h4>
            <p className="text-sm text-gray-500">
              🎓 Roll No: {submission.student?.rollNo || "N/A"}
            </p>
          </div>
          <span
            className={`ml-auto text-sm px-3 py-1 rounded-full ${
              submission.status === "graded"
                ? "bg-green-100 text-green-700"
                : submission.status === "reject"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {submission.status || "pending"}
          </span>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            📎 View File
          </a>{" "}
          • ⏰ {new Date(submission.createdAt).toLocaleString()}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-4">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <input
              type="number"
              min="0"
              max={selectedAssignment?.marks || 100}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="border rounded px-3 py-1 w-24 focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-gray-600">
              / {selectedAssignment?.marks || 100}
            </span>
          </div>

          <div className="flex space-x-2 flex-wrap">
            {(!submission.status || submission.status === "submitted") && (
              <>
                <button
                  onClick={() =>
                    handleUpdateSubmission(submission._id, {
                      obtainedMarks: Number(marks),
                      status: "graded",
                    })
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Grade
                </button>
                <button
                  onClick={() =>
                    handleUpdateSubmission(submission._id, { status: "reject" })
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </>
            )}

            {submission.status === "graded" && (
              <button
                onClick={() =>
                  handleUpdateSubmission(submission._id, {
                    obtainedMarks: Number(marks),
                    status: "graded",
                  })
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Grade
              </button>
            )}

            {submission.status === "reject" && (
              <button
                onClick={() =>
                  handleUpdateSubmission(submission._id, {
                    obtainedMarks: Number(marks),
                    status: "graded",
                  })
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Grade Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filter submissions by search term (name or roll no)
  const filteredSubmissions = submissions.filter((s) => {
    const name = s.student?.name || "";
    const roll = s.student?.rollNo || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📂 View Student Submissions
      </h2>

      {message && (
        <div className="mb-4 text-center p-2 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      {/* Assignment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {assignments.length > 0 ? (
          assignments.map((a) => (
            <div
              key={a._id}
              className="p-5 bg-white shadow-md rounded-lg hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-800">{a.title}</h3>
              <p className="text-sm text-gray-600">
                📘 Subject: {a.subject?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                ⏰ Deadline:{" "}
                {a.deadline ? new Date(a.deadline).toLocaleDateString() : "None"}
              </p>
              <button
                onClick={() => fetchSubmissions(a._id)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
              >
                View Submissions
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-2 text-center">
            No assignments found.
          </p>
        )}
      </div>

      {/* Submissions */}
      {selectedAssignment && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Submissions for:{" "}
            <span className="text-blue-600">{selectedAssignment.title}</span>
          </h3>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by student name or roll no"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />

          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((s) => <SubmissionCard key={s._id} submission={s} />)
          ) : (
            <p className="text-gray-500">No submissions match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
