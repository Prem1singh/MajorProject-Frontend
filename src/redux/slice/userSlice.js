import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: null,
  accessToken: null,
  refreshToken: null,
  loading: true, // 👈 start in loading mode
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.data = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.loading = false;

      // Save in localStorage
      localStorage.setItem(
        "auth",
        JSON.stringify({
          data: user,
          accessToken,
          refreshToken,
        })
      );
    },
    logout: (state) => {
      state.data = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      localStorage.removeItem("auth");
    },
    loadUserFromStorage: (state) => {
      const auth = localStorage.getItem("auth");
      if (auth) {
        const parsed = JSON.parse(auth);
        state.data = parsed.data;
        state.accessToken = parsed.accessToken;
        state.refreshToken = parsed.refreshToken;
      }
      state.loading = false; // 👈 hydration done
    },
    updateProfile: (state, action) => {
      state.data = { ...state.data, ...action.payload };
      localStorage.setItem(
        "auth",
        JSON.stringify({
          data: state.data,
          accessToken:state.accessToken,
          refreshToken:state.refreshToken,
        })
      );
    },
  },
});

export const { loginSuccess, logout, loadUserFromStorage, updateProfile } =
  userSlice.actions;
export default userSlice.reducer;
