import express from "express";
import { auth } from "../middleware/auth.js";
import Message from "../models/Message.js";
import Request from "../models/Request.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper: check if two users have an accepted request between them
async function areConnected(userA, userB) {
  const req = await Request.findOne({
    $or: [
      { from: userA, to: userB, status: "accepted" },
      { from: userB, to: userA, status: "accepted" }
    ]
  });
  return !!req;
}

// GET /api/chat/conversations — list users you can chat with (accepted requests)
router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Find all accepted requests involving this user
    const accepted = await Request.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted"
    })
      .populate("from", "name email preferences")
      .populate("to", "name email preferences")
      .lean();

    // Build conversation list with last message preview
    const conversations = await Promise.all(
      accepted.map(async (r) => {
        const otherUser =
          String(r.from._id) === String(userId) ? r.to : r.from;

        // Get the last message between the two users
        const lastMessage = await Message.findOne({
          $or: [
            { from: userId, to: otherUser._id },
            { from: otherUser._id, to: userId }
          ]
        })
          .sort({ createdAt: -1 })
          .lean();

        // Count unread messages from the other user
        const unreadCount = await Message.countDocuments({
          from: otherUser._id,
          to: userId,
          read: false
        });

        return {
          user: otherUser,
          lastMessage: lastMessage || null,
          unreadCount
        };
      })
    );

    // Sort by most recent message (or request date)
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || 0;
      const bTime = b.lastMessage?.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/messages/:userId — get message history with a specific user
router.get("/messages/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Check that users are connected
    const connected = await areConnected(me, userId);
    if (!connected) {
      return res
        .status(403)
        .json({ message: "You can only chat with accepted roommates" });
    }

    // Fetch messages between the two users, oldest first
    const messages = await Message.find({
      $or: [
        { from: me, to: userId },
        { from: userId, to: me }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark unread messages from the other user as read
    await Message.updateMany(
      { from: userId, to: me, read: false },
      { $set: { read: true } }
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/messages/:userId — send a message (REST fallback)
router.post("/messages/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.userId;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const connected = await areConnected(me, userId);
    if (!connected) {
      return res
        .status(403)
        .json({ message: "You can only chat with accepted roommates" });
    }

    const message = await Message.create({
      from: me,
      to: userId,
      text: text.trim()
    });

    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
