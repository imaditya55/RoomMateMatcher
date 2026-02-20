import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export function getSocket() {
  if (socket) return socket;

  const token = localStorage.getItem("token");
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("🔌 Socket error:", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
