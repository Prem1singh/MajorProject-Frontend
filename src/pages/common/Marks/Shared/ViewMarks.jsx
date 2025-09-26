import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function ViewMarks() {
  const user = useSelector((state) => state.user.data);
  const [subject, setSubject] = useState("");
  const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
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

  // Fetch marks for selected subject
  const handleView = async () => {
    if (!subject) {
      alert("Please select a subject");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/marks", { params: { subject } });
      const marks = res.data || [];

      // Extract all exam keys dynamically
      const types = marks.length
        ? Array.from(
            new Set(
              marks.flatMap((m) =>
                Object.keys(m).filter((k) => k !== "student" && k !== "_id")
              )
            )
          )
        : [];

      setExamTypes(types);
      setMarksData(marks);
    } catch (err) {
      console.error("Error fetching marks:", err.response?.data || err.message);
      setMarksData([]);
      setExamTypes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">📊 View Marks</h2>

      {/* Subject Selection */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border rounded-lg p-2 flex-1"
        >
          <option value="">Select Subject</option>
          {subjectsForTeacher.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>

        <button
          onClick={handleView}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Load Marks
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading marks...</p>
      ) : marksData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white text-sm uppercase">
              <tr>
                <th className="p-3 border text-left">Roll No</th>
                <th className="p-3 border text-left">Name</th>
                {examTypes.map((ex) => (
                  <th key={ex} className="p-3 border text-center">
                    {ex}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marksData.map((s, idx) => (
                <tr
                  key={s.student?._id || idx}
                  className={`hover:bg-gray-50 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="p-2 border font-medium">{s.student?.rollNo}</td>
                  <td className="p-2 border">{s.student?.name}</td>
                  {examTypes.map((ex) => (
                    <td key={ex} className="p-2 border text-center font-semibold">
                      {s[ex] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">
          {subject ? "No marks found for this subject" : "Select a subject to view marks"}
        </p>
      )}
    </div>
  );
}
