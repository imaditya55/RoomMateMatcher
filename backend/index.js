import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import Message from "./models/Message.js";
import Request from "./models/Request.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO with CORS
const io = new SocketIO(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Roommate Matcher API is running 🚀" });
});

// ═══════════════════════════════════════════════
// Socket.IO — real-time chat
// ═══════════════════════════════════════════════

// Map userId -> Set of socket ids (user can have multiple tabs)
const onlineUsers = new Map();

// Auth middleware for sockets
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const uid = socket.userId;

  // Track online status
  if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
  onlineUsers.get(uid).add(socket.id);

  // Join a personal room so we can emit directly to a user
  socket.join(uid);

  // Broadcast online status to connections
  io.emit("user_online", { userId: uid });

  // ── Send message ──
  socket.on("send_message", async ({ to, text }, callback) => {
    try {
      if (!text?.trim() || !to) {
        return callback?.({ error: "Invalid message" });
      }

      // Verify accepted request exists
      const connected = await Request.findOne({
        $or: [
          { from: uid, to, status: "accepted" },
          { from: to, to: uid, status: "accepted" }
        ]
      });

      if (!connected) {
        return callback?.({ error: "Not connected" });
      }

      const msg = await Message.create({
        from: uid,
        to,
        text: text.trim()
      });

      const messageData = {
        _id: msg._id,
        from: uid,
        to,
        text: msg.text,
        read: false,
        createdAt: msg.createdAt
      };

      // Send to recipient (all their tabs/devices)
      io.to(to).emit("new_message", messageData);

      // Acknowledge to sender
      callback?.({ message: messageData });
    } catch (err) {
      callback?.({ error: err.message });
    }
  });

  // ── Mark messages as read ──
  socket.on("mark_read", async ({ from }) => {
    if (!from) return;

    await Message.updateMany(
      { from, to: uid, read: false },
      { $set: { read: true } }
    );

    // Notify sender that their messages were read
    io.to(from).emit("messages_read", { by: uid });
  });

  // ── Typing indicator ──
  socket.on("typing", ({ to }) => {
    io.to(to).emit("user_typing", { userId: uid });
  });

  socket.on("stop_typing", ({ to }) => {
    io.to(to).emit("user_stop_typing", { userId: uid });
  });

  // ── Disconnect ──
  socket.on("disconnect", () => {
    const sockets = onlineUsers.get(uid);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(uid);
        io.emit("user_offline", { userId: uid });
      }
    }
  });
});

// ═══════════════════════════════════════════════

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roommate_matcher";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    httpServer.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log("❌ Mongo error:", err.message));
