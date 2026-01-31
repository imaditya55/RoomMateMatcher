import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Saved() {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const loadSaved = async () => {
      const res = await api.get("/user/saved");
      setSaved(res.data.saved);
    };
    loadSaved();
  }, []);

  if (saved.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        No saved roommates yet ⭐
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Saved Roommates
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {saved.map((u) => (
          <div
            key={u._id}
            className="bg-white rounded-xl shadow p-5 border"
          >
            <h2 className="text-xl font-semibold mb-2">{u.name}</h2>

            <p className="text-sm text-gray-600">
              {u.preferences.location}
            </p>

            <ul className="mt-2 text-sm text-gray-700">
              <li>Food: {u.preferences.food}</li>
              <li>Cleanliness: {u.preferences.cleanliness}</li>
              <li>Noise: {u.preferences.noise}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
