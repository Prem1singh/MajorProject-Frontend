import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Aside from "./components/Aside";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react"; // menu icon

export default function Layout() {
  const { data: user, loading } = useSelector((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Callback to close sidebar on mobile
  const handleSidebarItemClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Your Header component */}
          <Header />
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-white border-r shadow z-40">
          <Aside onItemClick={handleSidebarItemClick} />
        </aside>

        {/* Sidebar (Mobile Drawer) */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <aside className="relative w-60 bg-white h-full shadow-lg z-50">
              <Aside onItemClick={handleSidebarItemClick} />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:ml-60">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
