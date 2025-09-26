// src/pages/marks/Teacher/DeleteMarks.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function DeleteMarks() {
  const user = useSelector((state) => state.user.data);

  const [subject, setSubject] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch subjects assigned to teacher
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/teachers/subjects");
        setSubjectsForTeacher(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching subjects:", err.response?.data || err.message);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch exams for the selected subject
  useEffect(() => {
    if (!subject) {
      setExamTypes([]);
      setSelectedExam("");
      return;
    }

    const fetchExams = async () => {
      try {
        const res = await api.get(`/teachers/subjects/${subject}/students/exams`);
        setExamTypes(res.data.exams || []);
      } catch (err) {
        console.error("Error fetching exams:", err.response?.data || err.message);
        setExamTypes([]);
      }
    };

    fetchExams();
  }, [subject]);

  // Handle delete
  const handleDelete = async (e) => {
    e.preventDefault();

    if (!subject || !selectedExam) {
      alert("Please select both subject and exam");
      return;
    }

    if (!window.confirm("Are you sure you want to delete these marks?")) return;

    try {
      setLoading(true);
      await api.delete("/marks", {
        params: { subject, exam: selectedExam },
      });
      alert("Marks deleted successfully!");
      setSelectedExam("");
    } catch (err) {
      console.error("Error deleting marks:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete marks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">🗑️ Delete Marks</h2>
      <form onSubmit={handleDelete} className="flex flex-col space-y-4">
        {/* Subject Selection */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border rounded-lg p-2 w-full"
          required
        >
          <option value="">Select Subject</option>
          {subjectsForTeacher.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>

        {/* Exam Selection */}
        {examTypes.length > 0 && (
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="border rounded-lg p-2 w-full"
            required
          >
            <option value="">Select Exam</option>
            {examTypes.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.name} ({ex.totalMarks} Marks)
              </option>
            ))}
          </select>
        )}

        {/* Delete Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
        >
          {loading ? "Deleting..." : "Delete Marks"}
        </button>
      </form>
    </div>
  );
}
