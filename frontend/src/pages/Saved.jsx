import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Saved() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadSaved = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

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
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading saved...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-600">
        {error}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        No saved roommates yet ⭐
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Saved Roommates</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quick access to your saved profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((u) => (
            <div
              key={u._id}
              className="bg-white rounded-2xl shadow border p-5 hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">{u.name}</h2>
              <p className="text-xs text-gray-500 mt-1">
                {u.preferences?.location || "Not specified"}
              </p>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Preferences
                </h3>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  <li>Food: {u.preferences?.food || "—"}</li>
                  <li>Cleanliness: {u.preferences?.cleanliness ?? "—"}</li>
                  <li>Noise: {u.preferences?.noise ?? "—"}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
