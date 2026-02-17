import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Preferences from "./pages/Preferences";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // 🔥 Listen for token changes so UI updates instantly
  useEffect(() => {
    const updateLoginState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", updateLoginState);
    updateLoginState();

    return () => window.removeEventListener("storage", updateLoginState);
  }, []);

  return (
    <div>
      {isLoggedIn && <Navbar setIsLoggedIn={setIsLoggedIn} />}

      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/preferences"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Preferences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Matches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Saved />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
