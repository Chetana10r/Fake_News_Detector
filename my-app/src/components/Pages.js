import React from "react";
import Footer from "./Footer";

export const About = () => (
  <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
    <div style={{ flex: 1, maxWidth: 900, margin: "0 auto", padding: "60px 24px 80px" }}>
      <div className="section-label" style={{ marginBottom: 8 }}>Our Mission</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 32 }}>
        Fighting Misinformation<br />
        <span style={{ color: "var(--accent-gold)" }}>with AI</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ borderLeft: "3px solid var(--accent-gold)" }}>
          <div className="section-label" style={{ marginBottom: 8 }}>The Problem</div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.9rem" }}>
            Fake news has become a critical threat in the digital era, influencing elections,
            public health decisions, and social cohesion. Misinformation spreads faster than
            corrections, making manual fact-checking insufficient at scale.
          </p>
        </div>
        <div className="card" style={{ borderLeft: "3px solid var(--accent-green-light)" }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Our Solution</div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.9rem" }}>
            FactualAI combines Random Forest classification with sentence embeddings and
            a local LLM for explainable, ensemble-based fake news detection — in any language,
            from any media type.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="section-label" style={{ marginBottom: 16 }}>How It Works</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {[
            { step: "01", title: "Ingest", desc: "Text, image OCR, audio transcription, or YouTube video audio extraction" },
            { step: "02", title: "Translate", desc: "Auto-detect language and translate to English using deep-translator" },
            { step: "03", title: "Classify", desc: "Sentence embeddings → Random Forest (60%) + LLaMA 3.2 LLM (40%) ensemble" },
            { step: "04", title: "Explain", desc: "Confidence scores, model breakdown, and LLM reasoning returned to user" },
          ].map(s => (
            <div key={s.step} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 900, color: "var(--accent-gold)", opacity: 0.5 }}>{s.step}</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export const Project = () => (
  <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
    <div style={{ flex: 1, maxWidth: 900, margin: "0 auto", padding: "60px 24px 80px" }}>
      <div className="section-label" style={{ marginBottom: 8 }}>Technical Overview</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 32 }}>
        Project Details
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {[
          { label: "Backend", items: ["Flask + Flask-CORS", "SentenceTransformers (all-mpnet-base-v2)", "Faster-Whisper (base)", "Ollama llama3.2:1b (local LLM)", "deep-translator + langdetect", "yt-dlp + FFmpeg", "pytesseract (OCR)", "feedparser (RSS)"] },
          { label: "Frontend", items: ["React 18", "React Router v6", "Recharts (analytics)", "Axios (HTTP)", "Web Speech API (live preview)", "Web Audio API (waveform)", "Tailwind + custom CSS vars"] },
        ].map(col => (
          <div key={col.label} className="card">
            <div className="section-label" style={{ marginBottom: 12 }}>{col.label}</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {col.items.map((item, i) => (
                <li key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: "0.85rem", color: "var(--text-secondary)",
                  paddingBottom: 8, borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ color: "var(--accent-gold)", fontSize: "0.6rem" }}>◆</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-label" style={{ marginBottom: 12 }}>ML Pipeline</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 2.2 }}>
          <div>1. Preprocess text (lowercase, remove punctuation)</div>
          <div>2. Encode with <span style={{ color: "var(--accent-gold)" }}>SentenceTransformer</span> all-mpnet-base-v2 → 768-dim vector</div>
          <div>3. <span style={{ color: "var(--accent-gold)" }}>RandomForestClassifier</span> (200 trees) → label + probability</div>
          <div>4. <span style={{ color: "var(--accent-gold)" }}>Ollama llama3.2:1b</span> → label + confidence + reasoning</div>
          <div>5. Weighted ensemble: <span style={{ color: "var(--accent-gold)" }}>RF×0.6 + LLM×0.4</span> → final verdict</div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export const Login = () => {
  const [mode, setMode] = React.useState("login");
  const [email, setEmail] = React.useState("");
  const [pass, setPass]   = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [sent, setSent]   = React.useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (mode === "forgot") { setSent(true); return; }
    if (mode === "signup" && pass !== confirmPass) { alert("Passwords don't match"); return; }
    alert(`${mode === "login" ? "Login" : "Signup"} attempted with ${email}`);
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48,
            background: "var(--accent-gold)",
            borderRadius: "var(--radius-lg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", margin: "0 auto 16px",
          }}>📰</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 900 }}>
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 6 }}>
            {mode === "login" ? "Sign in to FactualAI" : mode === "signup" ? "Join FactualAI today" : "We'll send a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>📧</div>
            <div style={{ fontWeight: 600 }}>Reset link sent to {email}</div>
            <button className="btn btn-ghost" style={{ marginTop: 16, width: "100%" }} onClick={() => { setMode("login"); setSent(false); }}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 6 }}>Email</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="section-label" style={{ marginBottom: 6 }}>Password</div>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
              </div>
            )}
            {mode === "signup" && (
              <div>
                <div className="section-label" style={{ marginBottom: 6 }}>Confirm Password</div>
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" required />
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", fontSize: "0.9rem", marginTop: 4 }}>
              {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              {mode === "login" && (
                <>
                  <button type="button" style={{ background: "none", border: "none", color: "var(--accent-gold)", cursor: "pointer" }} onClick={() => setMode("forgot")}>Forgot password?</button>
                  <button type="button" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setMode("signup")}>Create account →</button>
                </>
              )}
              {mode === "signup" && (
                <button type="button" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setMode("login")}>← Back to login</button>
              )}
              {mode === "forgot" && (
                <button type="button" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setMode("login")}>← Back to login</button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default About;
