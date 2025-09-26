import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/common/Cards";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import api from "../../utils/axiosInstance";

export default function StudentDashboard() {
  const [overview, setOverview] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignmentsTrend, setAssignmentsTrend] = useState([]);
  const [marksTrend, setMarksTrend] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true); // Loader state

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await api.get("/students/overview");
        const data = res.data;
        setOverview(data.overview || {});
        setAttendanceData(data.attendance || []);
        setAssignmentsTrend(data.assignmentsTrend || []);
        setMarksTrend(data.marksTrend || []);
        setUpcomingExams(data.upcomingExams || []);
      } catch (err) {
        console.error("Error fetching student overview", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="loader border-4 border-blue-400 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          { title: "Subjects Enrolled", value: overview.subjects },
          { title: "Assignments Pending", value: overview.pendingAssignments },
          { title: "Assignments Submitted", value: overview.submittedAssignments },
          {
            title: "Attendance",
            value: `${overview.attendancePresent || 0}/${overview.attendanceTotal || 0}`,
          },
        ].map((item, idx) => (
          <Card key={idx} className="shadow-md rounded-2xl hover:shadow-lg transition">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-2xl font-bold text-blue-600">{item.value || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Pie */}
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  dataKey="value"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#10b981"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center">No attendance data</p>
          )}
        </Card>

        {/* Assignment Submission Trend */}
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Assignments Trend</h3>
          {assignmentsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={assignmentsTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center">No assignment data</p>
          )}
        </Card>

        {/* Marks Trend */}
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Marks Trend</h3>
          {marksTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={marksTrend}>
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="marks" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center">No marks data</p>
          )}
        </Card>
      </div>

      {/* Upcoming Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Upcoming Exams</h3>
          {upcomingExams.length > 0 ? (
            <ul className="space-y-2">
              {upcomingExams.map((exam) => (
                <li
                  key={exam._id}
                  className="border p-2 rounded-lg flex justify-between items-center hover:bg-gray-50"
                >
                  <span>{exam.name}</span>
                  <span className="text-sm text-gray-500">{exam.date}</span>
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
