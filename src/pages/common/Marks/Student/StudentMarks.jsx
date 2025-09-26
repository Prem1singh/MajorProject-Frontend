import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../utils/axiosInstance";

export default function StudentMarks() {
  const user = useSelector((state) => state.user.data);
  const [marksData, setMarksData] = useState([]);
  const [exams, setExams] = useState([]);

  // Fetch student's marks
  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await api.get("/marks/student");
        const marks = res.data || [];

        // get unique exams for table columns
        const uniqueExams = Array.from(
          new Map(marks.map((m) => [m.exam._id, m.exam])).values()
        );

        setExams(uniqueExams);
        setMarksData(marks);
      } catch (err) {
        console.error("Error fetching student marks:", err);
      }
    };

    fetchMarks();
  }, [user._id]);

  // Group marks by subject
  const groupedBySubject = marksData.reduce((acc, m) => {
    if (!acc[m.subject._id]) {
      acc[m.subject._id] = { subject: m.subject, exams: {} };
    }
    acc[m.subject._id].exams[m.exam._id] = m;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">📋 My Marks</h2>

      {marksData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border text-left">Subject</th>
                {exams.map((exam) => (
                  <th key={exam._id} className="p-2 border text-center">
                    {exam.name} <br />
                    <span className="text-xs text-gray-600">(/{exam.totalMarks})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedBySubject).map((row) => (
                <tr key={row.subject._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{row.subject.name}</td>
                  {exams.map((exam) => {
                    const mark = row.exams[exam._id];
                    return (
                      <td key={exam._id} className="p-2 border text-center font-semibold">
                        {mark ? mark.obtained : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">No marks available.</p>
      )}
    </div>
  );
}
