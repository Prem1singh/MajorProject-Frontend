import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function UpdateMarks() {
  const user = useSelector((state) => state.user.data);

  const [subject, setSubject] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch subjects for teacher
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
      setExamTypes([]);
      setSelectedExam("");
      setStudents([]);
      setMarksMap({});
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

  // Fetch students and prefilled marks when exam is selected
  useEffect(() => {
    if (!selectedExam || !subject) return;

    const fetchMarksForExam = async () => {
      try {
        const res = await api.get("/marks/exam", {
          params: { subject, exam: selectedExam },
        });

        const { students: studentList, exam } = res.data;
        setStudents(studentList || []);

        const map = {};
        (studentList || []).forEach((s) => {
          map[s._id] = s.obtained ?? "";
        });
        setMarksMap(map);

        if (exam) {
          setExamTypes((prev) =>
            prev.map((ex) =>
              ex._id === exam._id ? { ...ex, totalMarks: exam.totalMarks } : ex
            )
          );
        }
      } catch (err) {
        console.error("Error fetching marks for exam:", err.response?.data || err.message);
        setStudents([]);
        setMarksMap({});
      }
    };

    fetchMarksForExam();
  }, [selectedExam, subject]);

  const handleMarksChange = (studentId, value) => {
    setMarksMap((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExam || !students.length) {
      toast.error("No data to update");
      return;
    }

    const records = students.map((s) => ({
      student: s._id,
      subject,
      exam: selectedExam,
      obtained: Number(marksMap[s._id]) || 0,
      total: examTypes.find((ex) => ex._id === selectedExam)?.totalMarks || 100,
      addedBy: user._id,
    }));

    setLoading(true);
    try {
      await api.post("/marks", { records });
      toast.success("Marks updated successfully!");
    } catch (err) {
      console.error("Error updating marks:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update marks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">✏️ Update Marks</h2>
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
                {ex.name} ({ex.totalMarks})
              </option>
            ))}
          </select>
        )}

        {/* Students Table */}
        {students.length > 0 && selectedExam && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse border shadow rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Roll No</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Marks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{s?.rollNo}</td>
                    <td className="border p-2">{s.name}</td>
                    <td className="border p-2 text-center">
                      <input
                        type="number"
                        min={0}
                        max={examTypes.find((ex) => ex._id === selectedExam)?.totalMarks || 100}
                        value={marksMap[s._id] ?? ""}
                        onChange={(e) => handleMarksChange(s._id, e.target.value)}
                        className="border rounded p-1 w-20 text-center"
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit Button */}
        {students.length > 0 && selectedExam && (
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            {loading ? "Updating..." : "Update Marks"}
          </button>
        )}
      </form>
    </div>
  );
}
