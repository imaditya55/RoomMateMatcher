import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { getSocket } from "../utils/socket";
import {
  MessageCircle, Send, ArrowLeft, MapPin, Circle, Check, CheckCheck
} from "lucide-react";

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openWith = searchParams.get("with");          // pre-open a chat via ?with=userId

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);  // { user }
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [onlineSet, setOnlineSet] = useState(new Set());
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);
  const socketRef = useRef(null);

  // Get current user id from token
  const getMyId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch { return null; }
  };

  const myId = getMyId();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Load conversations ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    const loadConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [navigate]);

  // ── Auto-open chat if ?with= param is present ──
  useEffect(() => {
    if (openWith && conversations.length > 0) {
      const conv = conversations.find((c) => c.user._id === openWith);
      if (conv) {
        openChat(conv.user);
      }
    }
  }, [openWith, conversations]);

  // ── Socket setup ──
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    socket.on("new_message", (msg) => {
      // If the message is in the active chat, add it
      setActiveChat((current) => {
        if (current && (msg.from === current.user._id || msg.to === current.user._id)) {
          setMessages((prev) => [...prev, msg]);

          // Mark as read since we're viewing this chat
          if (msg.from === current.user._id) {
            socket.emit("mark_read", { from: msg.from });
          }
        }
        return current;
      });

      // Update conversation list (last message + unread)
      setConversations((prev) => {
        const otherId = msg.from === myId ? msg.to : msg.from;
        return prev.map((c) => {
          if (c.user._id === otherId) {
            return {
              ...c,
              lastMessage: msg,
              unreadCount: msg.from !== myId ? c.unreadCount + 1 : c.unreadCount
            };
          }
          return c;
        });
      });
    });

    socket.on("messages_read", ({ by }) => {
      // Update read status for messages sent TO that user
      setMessages((prev) =>
        prev.map((m) => (m.to === by ? { ...m, read: true } : m))
      );
    });

    socket.on("user_typing", ({ userId }) => {
      setActiveChat((current) => {
        if (current && userId === current.user._id) {
          setTyping(true);
        }
        return current;
      });
    });

    socket.on("user_stop_typing", ({ userId }) => {
      setActiveChat((current) => {
        if (current && userId === current.user._id) {
          setTyping(false);
        }
        return current;
      });
    });

    socket.on("user_online", ({ userId }) => {
      setOnlineSet((prev) => new Set([...prev, userId]));
    });

    socket.on("user_offline", ({ userId }) => {
      setOnlineSet((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off("new_message");
      socket.off("messages_read");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [myId]);

  // ── Scroll on new messages ──
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Open a chat ──
  const openChat = async (user) => {
    setActiveChat({ user });
    setMessages([]);
    setTyping(false);
    setShowSidebar(false);

    try {
      const res = await api.get(`/chat/messages/${user._id}`);
      setMessages(res.data.messages || []);

      // Mark as read
      socketRef.current?.emit("mark_read", { from: user._id });

      // Clear unread count in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.user._id === user._id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  // ── Send message ──
  const handleSend = () => {
    if (!text.trim() || !activeChat) return;

    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("send_message", { to: activeChat.user._id, text: text.trim() }, (response) => {
      if (response?.message) {
        setMessages((prev) => [...prev, response.message]);

        // Update conversation last message
        setConversations((prev) =>
          prev.map((c) =>
            c.user._id === activeChat.user._id
              ? { ...c, lastMessage: response.message }
              : c
          )
        );
      }
      if (response?.error) {
        console.error("Send error:", response.error);
      }
    });

    setText("");
    socket.emit("stop_typing", { to: activeChat.user._id });
  };

  // ── Typing indicator ──
  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = socketRef.current;
    if (!socket || !activeChat) return;

    socket.emit("typing", { to: activeChat.user._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", { to: activeChat.user._id });
    }, 1500);
  };

  // ── Formatters ──
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups.length || groups[groups.length - 1].date !== date) {
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
    return groups;
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg animate-pulse" style={{ color: "var(--text-secondary)" }}>
          Loading chats…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── Sidebar: conversation list ── */}
      <div
        className={`${showSidebar ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 lg:w-96 shrink-0`}
        style={{ background: "var(--bg-base)", borderRight: "1px solid var(--border-glass)" }}
      >
        {/* Sidebar header */}
        <div className="p-4" style={{ borderBottom: "1px solid var(--border-glass)" }}>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <MessageCircle size={20} style={{ color: "var(--accent-text)" }} />
            Messages
          </h1>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageCircle size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)" }}>No conversations yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Accept a roommate request to start chatting
              </p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user._id}
                onClick={() => openChat(c.user)}
                className="w-full text-left p-4 flex items-center gap-3 transition-all duration-150"
                style={{
                  background: activeChat?.user._id === c.user._id
                    ? "var(--bg-card)"
                    : "transparent",
                  borderBottom: "1px solid var(--border-glass)"
                }}
                onMouseEnter={(e) => {
                  if (activeChat?.user._id !== c.user._id)
                    e.currentTarget.style.background = "var(--bg-card)";
                }}
                onMouseLeave={(e) => {
                  if (activeChat?.user._id !== c.user._id)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))", color: "white" }}
                  >
                    {c.user.name?.charAt(0).toUpperCase()}
                  </div>
                  {onlineSet.has(c.user._id) && (
                    <Circle size={10} fill="#22c55e" color="#22c55e"
                      className="absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {c.user.name}
                    </span>
                    <span className="text-xs shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>
                      {c.lastMessage ? formatTime(c.lastMessage.createdAt) : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {c.lastMessage
                        ? `${c.lastMessage.from === myId ? "You: " : ""}${c.lastMessage.text}`
                        : "No messages yet"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span
                        className="ml-2 shrink-0 px-1.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                          color: "white",
                          minWidth: "1.25rem",
                          textAlign: "center"
                        }}
                      >
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className={`${!showSidebar ? "flex" : "hidden"} md:flex flex-col flex-1`}
        style={{ background: "var(--bg-base)" }}>

        {!activeChat ? (
          /* No chat selected */
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageCircle size={56} style={{ color: "var(--text-muted)" }} />
            <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>
              Select a conversation
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Choose someone from the sidebar to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div
              className="flex items-center gap-3 p-4"
              style={{ borderBottom: "1px solid var(--border-glass)", background: "var(--bg-card)" }}
            >
              <button
                className="md:hidden p-2 rounded-lg"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => { setShowSidebar(true); setActiveChat(null); }}
              >
                <ArrowLeft size={20} />
              </button>

              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))", color: "white" }}
                >
                  {activeChat.user.name?.charAt(0).toUpperCase()}
                </div>
                {onlineSet.has(activeChat.user._id) && (
                  <Circle size={10} fill="#22c55e" color="#22c55e"
                    className="absolute -bottom-0.5 -right-0.5" />
                )}
              </div>

              <div>
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {activeChat.user.name}
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {typing ? (
                    <span style={{ color: "var(--accent-text)" }}>typing…</span>
                  ) : onlineSet.has(activeChat.user._id) ? (
                    <span style={{ color: "#22c55e" }}>Online</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {activeChat.user.preferences?.location || "Roommate"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No messages yet — say hello! 👋
                  </p>
                </div>
              )}

              {groupedMessages.map((group, gi) => (
                <div key={gi}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px" style={{ background: "var(--border-glass)" }} />
                    <span className="text-xs font-medium px-2" style={{ color: "var(--text-muted)" }}>
                      {group.date}
                    </span>
                    <div className="flex-1 h-px" style={{ background: "var(--border-glass)" }} />
                  </div>

                  {group.messages.map((msg) => {
                    const isMe = msg.from === myId;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                        <div
                          className="max-w-[75%] px-3.5 py-2 rounded-2xl text-sm"
                          style={{
                            background: isMe
                              ? "linear-gradient(135deg, var(--accent-start), var(--accent-end))"
                              : "var(--bg-card)",
                            color: isMe ? "white" : "var(--text-primary)",
                            borderBottomRightRadius: isMe ? "4px" : undefined,
                            borderBottomLeftRadius: !isMe ? "4px" : undefined,
                            border: isMe ? "none" : "1px solid var(--border-glass)"
                          }}
                        >
                          <p style={{ wordBreak: "break-word" }}>{msg.text}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                            <span className="text-[10px]" style={{ opacity: 0.7 }}>
                              {formatTime(msg.createdAt)}
                            </span>
                            {isMe && (
                              msg.read
                                ? <CheckCheck size={12} style={{ opacity: 0.7 }} />
                                : <Check size={12} style={{ opacity: 0.5 }} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-2xl text-sm animate-pulse"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", color: "var(--text-muted)" }}>
                    typing…
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4" style={{ borderTop: "1px solid var(--border-glass)", background: "var(--bg-card)" }}>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={text}
                  onChange={handleTyping}
                  placeholder="Type a message…"
                  className="dark-input flex-1"
                  maxLength={2000}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="btn-gradient py-2.5 px-4 shrink-0"
                  style={{ opacity: text.trim() ? 1 : 0.5 }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
