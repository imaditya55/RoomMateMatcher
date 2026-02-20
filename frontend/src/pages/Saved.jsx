import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Star, MapPin, Utensils, Sparkles, Volume2, Users, Bookmark
} from "lucide-react";

export default function Saved() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadSaved = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/"); return; }

      try {
        const res = await api.get("/user/saved");
        setSaved(res.data.saved || []);
      } catch (err) {
        setError("Failed to load saved roommates");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading saved…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg" style={{ color: 'var(--red-soft)' }}>⚠ {error}</span>
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-20 h-20 rounded-full flex items-center justify-center animate-float"
          style={{ background: 'var(--accent-glow)' }}>
          <Star size={36} style={{ color: 'var(--accent-text)' }} />
        </div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>
          No saved roommates yet
        </p>
        <button onClick={() => navigate("/matches")} className="btn-gradient text-sm mt-2">
          <Users size={14} />
          Browse Matches
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Bookmark size={22} style={{ color: 'var(--accent-text)' }} />
            Saved Roommates
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Quick access to your bookmarked profiles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((u, i) => (
            <div key={u._id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--green-start), var(--green-end))', color: 'white' }}
                >
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {u.name}
                  </h2>
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={11} /> {u.preferences?.location || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Preferences
                </h3>
                <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Utensils size={13} style={{ color: 'var(--accent-text)' }} /> Food: {u.preferences?.food || "—"}
                </p>
                <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Sparkles size={13} style={{ color: 'var(--accent-text)' }} /> Cleanliness: {u.preferences?.cleanliness ?? "—"}/10
                </p>
                <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Volume2 size={13} style={{ color: 'var(--accent-text)' }} /> Noise: {u.preferences?.noise ?? "—"}/10
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
