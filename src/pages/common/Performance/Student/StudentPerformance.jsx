import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import api from "../../../../utils/axiosInstance";


export default function StudentPerformance() {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student performance
  const fetchPerformance = async () => {
    try {
      const res = await api.get("/performance/student"); // API endpoint for student performance
      setPerformance(res.data);
    } catch (err) {
      console.error("Error fetching performance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  if (loading) return <p>Loading performance...</p>;
  if (!performance) return <p>No performance data available.</p>;

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold text-gray-800">My Performance</h2>

      {/* 1️⃣ Marks Trend (Line Chart) */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Marks Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performance.marksTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="exam" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="marks" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2️⃣ Batch Comparison (Bar Chart) */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Comparison with Batch</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performance.batchComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="exam" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="myMarks" fill="#10b981" name="My Marks" />
            <Bar dataKey="batchAverage" fill="#f59e0b" name="Batch Average" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
