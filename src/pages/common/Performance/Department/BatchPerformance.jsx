import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../../../utils/axiosInstance";


export default function BatchPerformance() {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch batches on load
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        setBatches(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBatches();
  }, []);

  // Fetch subjects when batch changes
  useEffect(() => {
    if (!selectedBatch) return;
    const fetchSubjects = async () => {
      try {
        const res = await api.get(`/departmentAdmin/subjects/batch?batch=${selectedBatch}`);
        setSubjects(res.data);
        setSelectedSubject("");
        setPerformance(null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, [selectedBatch]);

  // Fetch batch performance
  const fetchPerformance = async () => {
    if (!selectedBatch) return alert("Select a batch first.");
    setLoading(true);
    try {
      let url = `/performance/department/batch?batch=${selectedBatch}`;
      if (selectedSubject) url += `&subject=${selectedSubject}`;
      const res = await api.get(url);
      setPerformance(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch performance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Batch Performance</h2>

      {/* Select Batch */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Select Batch</label>
        <select
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">-- Select Batch --</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Select Subject (Optional) */}
      {subjects.length > 0 && (
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Filter by Subject (optional)</label>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- All Subjects --</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Fetch Button */}
      <button
        onClick={fetchPerformance}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Fetching..." : "Get Performance"}
      </button>

      {/* Performance Table */}
      {performance && performance.subjects && performance.subjects.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-2">Subject-wise Average Marks</h3>
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-gray-700">Subject</th>
                {performance.exams.map((exam) => (
                  <th key={exam} className="p-3 text-left text-gray-700">{exam}</th>
                ))}
                <th className="p-3 text-left text-gray-700">Average</th>
              </tr>
            </thead>
            <tbody>
              {performance.subjects.map((subj, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3">{subj.subject}</td>
                  {performance.exams.map((exam) => (
                    <td key={exam} className="p-3">{subj.marks[exam] ?? "-"}</td>
                  ))}
                  <td className="p-3 font-semibold">{subj.average}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Batch Trend Chart */}
      {performance && performance.trend && performance.trend.length > 0 && (
        <div className="mt-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Batch Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performance.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exam" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
