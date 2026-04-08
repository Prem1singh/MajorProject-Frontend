import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../utils/axiosInstance";
import { updateProfile } from "../redux/slice/userSlice";
import { toast } from "react-toastify";
import { 
  FiUser, FiMail, FiHash, FiAward, 
  FiCamera, FiEdit3, FiX, FiSave, FiUploadCloud, FiFileText, FiEye 
} from "react-icons/fi";

export default function ProfileTab() {
  const user = useSelector((state) => state.user.data);
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batchName, setBatchName] = useState("-");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePicture: null,
    profilePicturePreview: "",
    outcomeType: "",
    outcomeCertificate: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        profilePicture: null,
        profilePicturePreview: user.profileUrl || `https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`,
        outcomeType: user.outcome?.type || "",
        outcomeCertificate: null,
      });

      // Batch only for students
      if (user.role === "Student" && user.batch) {
        api.get(`/batches/${user.batch}`)
          .then(res => setBatchName(res.data.name || "-"))
          .catch(() => setBatchName("-"));
      }
    }
  }, [user]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'profile') {
      setFormData(prev => ({ 
        ...prev, 
        profilePicture: file, 
        profilePicturePreview: URL.createObjectURL(file) 
      }));
    } else {
      setFormData(prev => ({ ...prev, outcomeCertificate: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      
      // Avatar is common for both
      if (formData.profilePicture) {
        data.append("profilePicture", formData.profilePicture);
      }

      // 🚨 CRITICAL FIX: Only send outcome data if user is a Student
      if (user?.role === "Student") {
        if (formData.outcomeType) data.append("outcomeType", formData.outcomeType);
        if (formData.outcomeCertificate) data.append("outcomeCertificate", formData.outcomeCertificate);
      }

      const res = await api.put("/users/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(updateProfile(res.data.user || res.data));
      toast.success("Profile Synchronized!");
      setShowModal(false);
    } catch (err) {
      // Backend error "Cannot read course of undefined" handles here
      const errorMsg = err.response?.data?.message || "Check backend controller logic";
      toast.error(`Update Failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-3xl font-black italic text-slate-800 tracking-tighter uppercase">User Identity </h2>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Verified Account Profile</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-slate-900 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <FiEdit3 /> Manage Profile
        </button>
      </div>

      {/* Main View Card */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-100/30 border border-emerald-50 overflow-hidden mb-10">
        <div className="h-32 bg-emerald-600"></div>
        <div className="px-10 pb-12 text-center sm:text-left">
          <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row items-center gap-8">
            <img 
              src={user?.profileUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff`} 
              className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover bg-white" 
              alt="Avatar"
            />
            <div className="mt-4 sm:mt-12">
              <h3 className="text-xl md:text-2xl font-black italic text-slate-800 mt-6 uppercase tracking-tighter leading-none">{user?.name}</h3>
              <p className="mt-2 inline-block bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border border-emerald-100">{user?.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-4">
               <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Official Email</span><span className="font-bold text-slate-700">{user?.email}</span></div>
               <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Account ID</span><span className="font-bold text-slate-700 uppercase tracking-tighter">{user?.role === "Student" ? user?.rollNo : user?.employeeId}</span></div>
            </div>
            
            {user?.role === "Student" && (
               <div className="space-y-4">
                  <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Academic Batch</span><span className="font-bold text-slate-700">{batchName}</span></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Career Outcome</span>
                    <span className="font-black text-emerald-600 italic uppercase text-xs tracking-tight">{user?.outcome?.type || "Not Set"}</span>
                  </div>
               </div>
            )}
            
            {user?.role !== "Student" && (
                <div className="space-y-4">
                    <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Designation</span><span className="font-bold text-slate-700">Department Faculty</span></div>
                    <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Status</span><span className="text-emerald-600 font-black text-xs uppercase tracking-widest">Permanent Account</span></div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- EDIT MODAL POPUP --- */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-black italic uppercase tracking-widest text-xs">Edit User Identity</h3>
              <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-all p-2"><FiX size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
              
              <div className="flex items-center gap-6 p-4 bg-emerald-50/30 rounded-3xl border border-emerald-50">
                <img src={formData.profilePicturePreview} className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-white shadow-lg bg-slate-100" />
                <label className="flex-1 cursor-pointer group">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-2xl py-4 hover:bg-white transition-all">
                    <FiUploadCloud className="text-emerald-500 mb-1 group-hover:scale-110 transition-transform" size={22} />
                    <span className="text-[9px] font-black uppercase text-slate-500">Change Photo</span>
                  </div>
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'profile')} accept="image/*" />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 transition-all" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Official Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 transition-all" required />
                </div>

                {/* Outcome only for Student */}
                {user?.role === "Student" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Outcome Category</label>
                      <select value={formData.outcomeType} onChange={(e) => setFormData({...formData, outcomeType: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                        <option value="">Select Outcome</option>
                        <option value="NET-JRF">NET-JRF Qualify</option>
                        <option value="IT">IT Industry</option>
                        <option value="GovtJob">Government Sector</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Outcome Evidence (Certificate)</label>
                      <label className="w-full flex items-center gap-4 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 cursor-pointer hover:border-emerald-300 transition-all overflow-hidden">
                         <FiFileText className="text-emerald-500" />
                         <span className="text-[10px] font-bold text-slate-500 truncate">{formData.outcomeCertificate ? formData.outcomeCertificate.name : "Select evidence file..."}</span>
                         <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'certificate')} accept=".pdf,image/*" />
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Processing..." : <><FiSave /> Sync Account</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}