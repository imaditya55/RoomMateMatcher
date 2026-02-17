import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

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

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow border">

        <h1 className="text-2xl font-bold mb-6 text-center">Roommate Preferences</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {message && <p className="text-green-600 text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1">Your gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sleep */}
          <div>
  <label className="block text-sm font-medium mb-1">
    When do you usually sleep?
  </label>
  <select
    name="sleepTime"
    value={form.sleepTime}
    onChange={handleChange}
    className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"
  >
    <option value={0}>Early (9–10 PM)</option>
    <option value={1}>Normal (11–12)</option>
    <option value={2}>Late (12–1)</option>
    <option value={3}>Very Late</option>
  </select>
</div>


          {/* Study Time */}
          <div>
  <label className="block text-sm font-medium mb-1">
    Preferred study time
  </label>
  <select
    name="studyTime"
    value={form.studyTime}
    onChange={handleChange}
    className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"
  >
    <option value={0}>Morning</option>
    <option value={1}>Afternoon</option>
    <option value={2}>Evening</option>
    <option value={3}>Night</option>
  </select>
</div>


          {/* Cleanliness */}
<div>
  <label className="block text-sm font-medium mb-1">
    Cleanliness level (1–10)
  </label>
  <input type="number" name="cleanliness" min="1" max="10"
    value={form.cleanliness} onChange={handleChange}
    className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"/>
</div>

          {/* Noise */}
<div>
  <label className="block text-sm font-medium mb-1">
    Noise tolerance (1–10)
  </label>
  <input type="number" name="noise" min="1" max="10"
    value={form.noise} onChange={handleChange}
    className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"/>
</div>

          {/* Budget */}
     <div>
  <label className="block text-sm font-medium mb-1">Monthly budget range</label>
  <div className="flex gap-2">
    <input type="number" name="budgetMin" placeholder="Min"
      value={form.budgetMin} onChange={handleChange}
      className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"/>
    <input type="number" name="budgetMax" placeholder="Max"
      value={form.budgetMax} onChange={handleChange}
      className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"/>
  </div>
</div>


          {/* Food */}
      <div>
  <label className="block text-sm font-medium mb-1">
    Food preference
  </label>
  <select
    name="food"
    value={form.food}
    onChange={handleChange}
    className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"
  >
    <option value="veg">Veg</option>
    <option value="non-veg">Non-veg</option>
    <option value="egg">Eggitarian</option>
  </select>
</div>

          {/* Location */}
       <div>
  <label className="block text-sm font-medium mb-1">
    Preferred hostel block
  </label>
  <select
  name="location"
  value={form.location}
  onChange={handleChange}
    className="border p-2 rounded-lg w-full outline-none focus:ring focus:ring-blue-300"
>
  <option value="">Select block</option>
  <option value="Block A">Block A</option>
  <option value="Block B">Block B</option>
  <option value="Block C">Block C</option>
</select>

</div>


          {/* Habits */}
          <div className="md:col-span-2 bg-gray-50 border rounded-xl p-4">
  <label className="block text-sm font-medium mb-1">Lifestyle habits</label>

  <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
    <input type="checkbox" name="smokes" checked={form.smokes} onChange={handleChange}/>
    I smoke
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
    <input type="checkbox" name="drinks" checked={form.drinks} onChange={handleChange}/>
    I drink
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
    <input type="checkbox" name="okayWithSmoking" checked={form.okayWithSmoking} onChange={handleChange}/>
    Okay if roommate smokes
  </label>

  <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
    <input type="checkbox" name="okayWithDrinking" checked={form.okayWithDrinking} onChange={handleChange}/>
    Okay if roommate drinks
  </label>
</div>


          <button className="bg-blue-600 text-white p-2 rounded-lg md:col-span-2 hover:bg-blue-700 transition">Save</button>
        </form>
      </div>
    </div>
  );
}



