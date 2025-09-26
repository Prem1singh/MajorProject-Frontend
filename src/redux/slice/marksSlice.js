// redux/slices/marksSlice.js
import { createSlice } from "@reduxjs/toolkit";

const marksSlice = createSlice({
  name: "marks",
  initialState: {
    list: [], // marks of subjects
    loading: false,
    error: null,
  },
  reducers: {
    fetchMarksStart: (state) => {
      state.loading = true;
    },
    fetchMarksSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchMarksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addMarks: (state, action) => {
      state.list.push(action.payload);
    },
    updateMarks: (state, action) => {
      state.list = state.list.map((m) =>
        m._id === action.payload._id ? action.payload : m
      );
    },
  },
});

export const {
  fetchMarksStart,
  fetchMarksSuccess,
  fetchMarksFailure,
  addMarks,
  updateMarks,
} = marksSlice.actions;

export default marksSlice.reducer;
