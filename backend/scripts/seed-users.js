import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roommate_matcher";

const shouldReset = process.argv.includes("--reset");

const sampleUsers = [
  {
    name: "Aarav Sharma",
    email: "aarav@example.com",
    password: "Password@123",
    preferences: {
      gender: "male",
      sleepTime: 1,
      studyTime: 2,
      cleanliness: 7,
      noise: 5,
      smokes: false,
      drinks: false,
      okayWithSmoking: false,
      okayWithDrinking: true,
      guests: true,
      food: "veg",
      budgetMin: 3500,
      budgetMax: 6000,
      location: "Block A"
    }
  },
  {
    name: "Ishita Verma",
    email: "ishita@example.com",
    password: "Password@123",
    preferences: {
      gender: "female",
      sleepTime: 0,
      studyTime: 0,
      cleanliness: 8,
      noise: 3,
      smokes: false,
      drinks: false,
      okayWithSmoking: false,
      okayWithDrinking: false,
      guests: false,
      food: "veg",
      budgetMin: 4000,
      budgetMax: 7000,
      location: "Block A"
    }
  },
  {
    name: "Rohan Mehta",
    email: "rohan@example.com",
    password: "Password@123",
    preferences: {
      gender: "male",
      sleepTime: 2,
      studyTime: 3,
      cleanliness: 5,
      noise: 7,
      smokes: true,
      drinks: true,
      okayWithSmoking: true,
      okayWithDrinking: true,
      guests: true,
      food: "non-veg",
      budgetMin: 3000,
      budgetMax: 5500,
      location: "Block B"
    }
  },
  {
    name: "Neha Singh",
    email: "neha@example.com",
    password: "Password@123",
    preferences: {
      gender: "female",
      sleepTime: 1,
      studyTime: 1,
      cleanliness: 9,
      noise: 4,
      smokes: false,
      drinks: true,
      okayWithSmoking: false,
      okayWithDrinking: true,
      guests: false,
      food: "egg",
      budgetMin: 4500,
      budgetMax: 8000,
      location: "Block C"
    }
  },
  {
    name: "Kabir Patel",
    email: "kabir@example.com",
    password: "Password@123",
    preferences: {
      gender: "male",
      sleepTime: 3,
      studyTime: 3,
      cleanliness: 4,
      noise: 8,
      smokes: false,
      drinks: true,
      okayWithSmoking: true,
      okayWithDrinking: true,
      guests: true,
      food: "non-veg",
      budgetMin: 2500,
      budgetMax: 5000,
      location: "Block B"
    }
  },
  {
    name: "Priya Nair",
    email: "priya@example.com",
    password: "Password@123",
    preferences: {
      gender: "female",
      sleepTime: 1,
      studyTime: 0,
      cleanliness: 6,
      noise: 5,
      smokes: false,
      drinks: false,
      okayWithSmoking: false,
      okayWithDrinking: false,
      guests: true,
      food: "veg",
      budgetMin: 3800,
      budgetMax: 6500,
      location: "Block C"
    }
  },
  {
    name: "Arjun Kulkarni",
    email: "arjun@example.com",
    password: "Password@123",
    preferences: {
      gender: "male",
      sleepTime: 2,
      studyTime: 2,
      cleanliness: 7,
      noise: 6,
      smokes: false,
      drinks: true,
      okayWithSmoking: true,
      okayWithDrinking: true,
      guests: false,
      food: "egg",
      budgetMin: 4200,
      budgetMax: 7000,
      location: "Block A"
    }
  },
  {
    name: "Simran Kaur",
    email: "simran@example.com",
    password: "Password@123",
    preferences: {
      gender: "female",
      sleepTime: 0,
      studyTime: 1,
      cleanliness: 8,
      noise: 2,
      smokes: false,
      drinks: false,
      okayWithSmoking: false,
      okayWithDrinking: false,
      guests: false,
      food: "veg",
      budgetMin: 5000,
      budgetMax: 9000,
      location: "Block B"
    }
  },
  {
    name: "Aditya Joshi",
    email: "aditya@example.com",
    password: "Password@123",
    preferences: {
      gender: "male",
      sleepTime: 3,
      studyTime: 2,
      cleanliness: 5,
      noise: 7,
      smokes: true,
      drinks: false,
      okayWithSmoking: true,
      okayWithDrinking: true,
      guests: true,
      food: "non-veg",
      budgetMin: 2800,
      budgetMax: 5200,
      location: "Block C"
    }
  },
  {
    name: "Ananya Gupta",
    email: "ananya@example.com",
    password: "Password@123",
    preferences: {
      gender: "female",
      sleepTime: 1,
      studyTime: 1,
      cleanliness: 9,
      noise: 4,
      smokes: false,
      drinks: true,
      okayWithSmoking: false,
      okayWithDrinking: true,
      guests: false,
      food: "veg",
      budgetMin: 4500,
      budgetMax: 7500,
      location: "Block A"
    }
  }
];

async function main() {
  await mongoose.connect(MONGO_URI);

  if (shouldReset) {
    await User.deleteMany({});
  }

  let created = 0;
  let updated = 0;

  for (const u of sampleUsers) {
    const existing = await User.findOne({ email: u.email });
    const hashed = await bcrypt.hash(u.password, 10);

    if (!existing) {
      await User.create({
        name: u.name,
        email: u.email,
        password: hashed,
        preferences: u.preferences
      });
      created += 1;
      continue;
    }

    await User.updateOne(
      { email: u.email },
      {
        $set: {
          name: u.name,
          password: hashed,
          preferences: u.preferences
        }
      }
    );
    updated += 1;
  }

  const total = await User.countDocuments();
  console.log("✅ Seed complete");
  console.log({ created, updated, total, reset: shouldReset });
}

main()
  .then(() => mongoose.disconnect())
  .catch(async (err) => {
    console.error("❌ Seed failed:", err.message);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  });
