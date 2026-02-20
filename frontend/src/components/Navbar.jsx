import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { disconnectSocket } from "../utils/socket";
import {
  Users, Inbox, Bookmark, MessageCircle, SlidersHorizontal, UserCircle,
  LogOut, Sun, Moon, Home
} from "lucide-react";

export default function Navbar({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const navLinkClass = ({ isActive }) =>
    [
      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20"
        : "hover:bg-[var(--bg-card)]"
    ].join(" ");

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)'
  });

  const handleLogout = () => {
    disconnectSocket();
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/matches"
          className="flex items-center gap-2 text-xl font-bold"
        >
          <svg viewBox="0 0 32 32" width="28" height="28" className="shrink-0">
            <defs>
              <linearGradient id="nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-start)" />
                <stop offset="100%" stopColor="var(--accent-end)" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#nav-grad)" />
            <text x="16" y="22.5" textAnchor="middle" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="18" fill="white">R</text>
          </svg>
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden sm:inline">
            RoomMateMatcher
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/matches" end className={navLinkClass} style={navLinkStyle}>
            <Users size={16} />
            <span className="hidden sm:inline">Matches</span>
          </NavLink>
          <NavLink to="/saved" end className={navLinkClass} style={navLinkStyle}>
            <Bookmark size={16} />
            <span className="hidden sm:inline">Saved</span>
          </NavLink>
          <NavLink to="/requests" end className={navLinkClass} style={navLinkStyle}>
            <Inbox size={16} />
            <span className="hidden sm:inline">Requests</span>
          </NavLink>
          <NavLink to="/chat" end className={navLinkClass} style={navLinkStyle}>
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Chat</span>
          </NavLink>
          <NavLink to="/preferences?edit=true" end className={navLinkClass} style={navLinkStyle}>
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Preferences</span>
          </NavLink>
          <NavLink to="/profile" end className={navLinkClass} style={navLinkStyle}>
            <UserCircle size={16} />
            <span className="hidden sm:inline">Profile</span>
          </NavLink>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle ml-1" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 ml-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ color: 'var(--red-soft)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-glow)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
