import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000/api";

const QUICK_REPLIES = [
  "What tours do you offer?",
  "How do I book a tour?",
  "What are your payment methods?",
  "Suggest a tour for me",
  "What is your cancellation policy?",
  "Contact information",
];

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen]         = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showQuick, setShowQuick]   = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ---- Welcome message on first open ----
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = user
        ? `Hi ${user.name || "there"}! 👋 Welcome to Green Tours Planner. I can help you find the perfect tour, answer questions about bookings, or tell you about our packages. What would you like to know?`
        : "Hi there! 👋 Welcome to Green Tours Planner. I can help you explore tours, learn about our booking process, or answer any questions. How can I assist you today?";
      setMessages([{ role: "assistant", content: welcome, time: now() }]);
    }
  }, [isOpen]);

  // ---- Auto scroll ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Track unread when closed ----
  useEffect(() => {
    if (!isOpen) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "assistant") setUnreadCount(c => c + 1);
    }
  }, [messages]);

  const now = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setShowQuick(false);
    setLoading(true);

    const userMsg = { role: "user", content: msg, time: now() };
    setMessages(prev => [...prev, userMsg]);

    // Build history for context (exclude welcome message)
    const history = messages
      .filter(m => !(m.role === "assistant" && messages.indexOf(m) === 0))
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${BASE_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || "Sorry, I couldn't process that.",
        time: now(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having connection issues. Please try again or call us at 03165252847.",
        time: now(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowQuick(true);
    setTimeout(() => {
      const welcome = user
        ? `Hi ${user.name || "there"}! 👋 How can I help you today?`
        : "Hi there! 👋 How can I help you today?";
      setMessages([{ role: "assistant", content: welcome, time: now() }]);
    }, 100);
  };

  return (
    <>
      {/* ---- FLOATING BUTTON ---- */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          style={{
            position: "fixed", bottom: "28px", right: "28px",
            width: "60px", height: "60px", borderRadius: "50%",
            background: "linear-gradient(135deg, #16a34a, #052e16)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(22,163,74,0.5)",
            zIndex: 9998, transition: "all 0.3s",
            animation: "pulse-green 2s infinite",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          title="Chat with us"
        >
          <span style={{ fontSize: "26px" }}>💬</span>
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: "0", right: "0",
              background: "#dc2626", color: "white",
              borderRadius: "50%", width: "20px", height: "20px",
              fontSize: "11px", fontWeight: "700",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid white",
            }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ---- CHAT WINDOW ---- */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "28px", right: "28px",
          width: "380px",
          height: isMinimized ? "60px" : "560px",
          borderRadius: "20px",
          background: "white",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          zIndex: 9998,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          transition: "height 0.3s ease",
          border: "1px solid rgba(22,163,74,0.2)",
        }}>

          {/* HEADER */}
          <div style={{
            background: "linear-gradient(135deg, #14532d, #052e16)",
            padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0, cursor: "pointer",
          }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "linear-gradient(135deg, #4ade80, #16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", flexShrink: 0,
              }}>
                🌿
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "white", margin: 0 }}>
                  GreenTours Assistant
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: "#4ade80", display: "inline-block",
                    animation: "pulse-dot 1.5s infinite",
                  }} />
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", margin: 0 }}>
                    Online · Powered by Llama 3
                  </p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={e => { e.stopPropagation(); clearChat(); }}
                title="Clear chat"
                style={{
                  background: "rgba(255,255,255,0.1)", border: "none",
                  color: "rgba(255,255,255,0.7)", width: "28px", height: "28px",
                  borderRadius: "50%", cursor: "pointer", fontSize: "13px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >🔄</button>
              <button
                onClick={e => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                style={{
                  background: "rgba(255,255,255,0.1)", border: "none",
                  color: "rgba(255,255,255,0.7)", width: "28px", height: "28px",
                  borderRadius: "50%", cursor: "pointer", fontSize: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                {isMinimized ? "▲" : "▼"}
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleClose(); }}
                style={{
                  background: "rgba(255,255,255,0.1)", border: "none",
                  color: "rgba(255,255,255,0.7)", width: "28px", height: "28px",
                  borderRadius: "50%", cursor: "pointer", fontSize: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.6)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >✕</button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* MESSAGES AREA */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "16px",
                display: "flex", flexDirection: "column", gap: "12px",
                background: "#f9fafb",
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-end", gap: "8px",
                  }}>
                    {msg.role === "assistant" && (
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #4ade80, #16a34a)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", flexShrink: 0,
                      }}>🌿</div>
                    )}
                    <div style={{ maxWidth: "75%" }}>
                      <div style={{
                        padding: "10px 14px",
                        borderRadius: msg.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        background: msg.role === "user"
                          ? "linear-gradient(135deg, #16a34a, #15803d)"
                          : "white",
                        color: msg.role === "user" ? "white" : "#1f2937",
                        fontSize: "13px", lineHeight: "1.6",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        border: msg.role === "assistant"
                          ? "1px solid #e5e7eb" : "none",
                        whiteSpace: "pre-wrap",
                      }}>
                        {msg.content}
                      </div>
                      <p style={{
                        fontSize: "10px", color: "#9ca3af",
                        marginTop: "3px",
                        textAlign: msg.role === "user" ? "right" : "left",
                      }}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}

                {/* TYPING INDICATOR */}
                {loading && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #4ade80, #16a34a)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", flexShrink: 0,
                    }}>🌿</div>
                    <div style={{
                      padding: "12px 16px", borderRadius: "18px 18px 18px 4px",
                      background: "white", border: "1px solid #e5e7eb",
                      display: "flex", gap: "4px", alignItems: "center",
                    }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: "7px", height: "7px", borderRadius: "50%",
                          background: "#16a34a", display: "inline-block",
                          animation: `bounce-dot 1.2s infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK REPLIES */}
              {showQuick && messages.length <= 1 && (
                <div style={{
                  padding: "8px 12px", background: "#f9fafb",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex", flexWrap: "wrap", gap: "6px",
                }}>
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        padding: "5px 12px", borderRadius: "50px",
                        background: "#f0fdf4", color: "#16a34a",
                        border: "1px solid #bbf7d0",
                        fontSize: "11px", fontWeight: "500",
                        cursor: "pointer", transition: "all 0.15s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "#16a34a";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "#f0fdf4";
                        e.currentTarget.style.color = "#16a34a";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* INPUT AREA */}
              <div style={{
                padding: "12px 14px",
                borderTop: "1px solid #e5e7eb",
                background: "white", flexShrink: 0,
                display: "flex", gap: "8px", alignItems: "flex-end",
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about tours, bookings, payments..."
                  disabled={loading}
                  rows={1}
                  style={{
                    flex: 1, padding: "10px 14px",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "20px", fontSize: "13px",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#1f2937", outline: "none",
                    resize: "none", lineHeight: "1.4",
                    maxHeight: "80px", overflowY: "auto",
                    transition: "border-color 0.2s",
                    background: loading ? "#f9fafb" : "white",
                  }}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: loading || !input.trim()
                      ? "#e5e7eb"
                      : "linear-gradient(135deg, #16a34a, #15803d)",
                    border: "none",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (!loading && input.trim())
                      e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {loading ? (
                    <div style={{
                      width: "16px", height: "16px",
                      border: "2px solid #9ca3af",
                      borderTop: "2px solid #6b7280",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                  ) : (
                    <span style={{ color: !input.trim() ? "#9ca3af" : "white" }}>➤</span>
                  )}
                </button>
              </div>

              {/* FOOTER */}
              <div style={{
                padding: "6px", textAlign: "center",
                background: "white", borderTop: "1px solid #f3f4f6",
              }}>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>
                  🌿 Green Tours Planner · AI Assistant
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 4px 20px rgba(22,163,74,0.5); }
          50%       { box-shadow: 0 4px 32px rgba(22,163,74,0.8); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40%           { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}