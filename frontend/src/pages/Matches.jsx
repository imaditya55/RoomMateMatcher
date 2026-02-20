import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  SlidersHorizontal, MessageCircle, Send, Bookmark, BookmarkX,
  Utensils, BedDouble, Volume2, Sparkles, CheckCircle2,
  Filter, ArrowUpDown, MapPin, UserCheck, XCircle
} from "lucide-react";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLocation, setMyLocation] = useState("");
  const [myGender, setMyGender] = useState("");
  const [minMatchPercent, setMinMatchPercent] = useState(0);
  const [sameBlockOnly, setSameBlockOnly] = useState(false);
  const [sameGenderOnly, setSameGenderOnly] = useState(false);
  const [sortBy, setSortBy] = useState("best");
  const navigate = useNavigate();

  const sleepLabels = {
    0: "Early sleeper (9–10 PM)",
    1: "Normal sleeper (11–12)",
    2: "Late sleeper (12–1 AM)",
    3: "Very late sleeper"
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    const fetchMatches = async () => {
      try {
        const [matchesRes, profileRes] = await Promise.all([
          api.get("/user/matches"),
          api.get("/user/profile")
        ]);

        setMatches(matchesRes.data.matches || []);
        setMyLocation(profileRes.data.user?.preferences?.location || "");
        setMyGender(profileRes.data.user?.preferences?.gender || "");
      } catch (err) {
        console.error("Error loading matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  const getMatchPercent = (m) => Math.min(100, Math.round((m.score / 60) * 100));

  const visibleMatches = useMemo(() => {
    const filtered = matches.filter((m) => {
      const pct = getMatchPercent(m);
      if (pct < minMatchPercent) return false;

      if (sameBlockOnly && myLocation) {
        return (m.user?.preferences?.location || "") === myLocation;
      }
      if (sameGenderOnly && myGender) {
        return (m.user?.preferences?.gender || "") === myGender;
      }
      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === "best") return getMatchPercent(b) - getMatchPercent(a);
      if (sortBy === "worst") return getMatchPercent(a) - getMatchPercent(b);
      if (sortBy === "name") return (a.user?.name || "").localeCompare(b.user?.name || "");
      return 0;
    });

    return sorted;
  }, [matches, minMatchPercent, sameBlockOnly, sameGenderOnly, sortBy, myLocation, myGender]);

  const toggleSave = async (roommateId, shouldSave) => {
    try {
      if (shouldSave) {
        await api.post(`/user/saved/${roommateId}`);
      } else {
        await api.delete(`/user/saved/${roommateId}`);
      }

      setMatches((prev) =>
        prev.map((m) =>
          m.user._id === roommateId ? { ...m, isSaved: shouldSave } : m
        )
      );
    } catch (err) {
      console.error("Failed to update saved:", err);
      const msg = err?.response?.data?.message || "Failed to update saved";
      alert(msg);
    }
  };

  const sendRequest = async (userId) => {
    try {
      const res = await api.post(`/user/request/${userId}`);
      const created = res.data?.request;
      const requestId = created?._id;

      setMatches((prev) =>
        prev.map((m) =>
          m.user._id === userId
            ? {
              ...m,
              request: {
                requestId: requestId || m.request?.requestId,
                status: created?.status || "pending",
                direction: "outgoing"
              }
            }
            : m
        )
      );
    } catch (err) {
      console.error("Failed to send request:", err);
      const msg = err?.response?.data?.message || "Failed to send request";
      alert(msg);
    }
  };

  const cancelRequest = async (requestId, userId) => {
    try {
      await api.delete(`/user/request/${requestId}/cancel`);
      setMatches((prev) =>
        prev.map((m) =>
          m.user._id === userId ? { ...m, request: null } : m
        )
      );
    } catch (err) {
      console.error("Failed to cancel request:", err);
      const msg = err?.response?.data?.message || "Failed to cancel request";
      alert(msg);
    }
  };

  const handleContact = (m) => {
    if (m?.request?.status !== "accepted") {
      navigate("/requests");
      return;
    }

    navigate(`/chat?with=${m.user._id}`);
  };

  const requestAction = (m) => {
    const r = m.request;
    if (!r) {
      return (
        <button className="btn-gradient-green w-full py-2 text-sm" onClick={() => sendRequest(m.user._id)}>
          <Send size={14} /> Send Request
        </button>
      );
    }

    if (r.status === "pending" && r.direction === "incoming") {
      return (
        <button className="btn-outline w-full py-2 text-sm" onClick={() => navigate("/requests") }>
          <UserCheck size={14} /> Respond
        </button>
      );
    }

    if (r.status === "pending" && r.direction === "outgoing") {
      return (
        <button
          className="btn-outline w-full py-2 text-sm"
          style={{ borderColor: "rgba(234,179,8,0.3)", color: "#facc15" }}
          onClick={() => cancelRequest(r.requestId, m.user._id)}
        >
          <XCircle size={14} /> Undo Request
        </button>
      );
    }

    const label =
      r.status === "accepted" ? "Accepted" :
        r.status === "rejected" ? "Rejected" :
          "Requested";

    return (
      <button className="btn-outline w-full py-2 text-sm" disabled>
        <UserCheck size={14} /> {label}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading matches…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <UserCheck size={24} style={{ color: 'var(--accent-text)' }} />
              Your Best Matches
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Find roommates that fit your routine
            </p>
          </div>

          <button onClick={() => navigate("/preferences?edit=true")} className="btn-outline w-full sm:w-auto text-sm">
            <SlidersHorizontal size={14} />
            Edit Preferences
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card-static p-4 mb-6 animate-fade-in-delay">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Filter size={13} style={{ color: 'var(--accent-text)' }} />
                  <span className="form-label mb-0">Min match</span>
                </div>
                <select value={minMatchPercent} onChange={(e) => setMinMatchPercent(Number(e.target.value))} className="dark-select">
                  <option value={0}>0%+</option>
                  <option value={25}>25%+</option>
                  <option value={50}>50%+</option>
                  <option value={75}>75%+</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowUpDown size={13} style={{ color: 'var(--accent-text)' }} />
                  <span className="form-label mb-0">Sort by</span>
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="dark-select">
                  <option value="best">Best match</option>
                  <option value="worst">Lowest match</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 justify-center">
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={sameBlockOnly} onChange={(e) => setSameBlockOnly(e.target.checked)}
                    disabled={!myLocation} className="dark-checkbox" />
                  <MapPin size={13} /> Same block only
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={sameGenderOnly} onChange={(e) => setSameGenderOnly(e.target.checked)}
                    disabled={!myGender} className="dark-checkbox" />
                  Same gender only
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Showing <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{visibleMatches.length}</span> of{" "}
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{matches.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Empty States */}
        {matches.length === 0 && (
          <div className="text-center py-16">
            <UserCheck size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No good matches found yet.</p>
          </div>
        )}

        {matches.length > 0 && visibleMatches.length === 0 && (
          <div className="text-center py-16">
            <Filter size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No matches found for your filters.</p>
          </div>
        )}

        {/* Match Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleMatches.map((m, i) => (
            <div key={i} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: 'white' }}>
                    {m.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{m.user.name}</h2>
                    <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={11} /> {m.user.preferences.location || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={m.isSaved ? "Unsave profile" : "Save profile"}
                    onClick={() => toggleSave(m.user._id, !m.isSaved)}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-glass)',
                      color: m.isSaved ? 'var(--accent-text)' : 'var(--text-secondary)'
                    }}
                  >
                    {m.isSaved ? <BookmarkX size={16} /> : <Bookmark size={16} />}
                  </button>
                  <span className="match-badge">{getMatchPercent(m)}%</span>
                </div>
              </div>

              {/* Preferences */}
              <div className="mt-3 space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p className="flex items-center gap-2"><Utensils size={13} style={{ color: 'var(--accent-text)' }} /> {m.user.preferences.food}</p>
                <p className="flex items-center gap-2"><BedDouble size={13} style={{ color: 'var(--accent-text)' }} /> {sleepLabels[m.user.preferences.sleepTime]}</p>
                <p className="flex items-center gap-2"><Volume2 size={13} style={{ color: 'var(--accent-text)' }} /> Noise: {m.user.preferences.noise}/10</p>
                <p className="flex items-center gap-2"><Sparkles size={13} style={{ color: 'var(--accent-text)' }} /> Clean: {m.user.preferences.cleanliness}/10</p>
              </div>

              {/* Match reasons */}
              <div className="mt-4 dark-panel" style={{ background: 'var(--green-bg)', borderColor: 'var(--green-border)' }}>
                <h3 className="font-semibold mb-1.5 text-sm flex items-center gap-1.5" style={{ color: 'var(--green-text)' }}>
                  <CheckCircle2 size={14} /> Why you match
                </h3>
                <ul className="space-y-0.5 text-sm" style={{ color: 'var(--green-text)' }}>
                  {m.reasons?.map((r, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} /> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="btn-gradient w-full py-2 text-sm" onClick={() => handleContact(m)}>
                  <MessageCircle size={14} /> Contact
                </button>

                {requestAction(m)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
