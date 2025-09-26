import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/common/Cards";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../utils/axiosInstance";

export default function AdminDashboard() {
  const [overview, setOverview] = useState({});
  const [studentsPerDept, setStudentsPerDept] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignmentsTrend, setAssignmentsTrend] = useState([]);
  const [recentAdmins, setRecentAdmins] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // start loading
        const res = await api.get("/admin/overview");

        const mappedStudents = (res.data.studentsPerDept || []).map((item) => ({
          department: item.department || item.name || "Unknown",
          students: item.students || item.count || 0,
        }));

        const mappedAttendance = (res.data.attendance || []).map((item) => ({
          date: item.date || item._id || "Unknown",
          attendance: item.attendance || item.count || 0,
        }));

        const mappedAssignments = (res.data.assignmentsTrend || []).map((item) => ({
          date: item.date || item._id || "Unknown",
          assignments: item.assignments || item.count || 0,
        }));

        setOverview(res.data.overview || {});
        setStudentsPerDept(mappedStudents);
        setAttendanceData(mappedAttendance);
        setAssignmentsTrend(mappedAssignments);
        setRecentAdmins(res.data.overview.recentAdmins || []);
      } catch (err) {
        console.error("Error fetching admin overview", err);
      } finally {
        setLoading(false); // stop loading
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Students per Department */}
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Students per Department</h3>
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

      {/* Recent Department Admins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Recently Added Department Admins</h3>
          {recentAdmins.length > 0 ? (
            <ul className="space-y-2">
              {recentAdmins.map((admin) => (
                <li
                  key={admin._id}
                  className="border p-2 rounded-lg flex justify-between items-center hover:bg-gray-50"
                >
                  <span>{admin.name}</span>
                  <span className="text-gray-500 text-sm">{admin.department}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No recent admins</p>
          )}
        </Card>
      </div>
    </div>
  );
}
