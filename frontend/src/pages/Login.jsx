import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, UserPlus, Home } from "lucide-react";

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/preferences");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
      navigate("/preferences");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Decorative orbs */}
      <div className="fixed top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'var(--accent-glow)', opacity: 0.3 }} />
      <div className="fixed bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'var(--green-glow)', opacity: 0.3 }} />

      <form
        onSubmit={handleLogin}
        className="glass-card p-8 w-full max-w-md animate-fade-in relative z-10"
      >
        {/* Brand icon */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 animate-float">
            <svg viewBox="0 0 64 64" width="64" height="64" className="mx-auto">
              <defs>
                <linearGradient id="login-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-start)" />
                  <stop offset="100%" stopColor="var(--accent-end)" />
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="16" fill="url(#login-grad)" />
              <g fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="24" cy="26" r="6" />
                <path d="M16 42c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                <circle cx="40" cy="26" r="6" />
                <path d="M32 42c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </g>
              <circle cx="52" cy="12" r="5" fill="#34d399" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            RoomMateMatcher
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Sign in to find your perfect roommate
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2"
            style={{ background: 'var(--red-glow)', color: 'var(--red-soft)' }}>
            <span>⚠</span> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="dark-input pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="dark-input pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-gradient w-full mt-6 py-2.5 text-sm">
          <LogIn size={16} />
          Sign In
        </button>

        <p
          className="text-center mt-5 text-sm cursor-pointer transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onClick={() => navigate("/register")}
        >
          Don't have an account?{" "}
          <span className="font-semibold" style={{ color: 'var(--accent-text)' }}>
            <UserPlus size={14} className="inline mb-0.5 mr-0.5" />
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
