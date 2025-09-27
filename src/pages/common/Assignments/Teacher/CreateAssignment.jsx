import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function CreateAssignment() {
  const user = useSelector((state) => state.user.data);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [marks, setMarks] = useState("");
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjectsForTeacher([]);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject) return alert("Please select a subject");

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("marks", marks);
      formData.append("subjectId", subject);
      formData.append("deadline", deadline);
      if (file) formData.append("file", file);

      await api.post("/assignments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Assignment created successfully!");
      setTitle("");
      setDescription("");
      setMarks("");
      setFile(null);
      setSubject("");
      setDeadline("");
    } catch (err) {
      console.error("Error creating assignment:", err);
      alert(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Create Assignment
      </h2>

      <form onSubmit={handleCreate} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />

        <textarea
          placeholder="Assignment Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          rows={4}
        />

        <input
          type="number"
          placeholder="Total Marks"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
          disabled={loadingSubjects}
        >
          <option value="">
            {loadingSubjects ? "Loading subjects..." : "Select Subject"}
          </option>
          {subjectsForTeacher.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
          <label htmlFor="deadline">Deadline</label>
        <input
          type="date"
          id="deadline"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          type="submit"
          className={`py-3 rounded-lg text-white font-medium transition ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Assignment"}
        </button>
      </form>
    </div>
  );
}
