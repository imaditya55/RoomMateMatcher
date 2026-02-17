import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

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

const studyLabels = {
  0: "Morning",
  1: "Afternoon",
  2: "Evening",
  3: "Night"
};


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

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
      if (sortBy === "name") {
        return (a.user?.name || "").localeCompare(b.user?.name || "");
      }
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading matches...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold">Your Best Matches</h1>
          <p className="text-sm text-gray-600 mt-1">Find roommates that fit your routine.</p>
        </div>

        <button
          onClick={() => navigate("/preferences?edit=true")}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition w-full sm:w-auto"
        >
          Edit Preferences
        </button>
      </div>

        <div className="bg-white rounded-2xl shadow border p-4 mb-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <label className="block">
              <span className="block text-sm font-medium mb-1">Min match</span>
              <select
                value={minMatchPercent}
                onChange={(e) => setMinMatchPercent(Number(e.target.value))}
                className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"
              >
                <option value={0}>0%+</option>
                <option value={25}>25%+</option>
                <option value={50}>50%+</option>
                <option value={75}>75%+</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-sm font-medium mb-1">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"
              >
                <option value="best">Best match</option>
                <option value="worst">Lowest match</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </label>

            <label className="flex items-center gap-2 mt-7 sm:mt-0 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sameBlockOnly}
                onChange={(e) => setSameBlockOnly(e.target.checked)}
                disabled={!myLocation}
              />
              <span className="text-sm">Same block only</span>
            </label>

            <label className="flex items-center gap-2 mt-1 sm:mt-0 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sameGenderOnly}
                onChange={(e) => setSameGenderOnly(e.target.checked)}
                disabled={!myGender}
              />
              <span className="text-sm">Same gender only</span>
            </label>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{visibleMatches.length}</span> of{" "}
              <span className="font-semibold">{matches.length}</span>
            </p>
          </div>
        </div>
      </div>



      {matches.length === 0 && (
        <p className="text-center text-gray-500 text-lg py-16">
          No good matches found yet.
        </p>
      )}

      {matches.length > 0 && visibleMatches.length === 0 && (
        <p className="text-center text-gray-500 text-lg py-16">
          No matches found for your filters.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleMatches.map((m, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow border p-5 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{m.user.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {m.user.preferences.location || "Not specified"}
                </p>
              </div>

              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                {getMatchPercent(m)}% match
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Email:</span> {m.user.email}
            </p>

            <div className="mt-3">
              <h3 className="font-semibold mb-2">Preferences:</h3>
              <ul className="list-disc ml-5 text-sm text-gray-700">
                <li>Food: {m.user.preferences.food}</li>
                <li>
  Sleep: {sleepLabels[m.user.preferences.sleepTime]}
</li>

<li>
  Noise tolerance: {m.user.preferences.noise}/10
</li>

<li>
  Cleanliness level: {m.user.preferences.cleanliness}/10
</li>
              </ul>
            </div>

            
            <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3">
              <h3 className="font-semibold mb-1 text-green-700 text-sm">Why you match</h3>
              <ul className="list-disc ml-5 text-sm text-green-700">
                {m.reasons?.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>



            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                onClick={() => alert("Chat coming soon!")}
              >
                Contact
              </button>

              {m.isSaved ? (
                <button
                  className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800 transition font-medium"
                  onClick={() => toggleSave(m.user._id, false)}
                >
                  Unsave
                </button>
              ) : (
                <button
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                  onClick={() => toggleSave(m.user._id, true)}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
