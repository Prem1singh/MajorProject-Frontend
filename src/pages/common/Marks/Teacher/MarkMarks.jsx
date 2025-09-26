// src/pages/marks/Teacher/MarkMarks.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function MarkMarks() {
  const user = useSelector((state) => state.user.data);

  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [examsForSubject, setExamsForSubject] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
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

  // Fetch exams for selected subject
  useEffect(() => {
    if (!subject) {
      setExamsForSubject([]);
      setExam("");
      return;
    }
    const fetchExams = async () => {
      try {
        const res = await api.get(`/teachers/exams?subject=${subject}`);
        setExamsForSubject(res.data || []);
        setExam("");
      } catch (err) {
        console.error("Error fetching exams:", err.response?.data || err.message);
        setExamsForSubject([]);
        setExam("");
      }
    };
    fetchExams();
  }, [subject]);

  // Fetch students for selected subject
  useEffect(() => {
    if (!subject) {
      setStudents([]);
      setMarksMap({});
      return;
    }
    const fetchStudents = async () => {
      try {
        const res = await api.get(`/teachers/subjects/${subject}/students`);
        const studentsData = res.data.students || [];
        setStudents(studentsData);

        const map = {};
        studentsData.forEach((s) => (map[s._id] = ""));
        setMarksMap(map);
      } catch (err) {
        console.error("Error fetching students:", err.response?.data || err.message);
        setStudents([]);
        setMarksMap({});
      }
    };
    fetchStudents();
  }, [subject]);

  const handleChange = (id, value) => {
    setMarksMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !exam) {
      alert("Please select subject and exam");
      return;
    }
    if (!students.length) {
      alert("No students found");
      return;
    }

    const records = students.map((s) => ({
      student: s._id,
      subject,
      exam,
      total: examsForSubject.find((ex) => ex._id === exam)?.totalMarks || 100,
      obtained: Number(marksMap[s._id]) || 0,
    }));

    setLoading(true);
    try {
      await api.post("/marks", { records });
      alert("Marks submitted successfully!");
      // Reset all states
      setSubject("");
      setExam("");
      setStudents([]);
      setMarksMap({});
      setExamsForSubject([]);
    } catch (err) {
      console.error("Error submitting marks:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to submit marks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">📝 Mark Marks</h2>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="border rounded-lg p-2 w-full"
          required
          disabled={!examsForSubject.length}
        >
          <option value="">Select Exam</option>
          {examsForSubject.map((ex) => (
            <option key={ex._id} value={ex._id}>
              {ex.name} (Total: {ex.totalMarks})
            </option>
          ))}
        </select>

        {/* Students Table */}
        {students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Roll No</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Marks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const totalMarks = examsForSubject.find((ex) => ex._id === exam)?.totalMarks || 100;
                  return (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="border p-2">{s?.rollNo || "-"}</td>
                      <td className="border p-2">{s.name}</td>
                      <td className="border p-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max={totalMarks}
                          value={marksMap[s._id]}
                          onChange={(e) => handleChange(s._id, e.target.value)}
                          className="border rounded p-1 w-20 text-center"
                          required
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Marks"}
        </button>
      </form>
    </div>
  );
}
