// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import assignmentSlice from "./slice/assignmentSlice";
import attendanceSlice from "./slice/attendanceSlice";
import marksSlice from "./slice/marksSlice";
import notificationSlice from "./slice/notificationSlice";
import userSlice from "./slice/userSlice";

const store = configureStore({
  reducer: {
    assignments: assignmentSlice,
    attendance: attendanceSlice,
    marks: marksSlice,
    notifications: notificationSlice,
    user: userSlice,
  },
});

export default store;
