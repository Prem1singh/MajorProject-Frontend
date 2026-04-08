import React, { useState } from "react";
import api from "../utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiLock, FiShield, FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function ForgetPassword() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      await api.post(`/auth/reset-password/${id}`, { password });
      toast.success("Security credentials updated!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden px-4">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[420px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Branding */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200 -rotate-6 mb-6 border-4 border-white">
                <FiShield className="text-emerald-500 text-xl md:text-3xl" />
            </div>
            <h1 className="text-4xl font-black italic text-slate-800 tracking-tighter uppercase leading-none">Security</h1>
            <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Reset your access key</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-emerald-100/50 border border-white p-8 md:p-10">
          
          <h2 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-tight flex items-center gap-2 italic">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div> New Credentials
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">New Password</label>
              <div className="relative group">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Verify Password</label>
              <div className="relative group">
                <FiCheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] font-black uppercase text-rose-500 text-center tracking-widest bg-rose-50 py-2 rounded-xl border border-rose-100 animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Updating...
                </div>
              ) : (
                <><FiArrowRight /> Confirm Reset</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-slate-300 text-[9px] font-black uppercase tracking-[0.5em] italic">UniTrack Account Recovery Protocol</p>
      </div>
    </div>
  );
}