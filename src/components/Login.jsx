import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/slice/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiArrowRight, FiX, FiInfo } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);

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
    setLoadingLogin(true);
    try {
      const response = await api.post("/users/login", { email, password });
      dispatch(loginSuccess(response.data));
      toast.success("Welcome back to UniTrack!");
      
      const role = response.data.user.role;
      switch (role) {
        case "Teacher": navigate("/teacher/dashboard"); break;
        case "Admin": navigate("/admin/dashboard"); break;
        case "DepartmentAdmin": navigate("/department/dashboard"); break;
        case "Student": navigate("/student/dashboard"); break;
        default: navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoadingForgot(true);
    try {
      await api.post("auth/request-reset", { email: forgotEmail });
      setShowModal(false);
      toast.success("Recovery link dispatched to your inbox");
    } catch (error) {
      toast.error("Account recovery failed");
    } finally {
      setLoadingForgot(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden px-4">
      
      {/* Dynamic Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[420px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Branding Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2.5rem] shadow-2xl shadow-emerald-200 rotate-6 mb-6">
                <span className="text-white text-4xl font-black italic">U</span>
            </div>
            <h1 className="text-4xl font-black italic text-slate-800 tracking-tighter uppercase">UniTrack</h1>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Institutional Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-emerald-100/50 border border-white p-8 md:p-10 relative">
          
          <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight flex items-center gap-2 italic">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div> Sign In
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Email Identity</label>
              <div className="relative group">
                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loadingLogin}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between px-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secret Key</label>
                <button 
                  onClick={() => setShowModal(true)} 
                  type="button"
                  className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 tracking-widest italic"
                >
                  Lost Access?
                </button>
              </div>
              <div className="relative group">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loadingLogin}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loadingLogin ? "Authenticating..." : <><FiArrowRight /> Enter Portal</>}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-slate-300 text-[9px] font-black uppercase tracking-[0.5em] italic">Secure Gateway • CUH Edition</p>
      </div>

      {/* --- RECOVERY MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black italic uppercase tracking-widest text-sm flex items-center gap-2"><FiInfo /> Recovery Mode</h3>
                <p className="text-[10px] text-emerald-100 mt-1 uppercase font-bold tracking-widest">Verify your registered email</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:rotate-90 transition-all"><FiX size={24}/></button>
            </div>

            <form onSubmit={handleForgotPassword} className="p-8 space-y-6">
              <input
                type="email"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-8 font-bold outline-none focus:border-emerald-500 transition-all"
                placeholder="Enter registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={loadingForgot}
              />
              <button
                type="submit"
                disabled={loadingForgot}
                className="w-full bg-slate-900 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
              >
                {loadingForgot ? "Dispatching link..." : "Request Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}