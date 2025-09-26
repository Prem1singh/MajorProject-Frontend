import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/common/Cards";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../utils/axiosInstance";

export default function DepartmentAdminDashboard() {
  const [overview, setOverview] = useState({});
  const [studentsPerCourse, setStudentsPerCourse] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignmentsTrend, setAssignmentsTrend] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // start loader
        const res = await api.get("/departmentAdmin/overview");
        setOverview(res.data.overview || {});
        setStudentsPerCourse(res.data.studentsPerCourse || []);
        setAttendanceData(res.data.attendance || []);
        setAssignmentsTrend(res.data.assignmentsTrend || []);
        setRecentTeachers(res.data.recentTeachers || []);
      } catch (err) {
        console.error("Error fetching department admin overview", err);
      } finally {
        setLoading(false); // stop loader
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Students per Course */}
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Students per Course</h3>
          {studentsPerCourse.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studentsPerCourse}>
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Teachers */}
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Recently Added Teachers</h3>
          {recentTeachers.length > 0 ? (
            <ul className="space-y-2">
              {recentTeachers.map((teacher) => (
                <li
                  key={teacher._id}
                  className="border p-2 rounded-lg flex justify-between items-center hover:bg-gray-50"
                >
                  <span>{teacher.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No recent teachers</p>
          )}
        </Card>
      </div>
    </div>
  );
}
