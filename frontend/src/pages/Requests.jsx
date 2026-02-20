import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
    Inbox, Send, CheckCircle2, XCircle, Clock, MapPin,
    UserCheck, UserX, Utensils, Sparkles, Volume2, ArrowRight
} from "lucide-react";

export default function Requests() {
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("incoming");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }
        loadRequests();
    }, [navigate]);

    const loadRequests = async () => {
        try {
            const res = await api.get("/user/requests");
            setIncoming(res.data.incoming || []);
            setOutgoing(res.data.outgoing || []);
        } catch (err) {
            console.error("Failed to load requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.put(`/user/request/${id}/accept`);
            setIncoming((prev) =>
                prev.map((r) => (r._id === id ? { ...r, status: "accepted" } : r))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/user/request/${id}/reject`);
            setIncoming((prev) =>
                prev.map((r) => (r._id === id ? { ...r, status: "rejected" } : r))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleCancel = async (id) => {
        try {
            await api.delete(`/user/request/${id}/cancel`);
            setOutgoing((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || "Failed to cancel request";
            alert(msg);
        }
    };

    const statusBadge = (status) => {
        const styles = {
            pending: {
                bg: "rgba(234, 179, 8, 0.1)",
                border: "rgba(234, 179, 8, 0.2)",
                color: "#facc15",
                icon: Clock,
                label: "Pending"
            },
            accepted: {
                bg: "var(--green-bg)",
                border: "var(--green-border)",
                color: "var(--green-text)",
                icon: CheckCircle2,
                label: "Accepted"
            },
            rejected: {
                bg: "var(--red-glow)",
                border: "rgba(248,113,113,0.2)",
                color: "var(--red-soft)",
                icon: XCircle,
                label: "Rejected"
            }
        };
        const s = styles[status] || styles.pending;
        const Icon = s.icon;

        return (
            <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
            >
                <Icon size={12} /> {s.label}
            </span>
        );
    };

    const pendingCount = incoming.filter((r) => r.status === "pending").length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="text-lg animate-pulse" style={{ color: "var(--text-secondary)" }}>
                    Loading requests…
                </span>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-6 animate-fade-in">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                        <UserCheck size={22} style={{ color: "var(--accent-text)" }} />
                        Roommate Requests
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                        Manage incoming and outgoing requests
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 animate-fade-in-delay">
                    <button
                        onClick={() => setTab("incoming")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === "incoming" ? "" : ""
                            }`}
                        style={{
                            background: tab === "incoming"
                                ? "linear-gradient(135deg, var(--accent-start), var(--accent-end))"
                                : "var(--bg-card)",
                            color: tab === "incoming" ? "white" : "var(--text-secondary)",
                            border: `1px solid ${tab === "incoming" ? "transparent" : "var(--border-glass)"}`
                        }}
                    >
                        <Inbox size={15} />
                        Incoming
                        {pendingCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                                style={{ background: "rgba(255,255,255,0.2)", minWidth: "1.25rem", textAlign: "center" }}>
                                {pendingCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab("outgoing")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                            background: tab === "outgoing"
                                ? "linear-gradient(135deg, var(--accent-start), var(--accent-end))"
                                : "var(--bg-card)",
                            color: tab === "outgoing" ? "white" : "var(--text-secondary)",
                            border: `1px solid ${tab === "outgoing" ? "transparent" : "var(--border-glass)"}`
                        }}
                    >
                        <Send size={15} />
                        Outgoing
                    </button>
                </div>

                {/* Incoming */}
                {tab === "incoming" && (
                    <div className="space-y-4">
                        {incoming.length === 0 ? (
                            <div className="text-center py-16">
                                <Inbox size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                                <p style={{ color: "var(--text-muted)" }}>No incoming requests</p>
                            </div>
                        ) : (
                            incoming.map((r, i) => (
                                <div key={r._id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                                style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))", color: "white" }}
                                            >
                                                {r.from?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                                                    {r.from?.name}
                                                </h3>
                                                <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                                                    <MapPin size={11} /> {r.from?.preferences?.location || "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {r.status === "pending" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAccept(r._id)}
                                                        className="btn-gradient-green py-1.5 px-4 text-sm"
                                                    >
                                                        <UserCheck size={14} /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(r._id)}
                                                        className="btn-danger py-1.5 px-4 text-sm"
                                                    >
                                                        <UserX size={14} /> Reject
                                                    </button>
                                                </>
                                            ) : (
                                                statusBadge(r.status)
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick preferences */}
                                    <div className="mt-3 flex flex-wrap gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                                        <span className="flex items-center gap-1"><Utensils size={12} style={{ color: "var(--accent-text)" }} /> {r.from?.preferences?.food || "—"}</span>
                                        <span className="flex items-center gap-1"><Sparkles size={12} style={{ color: "var(--accent-text)" }} /> Clean: {r.from?.preferences?.cleanliness ?? "—"}/10</span>
                                        <span className="flex items-center gap-1"><Volume2 size={12} style={{ color: "var(--accent-text)" }} /> Noise: {r.from?.preferences?.noise ?? "—"}/10</span>
                                    </div>

                                    {r.status === "accepted" && (
                                        <div className="mt-3 p-3 rounded-lg flex items-center gap-2 text-sm"
                                            style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green-text)" }}>
                                            <CheckCircle2 size={14} />
                                            Contact them at: <span className="font-semibold">{r.from?.email}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Outgoing */}
                {tab === "outgoing" && (
                    <div className="space-y-4">
                        {outgoing.length === 0 ? (
                            <div className="text-center py-16">
                                <Send size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                                <p style={{ color: "var(--text-muted)" }}>No outgoing requests</p>
                                <button onClick={() => navigate("/matches")} className="btn-gradient text-sm mt-3">
                                    <ArrowRight size={14} /> Browse Matches
                                </button>
                            </div>
                        ) : (
                            outgoing.map((r, i) => (
                                <div key={r._id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                                style={{ background: "linear-gradient(135deg, var(--green-start), var(--green-end))", color: "white" }}
                                            >
                                                {r.to?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                                                    {r.to?.name}
                                                </h3>
                                                <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                                                    <MapPin size={11} /> {r.to?.preferences?.location || "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {statusBadge(r.status)}
                                            {r.status === "pending" && (
                                                <button
                                                    onClick={() => handleCancel(r._id)}
                                                    className="btn-danger py-1.5 px-4 text-sm"
                                                >
                                                    <XCircle size={14} /> Undo
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                                        <span className="flex items-center gap-1"><Utensils size={12} style={{ color: "var(--accent-text)" }} /> {r.to?.preferences?.food || "—"}</span>
                                        <span className="flex items-center gap-1"><Sparkles size={12} style={{ color: "var(--accent-text)" }} /> Clean: {r.to?.preferences?.cleanliness ?? "—"}/10</span>
                                        <span className="flex items-center gap-1"><Volume2 size={12} style={{ color: "var(--accent-text)" }} /> Noise: {r.to?.preferences?.noise ?? "—"}/10</span>
                                    </div>

                                    {r.status === "accepted" && (
                                        <div className="mt-3 p-3 rounded-lg flex items-center gap-2 text-sm"
                                            style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green-text)" }}>
                                            <CheckCircle2 size={14} />
                                            Contact them at: <span className="font-semibold">{r.to?.email}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
