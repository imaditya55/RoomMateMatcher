import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchMatches = async () => {
      try {
        const res = await api.get("/user/matches");
        setMatches(res.data.matches || []);
      } catch (err) {
        console.error("Error loading matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading matches...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Best Matches</h1>

      <div className="flex justify-end mb-4">
  <button
   onClick={() => navigate("/preferences?edit=true")}
    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
  >
    Edit Preferences
  </button>
</div>



      {matches.length === 0 && (
        <p className="text-center text-gray-500 text-lg">
          No good matches found yet.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {matches.map((m, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-5 border hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">{m.user.name}</h2>
              <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-lg">
              {Math.min(100, Math.round((m.score / 60) * 100))}% match
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Email:</span> {m.user.email}
            </p>

            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Location:</span>{" "}
              {m.user.preferences.location || "Not specified"}
            </p>

            <div className="mt-3">
              <h3 className="font-semibold mb-2">Preferences:</h3>
              <ul className="list-disc ml-5 text-sm text-gray-700">
                <li>Food: {m.user.preferences.food}</li>
                <li>Sleep: {m.user.preferences.sleepTime}</li>
                <li>Noise: {m.user.preferences.noise}</li>
                <li>Cleanliness: {m.user.preferences.cleanliness}</li>
              </ul>
            </div>

            
            <div className="mt-3">
  <h3 className="font-semibold mb-1 text-green-700">Why you match:</h3>
  <ul className="list-disc ml-5 text-sm text-green-600">
    {m.reasons?.map((r, idx) => (
      <li key={idx}>{r}</li>
    ))}
  </ul>
</div>



            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => alert("Chat coming soon!")}
            >
              Contact
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
