import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Aside from "./components/Aside";
import { useSelector } from "react-redux";
import { FiMenu, FiX } from "react-icons/fi";

export default function Layout() {
  const { data: user, loading } = useSelector((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Route change hone par mobile sidebar automatically close ho jaye
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-emerald-600 font-black italic tracking-widest uppercase text-[10px]">Initializing Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] font-sans">
      
      {/* --- HEADER (Fixed) --- */}
      <header className="h-[70px] fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-emerald-50 shadow-sm flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-xl bg-emerald-50 text-emerald-600 active:scale-90 transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={22} />
          </button>
          
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl rotate-3 flex items-center justify-center text-white font-black italic shadow-lg shadow-emerald-200">U</div>
            <span className="font-black italic text-slate-800 tracking-tighter text-2xl hidden sm:block">UniTrack</span>
          </div>
        </div>

        <Header />
      </header>

      {/* --- BODY WRAPPER --- */}
      <div className="flex flex-1 pt-[70px] overflow-hidden">
        
        {/* --- DESKTOP SIDEBAR (Static Scroll) --- */}
        <aside className="hidden lg:block w-[280px] h-full bg-white border-r border-emerald-50 overflow-y-auto custom-scrollbar">
          <Aside />
        </aside>

        {/* --- MOBILE SIDEBAR (Drawer & Overlay) --- */}
        <div className={`lg:hidden fixed inset-0 z-[110] transition-visibility duration-300 ${sidebarOpen ? "visible" : "invisible"}`}>
          {/* Backdrop Overlay */}
          <div 
            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`} 
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer */}
          <aside className={`absolute top-0 left-0 w-[280px] h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="p-5 border-b border-emerald-50 flex items-center justify-between bg-emerald-600 text-white">
              <span className="font-black italic uppercase tracking-widest text-xs">Navigation</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:rotate-90 transition-all">
                <FiX size={24} />
              </button>
            </div>
            <div className="h-[calc(100vh-65px)] overflow-y-auto custom-scrollbar">
              <Aside onItemClick={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </div>

        {/* --- MAIN CONTENT (Independent Scroll) --- */}
        <main className="flex-1 h-full overflow-y-auto p-4 lg:p-8 bg-[#f8fafc] custom-scrollbar">
          <div className="max-w-[1400px] mx-auto min-h-full flex flex-col">
            <div className="flex-1">
              <Outlet />
            </div>
            
            {/* Footer inside scroll area */}
            <footer className="mt-12 py-6 border-t border-slate-100 flex justify-between items-center opacity-40">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">UniTrack Portal</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">© {new Date().getFullYear()}</span>
            </footer>
          </div>
        </main>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}