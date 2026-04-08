import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slice/userSlice";
import { FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";

export default function Header() {
  const user = useSelector((state) => state.user.data);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Profile Button */}
      <button
        className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-emerald-50 transition-all cursor-pointer group"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <div className="relative">
          <img
            src={user?.profileUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=10b981&color=fff`}
            alt="Profile"
            className="w-9 h-9 rounded-xl object-cover border-2 border-white shadow-sm group-hover:border-emerald-200 transition-all"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-xs font-black text-slate-800 leading-tight tracking-tight uppercase italic">{user?.name || "Guest"}</p>
          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{user?.role || "Member"}</p>
        </div>
        
        <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl shadow-emerald-100/50 border border-emerald-50 z-[100] py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-slate-50 mb-1">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Info</p>
             <p className="text-sm font-bold text-slate-700 truncate">{user?.email}</p>
          </div>
          <ul className="px-2 space-y-1">
            <li>
              <button
                onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
              >
                <FiUser /> Profile Settings
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <FiLogOut /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}