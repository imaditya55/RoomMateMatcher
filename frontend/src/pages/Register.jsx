import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { User, Mail, Lock, UserPlus, LogIn } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Registration failed. Try another email."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'var(--accent-glow)', opacity: 0.25 }} />
      <div className="fixed bottom-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'var(--green-glow)', opacity: 0.25 }} />

      <div className="glass-card p-8 w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--green-start), var(--green-end))' }}>
            <UserPlus size={28} color="white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Join RoomMateMatcher and find your ideal roommate
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'var(--red-glow)', color: 'var(--red-soft)' }}>
            ⚠ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'var(--green-glow)', color: 'var(--green-text)' }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" className="dark-input pl-10" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="email" className="dark-input pl-10" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="password" className="dark-input pl-10" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-gradient-green w-full py-2.5 text-sm">
            <UserPlus size={16} />
            Create Account
          </button>
        </form>

        <p
          className="text-center mt-5 text-sm cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
          onClick={() => navigate("/")}
        >
          Already have an account?{" "}
          <span className="font-semibold" style={{ color: 'var(--accent-text)' }}>
            <LogIn size={14} className="inline mb-0.5 mr-0.5" />
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
