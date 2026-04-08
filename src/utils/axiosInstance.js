import axios from "axios";
import store from "../redux/store";
import { loginSuccess, logout } from "../redux/slice/userSlice";

const api = axios.create({
  baseURL: "https://major-project-backend-roan.vercel.app/api",
  // baseURL: "http://localhost:3005/api",

});

// Add access token to headers
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.accessToken;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired token (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const state = store.getState();

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post("https://major-project-backend-roan.vercel.app/api/users/refresh-token", {
          refreshToken: state.user.refreshToken,  // ✅ matches backend now
        });

        store.dispatch(
          loginSuccess({
            user: state.user.data,
            accessToken: res.data.accessToken,
            refreshToken: state.user.refreshToken,
          })
        );

        // ✅ Retry the failed request with new access token
        originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed, logging out...");
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);


export default api;
