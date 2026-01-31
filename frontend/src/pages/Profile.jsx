import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border">

        <h1 className="text-3xl font-bold text-center mb-4">{user.name}</h1>

        <div className="space-y-2 text-lg text-gray-700">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Hostel Block:</strong> {p.location || "Not set"}</p>
          <p>
            <strong>Budget Range:</strong> ₹{p.budgetMin} – ₹{p.budgetMax}
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Preferences</h2>

        <ul className="ml-5 list-disc text-gray-700 space-y-1">
          <li>Sleep Time: {p.sleepTime}</li>
          <li>Study Time: {p.studyTime}</li>
          <li>Cleanliness: {p.cleanliness}</li>
          <li>Noise Tolerance: {p.noise}</li>
          <li>Food Preference: {p.food}</li>
          <li>Smokes: {p.smokes ? "Yes" : "No"}</li>
          <li>Drinks: {p.drinks ? "Yes" : "No"}</li>
          <li>Okay with Smoking: {p.okayWithSmoking ? "Yes" : "No"}</li>
          <li>Okay with Drinking: {p.okayWithDrinking ? "Yes" : "No"}</li>
          <li>Okay with Guests: {p.guests ? "Yes" : "No"}</li>
        </ul>

        <button
          onClick={() => navigate("/preferences?edit=true")}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Edit Preferences
        </button>

      </div>
    </div>
  );
}
