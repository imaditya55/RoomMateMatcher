import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Save, BedDouble, BookOpen, Sparkles, Volume2, UtensilsCrossed,
  MapPin, Cigarette, Wine, Users, DollarSign
} from "lucide-react";

export default function Preferences() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await api.get("/user/profile");
        const prefs = res.data.user.preferences;
        const isEditMode = new URLSearchParams(window.location.search).get("edit");

        const isFilled =
          prefs &&
          prefs.budgetMin != null &&
          prefs.budgetMax != null;

        if (isFilled && !isEditMode) {
          navigate("/matches");
        }

        if (isFilled && isEditMode) {
          setForm(prefs);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadPreferences();
  }, [navigate]);

  const [form, setForm] = useState({
    gender: "",
    budgetMin: "",
    budgetMax: "",
    sleepTime: "",
    studyTime: "",
    cleanliness: "",
    noise: "",
    location: "",
    food: "",
    smokes: false,
    drinks: false,
    okayWithSmoking: false,
    okayWithDrinking: false,
    guests: false
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        sleepTime: Number(form.sleepTime),
        studyTime: Number(form.studyTime),
        cleanliness: Number(form.cleanliness),
        noise: Number(form.noise),
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
      };

      await api.put("/user/preferences", payload);
      setMessage("Preferences saved!");
      setTimeout(() => navigate("/matches"), 800);
    } catch {
      setError("Failed to save preferences");
    }
  };

  const SectionIcon = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} style={{ color: 'var(--accent-text)' }} />
      <span className="form-label mb-0">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto glass-card-static p-8 animate-fade-in">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))' }}>
            <Sparkles size={24} color="white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Roommate Preferences
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Tell us about your lifestyle to find the best matches
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'var(--red-glow)', color: 'var(--red-soft)' }}>
            ⚠ {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'var(--green-glow)', color: 'var(--green-text)' }}>
            ✓ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Gender */}
          <div>
            <SectionIcon icon={Users} label="Your gender" />
            <select name="gender" value={form.gender} onChange={handleChange} className="dark-select">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sleep */}
          <div>
            <SectionIcon icon={BedDouble} label="When do you usually sleep?" />
            <select name="sleepTime" value={form.sleepTime} onChange={handleChange} className="dark-select">
              <option value={0}>Early (9–10 PM)</option>
              <option value={1}>Normal (11–12)</option>
              <option value={2}>Late (12–1)</option>
              <option value={3}>Very Late</option>
            </select>
          </div>

          {/* Study Time */}
          <div>
            <SectionIcon icon={BookOpen} label="Preferred study time" />
            <select name="studyTime" value={form.studyTime} onChange={handleChange} className="dark-select">
              <option value={0}>Morning</option>
              <option value={1}>Afternoon</option>
              <option value={2}>Evening</option>
              <option value={3}>Night</option>
            </select>
          </div>

          {/* Food */}
          <div>
            <SectionIcon icon={UtensilsCrossed} label="Food preference" />
            <select name="food" value={form.food} onChange={handleChange} className="dark-select">
              <option value="veg">Veg</option>
              <option value="non-veg">Non-veg</option>
              <option value="egg">Eggitarian</option>
            </select>
          </div>

          {/* Cleanliness */}
          <div>
            <SectionIcon icon={Sparkles} label="Cleanliness level (1–10)" />
            <input type="number" name="cleanliness" min="1" max="10"
              value={form.cleanliness} onChange={handleChange}
              className="dark-input" placeholder="e.g. 7" />
          </div>

          {/* Noise */}
          <div>
            <SectionIcon icon={Volume2} label="Noise tolerance (1–10)" />
            <input type="number" name="noise" min="1" max="10"
              value={form.noise} onChange={handleChange}
              className="dark-input" placeholder="e.g. 5" />
          </div>

          {/* Budget */}
          <div className="md:col-span-2">
            <SectionIcon icon={DollarSign} label="Monthly budget range (₹)" />
            <div className="flex gap-3">
              <input type="number" name="budgetMin" placeholder="Min"
                value={form.budgetMin} onChange={handleChange} className="dark-input" />
              <input type="number" name="budgetMax" placeholder="Max"
                value={form.budgetMax} onChange={handleChange} className="dark-input" />
            </div>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <SectionIcon icon={MapPin} label="Preferred hostel block" />
            <select name="location" value={form.location} onChange={handleChange} className="dark-select">
              <option value="">Select block</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
            </select>
          </div>

          {/* Habits */}
          <div className="md:col-span-2 dark-panel">
            <div className="flex items-center gap-2 mb-3">
              <Cigarette size={16} style={{ color: 'var(--accent-text)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Lifestyle habits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["smokes", "I smoke", Cigarette],
                ["drinks", "I drink", Wine],
                ["okayWithSmoking", "Okay if roommate smokes", Cigarette],
                ["okayWithDrinking", "Okay if roommate drinks", Wine],
              ].map(([name, label, Icon]) => (
                <label key={name} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <input type="checkbox" name={name} checked={form[name]}
                    onChange={handleChange} className="dark-checkbox" />
                  <Icon size={14} style={{ color: 'var(--text-muted)' }} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-gradient md:col-span-2 py-3 text-sm">
            <Save size={16} />
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}
