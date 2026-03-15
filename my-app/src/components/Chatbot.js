import React, { useState, useEffect, useRef } from "react";

const API = "http://127.0.0.1:5000";

const Chatbot = () => {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([{
    role: "bot",
    text: "👋 Hello! I can check if a news headline is fake or real. Type any headline below.",
    time: new Date(),
  }]);
  const [input, setInput]  = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input, time: new Date() };
    const msgs = [...messages, userMsg];
    setMessages(msgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      const { prediction, confidence, reasoning } = data;
      const confPct = Math.round((confidence || 0) * 100);
      const verdict = prediction === "Fake"
        ? `🚫 **FAKE** (${confPct}% confidence)`
        : `✅ **REAL** (${confPct}% confidence)`;
      const botText = `${verdict}\n\n${reasoning && reasoning !== "LLM unavailable" ? `💡 ${reasoning}` : ""}`;
      setMessages([...msgs, { role: "bot", text: botText, time: new Date(), prediction }]);
    } catch {
      setMessages([...msgs, { role: "bot", text: "❌ Backend unreachable. Please check the server.", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const fmtTime = d => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* FAB */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 200,
          width: 56, height: 56,
          background: "var(--accent-gold)",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem",
          boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
          transition: "var(--transition)",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        title={open ? "Close chatbot" : "Open chatbot"}
      >
        {open ? "✖" : "💬"}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 28, zIndex: 200,
          width: 360, height: 500,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "fadeUp 0.2s ease",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 18px",
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 32, height: 32,
              background: "var(--accent-gold)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem",
            }}>📰</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem" }}>FactualAI Assistant</div>
              <div style={{ fontSize: "0.65rem", color: "var(--accent-green-light)", fontFamily: "var(--font-mono)" }}>● Online</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}>
                <div style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: m.role === "user"
                    ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)"
                    : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
                  background: m.role === "user" ? "var(--accent-blue)" : "var(--surface-3)",
                  border: m.role === "bot"
                    ? m.prediction === "Fake" ? "1px solid rgba(192,57,43,0.3)"
                      : m.prediction === "Real" ? "1px solid rgba(26,122,74,0.3)"
                      : "1px solid var(--border)"
                    : "none",
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                  color: "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                }}>
                  {m.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", margin: "3px 4px", fontFamily: "var(--font-mono)" }}>
                  {fmtTime(m.time)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 5, padding: "8px 12px", width: "fit-content" }}>
                {[0,1,2].map(d => (
                  <span key={d} style={{
                    width: 7, height: 7,
                    background: "var(--text-muted)",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: `blink-dot 1.2s ease-in-out ${d * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 14px",
            borderTop: "1px solid var(--border)",
            display: "flex", gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Enter a headline…"
              style={{ flex: 1, padding: "9px 12px", fontSize: "0.82rem" }}
            />
            <button onClick={send}
              style={{
                padding: "9px 16px",
                background: "var(--accent-gold)",
                border: "none", borderRadius: "var(--radius)",
                cursor: "pointer", fontWeight: 700, fontSize: "0.82rem",
                color: "var(--ink)", transition: "var(--transition)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--accent-gold-light)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--accent-gold)"}
            >→</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
