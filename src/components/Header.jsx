import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slice/userSlice";
import { ChevronDown } from "lucide-react";

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleDashboardNavigation = () => {
    if (user?.role === "Admin") {
      navigate("/admin/dashboard");
    } else if (user?.role === "Teacher") {
      navigate("/teacher/dashboard");
    } else if (user?.role === "Student") {
      navigate("/student/dashboard");
    } else if(user?.role=="DepartmentAdmin"){
      navigate("/department/dashboard");
    }
  };

  return (
    <header className="w-full bg-white shadow-md px-4 sm:px-6 py-3 flex justify-between items-center">
      {/* Company Name */}
      <h1
        className="text-lg sm:text-xl font-bold text-blue-600 cursor-pointer"
        onClick={handleDashboardNavigation}
      >
        UniTrack
      </h1>

      {/* User Profile with Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="hidden sm:block text-gray-700 font-medium">
            {user?.name || "Guest"}
          </span>
          <img
            src={
              user?.profileUrl ||
              "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
            }
            alt="Profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-300"
          />
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <ul className="py-2 text-sm">
              <li
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Profile
              </li>
              <li
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
