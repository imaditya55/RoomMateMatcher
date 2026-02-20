import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
  gender: String,
  sleepTime: Number,
  studyTime: Number,

  cleanliness: Number,
  noise: Number,

  smokes: Boolean,
  drinks: Boolean,

  okayWithSmoking: Boolean,
  okayWithDrinking: Boolean,

  food: String,
  personality: String,

  budgetMin: Number,
  budgetMax: Number,

  location: String,
  guests: Boolean
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  preferences: {
    type: preferenceSchema,
    default: {}   // empty until user fills form
  },

  savedRoommates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }
  ]
});

export default mongoose.model("User", userSchema);
