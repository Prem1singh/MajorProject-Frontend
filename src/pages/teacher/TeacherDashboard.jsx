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

export default function TeacherDashboard() {
  const [overview, setOverview] = useState({});
  const [studentsPerSubject, setStudentsPerSubject] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/teachers/overview");
        const data = res.data;
        setOverview(data.overview || {});
        setStudentsPerSubject(data.studentsPerSubject || []);
        setUpcomingExams(data.upcomingExams || []);
      } catch (err) {
        console.error("Error fetching teacher overview", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          { title: "My Subjects", value: overview.subjects },
          { title: "Students", value: overview.totalStudents },
          { title: "Assignments Given", value: overview.assignments },
          { title: "Assignments Submitted", value: overview.submittedAssignments },
          { title: "Attendance Today", value: `${overview.attendancePresent || 0}/${overview.attendanceTotal || 0}` },
        ].map((item, idx) => (
          <Card key={idx} className="shadow-md rounded-2xl hover:shadow-lg transition">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-2xl font-bold text-green-600">{item.value || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Students per Subject Chart */}
      <Card className="shadow-md rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-4">Students per Subject</h3>
        {studentsPerSubject.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsPerSubject}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">No data available</p>
        )}
      </Card>

      {/* Recent Assignments & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Assignments</h3>
          {(overview.recentAssignments || []).length > 0 ? (
            <ul className="space-y-2">
              {overview.recentAssignments.map((a) => (
                <li key={a._id} className="border p-2 rounded-lg flex justify-between hover:bg-gray-50">
                  <span>{a.title}</span>
                  <span className="text-sm text-gray-500">{new Date(a.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No recent assignments</p>
          )}
        </Card>

        {/* Upcoming Exams */}
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Upcoming Exams</h3>
          {upcomingExams.length > 0 ? (
            <ul className="space-y-2">
              {upcomingExams.map((exam) => (
                <li key={exam._id} className="border p-2 rounded-lg flex justify-between hover:bg-gray-50">
                  <span>{exam.name}</span>
                  <span className="text-sm text-gray-500">{new Date(exam.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No upcoming exams</p>
          )}
        </Card>
      </div>
    </div>
  );
}
