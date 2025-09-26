import React, { useState } from "react";
import api from "../utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgetPassword() {
  const { id } = useParams(); // token/id from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await api.post(`/auth/reset-password/${id}`, { password });
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-[url('/bg.svg')] bg-cover bg-center px-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="w-full flex justify-center mb-4">
          <img className="h-[100px]" src="/logo.svg" alt="Logo" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        {error && (
          <div className="mb-4 text-center text-red-500 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              placeholder="*****"
              className="mt-1 block w-full border border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              placeholder="*****"
              className="mt-1 block w-full border border-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="cursor-pointer w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
