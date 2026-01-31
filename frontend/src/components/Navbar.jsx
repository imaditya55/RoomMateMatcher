import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();     // 🔥 Completely remove token
    setIsLoggedIn(false);     // 🔥 Hide navbar immediately
    navigate("/");            // redirect to login
  };

  return (
    <nav className="px-6 py-4 shadow bg-white flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">RoomMateMatcher</h1>

      <div className="flex gap-6">
        <Link to="/matches">Matches</Link>
        <Link to="/preferences">Preferences</Link>
        <Link to="/profile">Profile</Link>

        <button onClick={handleLogout} className="text-red-500">
          Logout
        </button>
      </div>
    </nav>
  );
}
