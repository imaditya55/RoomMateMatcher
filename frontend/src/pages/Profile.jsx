import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Mail, MapPin, DollarSign, BedDouble, BookOpen,
  Sparkles, Volume2, UtensilsCrossed, Cigarette, Wine,
  Users, Edit, UserCircle
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const sleepLabels = {
    0: "Early (9–10 PM)",
    1: "Normal (11–12)",
    2: "Late (12–1 AM)",
    3: "Very Late"
  };

  const studyLabels = {
    0: "Morning",
    1: "Afternoon",
    2: "Evening",
    3: "Night"
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading profile…
        </span>
      </div>
    );
  }

  const p = user.preferences || {};

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-text)' }} />
      <div>
        <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card-static p-6 animate-fade-in">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: 'white' }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </h1>
                <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <UserCircle size={14} /> Your profile & preferences
                </p>
              </div>
            </div>

            <button onClick={() => navigate("/preferences?edit=true")} className="btn-gradient w-full sm:w-auto text-sm">
              <Edit size={14} />
              Edit Preferences
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">

            {/* Basics */}
            <div className="lg:col-span-1 dark-panel">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg viewBox="0 0 16 16" width="14" height="14">
                  <circle cx="8" cy="8" r="8" fill="var(--accent-start)" opacity="0.2" />
                  <circle cx="8" cy="8" r="4" fill="var(--accent-start)" />
                </svg>
                Basics
              </h2>
              <div className="space-y-4">
                <InfoItem icon={Mail} label="Email" value={user.email} />
                <InfoItem icon={Users} label="Gender" value={p.gender || "Not set"} />
                <InfoItem icon={MapPin} label="Hostel block" value={p.location || "Not set"} />
                <InfoItem icon={DollarSign} label="Budget range" value={`₹${p.budgetMin ?? "—"} – ₹${p.budgetMax ?? "—"}`} />
              </div>
            </div>

            {/* Preferences */}
            <div className="lg:col-span-2">
              <div className="dark-panel">
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <svg viewBox="0 0 16 16" width="14" height="14">
                    <circle cx="8" cy="8" r="8" fill="var(--green-start)" opacity="0.2" />
                    <circle cx="8" cy="8" r="4" fill="var(--green-start)" />
                  </svg>
                  Preferences
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem icon={BedDouble} label="Sleep time" value={sleepLabels[p.sleepTime] ?? "—"} />
                  <InfoItem icon={BookOpen} label="Study time" value={studyLabels[p.studyTime] ?? "—"} />
                  <InfoItem icon={Sparkles} label="Cleanliness" value={`${p.cleanliness ?? "—"}/10`} />
                  <InfoItem icon={Volume2} label="Noise tolerance" value={`${p.noise ?? "—"}/10`} />
                  <InfoItem icon={UtensilsCrossed} label="Food preference" value={p.food || "—"} />
                </div>

                {/* Lifestyle */}
                <div className="mt-5 dark-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Cigarette size={14} style={{ color: 'var(--accent-text)' }} />
                    Lifestyle
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      ["Smokes", p.smokes, Cigarette],
                      ["Drinks", p.drinks, Wine],
                      ["Okay with smoking", p.okayWithSmoking, Cigarette],
                      ["Okay with drinking", p.okayWithDrinking, Wine],
                      ["Okay with guests", p.guests, Users],
                    ].map(([label, val, Icon]) => (
                      <p key={label} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <Icon size={13} style={{ color: 'var(--text-muted)' }} />
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{label}:</span>{" "}
                        <span style={{ color: val ? 'var(--green-text)' : 'var(--text-muted)' }}>
                          {val ? "Yes ✓" : "No"}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
