import React, { useEffect } from 'react'
import {createBrowserRouter ,RouterProvider, useNavigate} from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from './Layout'
import Login from './components/Login'

import { useDispatch } from 'react-redux'
import { loadUserFromStorage } from './redux/slice/userSlice'
import ForgetPassword from "./components/ForgetPassword"


import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

import Assignments from "./pages/common/Assignments/Assignments";
import Attendance from "./pages/common/Attendance/Attendance";
import Marks from './pages/common/Marks/Marks'
import Announcement from "./pages/common/Announcement/Announcement";
import Profile from './components/Profile'
import ManageUsers from './pages/admin/ManageUser/ManageUsers'
import ManageDepartments from './pages/admin/ManageDepartment/ManageDepartments'
import DepartmentAdminDashboard from './pages/department/DepartmentDashboard'
import DeptTeachers from './pages/department/Teacher/DeptTeachers'
import DeptStudents from './pages/department/Student/DeptStudents'
import Courses from './pages/department/Courses/Courses'
import Batches from './pages/department/Batches/Batches'
import AddSubject from './pages/department/Subject/Subject'
import Exams from './pages/department/Exams/Exams'
import StudyMaterial from './pages/common/StudyMaterial/StudyMaterial';
import DepartmentMarksViewer from './pages/department/Marks/DepartmentMarksViewer';
import StudentDoubtForum from './pages/common/StudyMaterial/Student/StudentDoubtForum';
import Performance from './pages/common/performance/performance'

import AdminPlacements from './pages/department/Placement/Placements';
import StudentPlacements from './pages/student/Placements';

export default function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage()); // hydrate from localStorage
  }, [dispatch]);

const routes=createBrowserRouter(
  [
    {
      path:"",
      element:<Layout />,
      children:[
        {path:"/profile",element:<Profile/>},
        { path: "admin/dashboard", element: <AdminDashboard /> },
        { path: "admin/manageUser", element: <ManageUsers /> },
        { path: "/admin/departments", element: <ManageDepartments /> },
        // 🔹 Teacher Routes
        { path: "teacher/dashboard", element: <TeacherDashboard /> },
        { path: "teacher/assignments", element: <Assignments /> },
        { path: "teacher/attendance", element: <Attendance /> },
        { path: "teacher/marks", element: <Marks /> },
        { path: "teacher/Announcement", element: <Announcement /> },
        { path: "teacher/study", element: <StudyMaterial /> },
        { path: "teacher/performance", element: <Performance /> },
  
        // 🔹 Department Admin Routes
        { path: "department/dashboard", element: <DepartmentAdminDashboard /> }, 
        { path: "/department/teachers", element: <DeptTeachers /> },
        { path: "/department/students", element: <DeptStudents /> },
        { path: "/department/subjects", element: <AddSubject /> },
        { path: "/department/courses", element: <Courses /> },
        { path: "/department/batches", element: <Batches /> },
        { path: "/department/exams", element: <Exams /> },
        { path: "/department/marks", element: <DepartmentMarksViewer /> },{ path: "/department/placement", element: <AdminPlacements /> },
        { path: "/department/performance", element: <Performance /> },
        


        // 🔹 Student Routes
        { path: "student/dashboard", element: <StudentDashboard /> },
        { path: "student/assignments", element: <Assignments /> },
        { path: "student/attendance", element: <Attendance /> },
        { path: "student/marks", element: <Marks /> },
        { path: "student/Announcement", element: <Announcement /> },
        { path: "student/study", element: <StudyMaterial /> },
        { path: "student/doubt", element: <StudentDoubtForum /> },
        { path: "student/placement", element: <StudentPlacements /> },
        { path: "student/performance", element: <Performance /> },



    ],
    
    },{
      path:"/login",
      element:<Login/>
    },{
      path:"/auth/reset-password/:id",
      element:<ForgetPassword/>
    }
  ]

)
  return (
    <>
     <ToastContainer position="top-right" autoClose={3000} />
    <RouterProvider router={routes}></RouterProvider>
    </>
  )
}
