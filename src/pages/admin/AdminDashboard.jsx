import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/common/Cards";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import api from "../../utils/axiosInstance";

export default function AdminDashboard() {
  const [overview, setOverview] = useState({});
  const [studentsPerDept, setStudentsPerDept] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/overview");

        // Map students per department and sort descending
        const mappedStudents = (res.data.studentsPerDept || [])
          .map((item) => ({
            department: item.department || item.name || "Unknown",
            students: item.students || item.count || 0,
          }))
          .sort((a, b) => b.students - a.students) // Descending order
          .slice(0, 10); // Only top 10 departments

        setOverview(res.data.overview || {});
        setStudentsPerDept(mappedStudents);
      } catch (err) {
        console.error("Error fetching admin overview", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: "Departments", value: overview.departments },
          { title: "Courses", value: overview.courses },
          { title: "Students", value: overview.students },
          { title: "Teachers", value: overview.teachers },
        ].map((item, idx) => (
          <Card key={idx} className="shadow-md rounded-2xl hover:shadow-lg transition">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-2xl font-bold text-indigo-600">{item.value || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Students per Department Chart */}
      <Card className="shadow-md rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-4">Top Departments by Students</h3>
        {studentsPerDept.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studentsPerDept}>
              <XAxis dataKey="department" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#6366f1" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No data available</p>
        )}
      </Card>
    </div>
  );
}
