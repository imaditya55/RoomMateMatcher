import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading profile...
      </div>
    );
  }

  const p = user.preferences || {};

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-600 mt-1">Your profile & preferences</p>
            </div>

            <button
              onClick={() => navigate("/preferences?edit=true")}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Edit Preferences
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <div className="lg:col-span-1 bg-gray-50 border rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Basics</h2>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{user.email}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Hostel block</p>
                  <p className="text-sm font-medium text-gray-900">{p.location || "Not set"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Budget range</p>
                  <p className="text-sm font-medium text-gray-900">
                    ₹{p.budgetMin ?? "—"} – ₹{p.budgetMax ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Preferences</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Sleep time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {sleepLabels[p.sleepTime] ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Study time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {studyLabels[p.studyTime] ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Cleanliness</p>
                    <p className="text-sm font-medium text-gray-900">{p.cleanliness ?? "—"}/10</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Noise tolerance</p>
                    <p className="text-sm font-medium text-gray-900">{p.noise ?? "—"}/10</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Food preference</p>
                    <p className="text-sm font-medium text-gray-900">{p.food || "—"}</p>
                  </div>
                </div>

                <div className="mt-5 bg-gray-50 border rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Lifestyle</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Smokes:</span> {p.smokes ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Drinks:</span> {p.drinks ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Okay with smoking:</span> {p.okayWithSmoking ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Okay with drinking:</span> {p.okayWithDrinking ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Okay with guests:</span> {p.guests ? "Yes" : "No"}
                    </p>
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
