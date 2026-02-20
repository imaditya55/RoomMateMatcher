import express from "express";
import User from "../models/User.js";
import Request from "../models/Request.js";
import { auth } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// UPDATE USER PREFERENCES ------------------------------
router.put("/preferences", auth, async (req, res) => {
  try {
    const {
      gender,
      sleepTime,
      studyTime,
      cleanliness,
      noise,

      smokes,
      drinks,
      okayWithSmoking,
      okayWithDrinking,
      guests,

      food,
      personality,

      budgetMin,
      budgetMax,
      location
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        preferences: {
          gender,
          sleepTime,
          studyTime,
          cleanliness,
          noise,

          smokes,
          drinks,
          okayWithSmoking,
          okayWithDrinking,
          guests,

          food,
          personality,

          budgetMin,
          budgetMax,
          location
        }
      },
      { new: true }
    );

    res.json({ message: "Preferences updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SAVED ROOMMATES -------------------------------------
router.get("/saved", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: "savedRoommates",
        select: "name email preferences"
      })
      .select("savedRoommates");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ saved: user.savedRoommates || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/saved/:roommateId", auth, async (req, res) => {
  try {
    const { roommateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roommateId)) {
      return res.status(400).json({ message: "Invalid roommate id" });
    }

    if (String(roommateId) === String(req.userId)) {
      return res.status(400).json({ message: "You can't save yourself" });
    }

    const exists = await User.exists({ _id: roommateId });
    if (!exists) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { savedRoommates: roommateId } },
      { new: true }
    ).select("savedRoommates");

    res.json({ message: "Saved", savedRoommates: updated?.savedRoommates || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/saved/:roommateId", auth, async (req, res) => {
  try {
    const { roommateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roommateId)) {
      return res.status(400).json({ message: "Invalid roommate id" });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { savedRoommates: roommateId } },
      { new: true }
    ).select("savedRoommates");

    res.json({ message: "Unsaved", savedRoommates: updated?.savedRoommates || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// SMART MATCH SCORE ---------------------------------
function matchScore(a = {}, b = {}) {
  let score = 0;
  let reasons = [];

  const cleanDiff = Math.abs((a.cleanliness ?? 5) - (b.cleanliness ?? 5));
  if (cleanDiff <= 3) {
    score += 10 - cleanDiff;
    reasons.push("Similar cleanliness habits");
  }

  const noiseDiff = Math.abs((a.noise ?? 5) - (b.noise ?? 5));
  if (noiseDiff <= 3) {
    score += 10 - noiseDiff;
    reasons.push("Similar noise tolerance");
  }

  const sleepDiff = Math.abs((a.sleepTime ?? 1) - (b.sleepTime ?? 1));
  if (sleepDiff <= 1) {
    score += 8;
    reasons.push("Similar sleep schedule");
  }

  const studyDiff = Math.abs((a.studyTime ?? 1) - (b.studyTime ?? 1));
  if (studyDiff <= 1) {
    score += 8;
    reasons.push("Same study routine");
  }

  if (a.food === b.food) {
    score += 6;
    reasons.push("Same food preference");
  }

  const overlap =
    Math.min(a.budgetMax ?? 0, b.budgetMax ?? 0) -
    Math.max(a.budgetMin ?? 0, b.budgetMin ?? 0);

  if (overlap > 0) {
    score += 10;
    reasons.push("Compatible budget range");
  }

  if (a.location === b.location) {
    score += 6;
    reasons.push("Same hostel block");
  }

  if (b.smokes && !a.okayWithSmoking) score -= 10;
  if (b.drinks && !a.okayWithDrinking) score -= 8;

  return {
    score: Math.max(score, 0),
    reasons
  };
}




// GET MATCHES ----------------------------------------
router.get("/matches", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select(
      "preferences savedRoommates"
    );
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const myPrefs = currentUser.preferences || {};
    const savedSet = new Set(
      (currentUser.savedRoommates || []).map((id) => String(id))
    );

    // Fetch all requests involving the current user
    const myRequests = await Request.find({
      $or: [{ from: req.userId }, { to: req.userId }]
    }).lean();

    // Build a lookup: otherUserId -> { requestId, status, direction }
    const requestMap = new Map();
    for (const r of myRequests) {
      const isOutgoing = String(r.from) === String(req.userId);
      const otherId = isOutgoing ? String(r.to) : String(r.from);
      requestMap.set(otherId, {
        requestId: String(r._id),
        status: r.status,
        direction: isOutgoing ? "outgoing" : "incoming"
      });
    }

    const users = await User.find({ _id: { $ne: req.userId } }).select("-password");

    const matches = users
      .map((u) => {
        const result = matchScore(myPrefs, u.preferences || {});
        return {
          user: u,
          score: result.score,
          reasons: result.reasons,
          isSaved: savedSet.has(String(u._id)),
          request: requestMap.get(String(u._id)) || null
        };
      })
      .filter((m) => m.score >= 15)
      .sort((a, b) => b.score - a.score);

    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET LOGGED-IN USER PROFILE ------------------------------
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile fetched successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ══════════════════════════════════════════════════════
// ROOMMATE REQUESTS
// ══════════════════════════════════════════════════════

// SEND REQUEST ----------------------------------------
router.post("/request/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (String(userId) === String(req.userId)) {
      return res.status(400).json({ message: "You can't send a request to yourself" });
    }

    const targetUser = await User.exists({ _id: userId });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a request already exists in either direction
    const existing = await Request.findOne({
      $or: [
        { from: req.userId, to: userId },
        { from: userId, to: req.userId }
      ]
    });

    if (existing) {
      return res.status(400).json({
        message: `A request already exists (${existing.status})`,
        request: existing
      });
    }

    const newRequest = await Request.create({
      from: req.userId,
      to: userId,
      status: "pending"
    });

    res.json({ message: "Request sent", request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL REQUESTS ------------------------------------
router.get("/requests", auth, async (req, res) => {
  try {
    const incoming = await Request.find({ to: req.userId })
      .populate("from", "name email preferences")
      .sort({ createdAt: -1 })
      .lean();

    const outgoing = await Request.find({ from: req.userId })
      .populate("to", "name email preferences")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ incoming, outgoing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ACCEPT REQUEST --------------------------------------
router.put("/request/:id/accept", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the recipient can accept
    if (String(request.to) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = "accepted";
    await request.save();

    res.json({ message: "Request accepted", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CANCEL / UNDO REQUEST (sender only, while still pending) ------
router.delete("/request/:id/cancel", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the sender can cancel
    if (String(request.from) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Cannot cancel a request that is already ${request.status}` });
    }

    await Request.findByIdAndDelete(id);

    res.json({ message: "Request cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REJECT REQUEST --------------------------------------
router.put("/request/:id/reject", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the recipient can reject
    if (String(request.to) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
