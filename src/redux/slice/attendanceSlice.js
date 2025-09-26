// redux/slices/attendanceSlice.js
import { createSlice } from "@reduxjs/toolkit";

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    records: [], // student/teacher attendance records
    loading: false,
    error: null,
  },
  reducers: {
    fetchAttendanceStart: (state) => {
      state.loading = true;
    },
    fetchAttendanceSuccess: (state, action) => {
      state.loading = false;
      state.records = action.payload;
    },
    fetchAttendanceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    markAttendance: (state, action) => {
      state.records.push(action.payload);
    },
  },
});

export const {
  fetchAttendanceStart,
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
  markAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
