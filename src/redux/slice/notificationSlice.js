// redux/slices/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      const notif = state.list.find((n) => n._id === id);
      if (notif) notif.read = true;
      state.unreadCount = state.list.filter((n) => !n.read).length;
    },
    clearNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAsRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
