import { createSlice } from "@reduxjs/toolkit";

const assignmentSlice = createSlice({
  name: "assignments",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchAssignmentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAssignmentsSuccess: (state, action) => {
      state.list = action.payload;
      state.loading = false;
    },
    fetchAssignmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchAssignmentsStart,
  fetchAssignmentsSuccess,
  fetchAssignmentsFailure,
} = assignmentSlice.actions;

export default assignmentSlice.reducer;
