import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/slice/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false); // 🔹 login loader
  const [loadingForgot, setLoadingForgot] = useState(false); // 🔹 forgot loader

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: user1, loading } = useSelector((state) => state.user);
  const user = user1?.data;

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoadingLogin(true);
    try {
      api
        .post("/users/login", { email, password })
        .then((response) => {
f
          dispatch(loginSuccess(response.data));
          toast.success("Login Successfully");

          const role = response.data.user.role;
          switch (role) {
            case "Teacher":
              navigate("/teacher/dashboard");
              break;
            case "Admin":
              navigate("/admin/dashboard");
              break;
            case "DepartmentAdmin":
              navigate("/department/dashboard");
              break;
            case "Student":
              navigate("/student/dashboard");
              break;
            default:
              navigate("/");
          }

          setMsg("Login successful!");
        })
        .catch(() => {
          toast.error("Unable to login");
          setMsg("Login failed");
        })
        .finally(() => setLoadingLogin(false));
    } catch (error) {
      setMsg("Login failed.");
      setLoadingLogin(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoadingForgot(true); // 🔹 start loader
    try {
      api
        .post("auth/request-reset", { email: forgotEmail })
        .then(() => {
          setShowModal(false);
          toast.success("Reset link sent to your email");
        })
        .catch(() => {
          toast.error("Unable to send reset link");
        })
        .finally(() => setLoadingForgot(false)); // 🔹 stop loader
    } catch (error) {
      setMsg("Unable to send reset link.");
      setLoadingForgot(false);
    }
  };

  return (
    <div className="loginPage min-h-screen flex items-center justify-center bg-gray-100 bg-[url('/bg.svg')] bg-cover bg-center px-4">
      {/* Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="logo w-full flex justify-center mb-4">
          <img className="h-[100px]" src="/logo.svg" alt="Logo" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="abc@gmail.com"
              className="mt-1 block w-full border border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loadingLogin}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="******"
              className="mt-1 block w-full border border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loadingLogin}
            />
          </div>
          <button
            type="submit"
            disabled={loadingLogin}
            className={`cursor-pointer w-full py-2 px-4 rounded-lg transition ${
              loadingLogin
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loadingLogin ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-sm text-right mt-2">
          <button
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => setShowModal(true)}
            type="button"
            disabled={loadingLogin}
          >
            Forgot password?
          </button>
        </div>
        {msg && <div className="mt-4 text-center text-red-500">{msg}</div>}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-40 px-4">
          <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={loadingForgot}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                  disabled={loadingForgot}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingForgot}
                  className={`px-3 py-1 rounded-lg transition ${
                    loadingForgot
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loadingForgot ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
