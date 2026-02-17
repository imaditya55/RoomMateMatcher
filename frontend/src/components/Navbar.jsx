import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    [
      "px-3 py-2 rounded-lg text-sm font-medium transition",
      isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
    ].join(" ");

  const handleLogout = () => {
    localStorage.clear();     // 🔥 Completely remove token
    setIsLoggedIn(false);     // 🔥 Hide navbar immediately
    navigate("/");            // redirect to login
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/matches" className="text-xl font-bold text-blue-600">
          RoomMateMatcher
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <NavLink to="/matches" end className={navLinkClass}>
            Matches
          </NavLink>
          <NavLink to="/saved" end className={navLinkClass}>
            Saved
          </NavLink>
          <NavLink to="/preferences?edit=true" end className={navLinkClass}>
            Preferences
          </NavLink>
          <NavLink to="/profile" end className={navLinkClass}>
            Profile
          </NavLink>

          <button
            onClick={handleLogout}
            className="ml-1 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
