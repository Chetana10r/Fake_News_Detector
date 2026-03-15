import React, { useEffect, useState } from "react";

const LANG_NAMES = {
  en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil",
  te: "Telugu", bn: "Bengali", gu: "Gujarati", pa: "Punjabi",
  ur: "Urdu", fr: "French", de: "German", es: "Spanish",
  ar: "Arabic", zh: "Chinese", ja: "Japanese", ko: "Korean",
  ru: "Russian", pt: "Portuguese", it: "Italian",
};

const ResultCard = ({ result, compact = false }) => {
  const [barWidth, setBarWidth] = useState(0);
  const isFake = result.prediction === "Fake";
  const confPct = Math.round((result.confidence || 0) * 100);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(confPct), 100);
    return () => clearTimeout(t);
  }, [confPct]);

  const accentColor = isFake ? "var(--accent-red-light)" : "var(--accent-green-light)";
  const bgColor     = isFake ? "rgba(192,57,43,0.06)"     : "rgba(26,122,74,0.06)";
  const borderColor = isFake ? "rgba(192,57,43,0.35)"     : "rgba(26,122,74,0.35)";
  const glowColor   = isFake ? "var(--glow-red)"           : "var(--glow-green)";

  return (
    <div className="fade-up" style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-lg)",
      padding: compact ? "16px 20px" : "28px 32px",
      boxShadow: glowColor,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Scan line effect */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "2px",
        background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
        animation: "scan 2s linear infinite",
        opacity: 0.6,
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        {/* Verdict */}
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "0.65rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--text-muted)", marginBottom: 6,
          }}>Verdict</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: compact ? "1.4rem" : "1.8rem" }}>
              {isFake ? "🚫" : "✅"}
            </span>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: compact ? "1.4rem" : "2rem",
              fontWeight: 900,
              color: accentColor,
              letterSpacing: "-0.02em",
            }}>
              {isFake ? "FAKE NEWS" : "REAL NEWS"}
            </span>
          </div>

          {/* Confidence */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Confidence</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.85rem",
                color: accentColor, fontWeight: 600,
              }}>{confPct}%</span>
            </div>
            <div className="conf-bar-track">
              <div className={`conf-bar-fill ${isFake ? "fake" : "real"}`}
                style={{ width: `${barWidth}%` }} />
            </div>
          </div>
        </div>

        {/* Model scores */}
        {!compact && (
          <div style={{
            minWidth: 160,
            background: "var(--surface-3)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "12px 16px",
            fontSize: "0.78rem",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Model Breakdown</div>
            {[
              { label: "Random Forest", val: result.rf_label, conf: result.rf_confidence },
              { label: "LLM (Llama)", val: result.llm_label, conf: result.llm_confidence },
              { label: "Ensemble", val: result.prediction, conf: result.confidence },
            ].map(m => (
              <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "var(--text-secondary)" }}>{m.label}</span>
                <span style={{
                  fontWeight: 600, fontFamily: "var(--font-mono)",
                  color: m.val === "Fake" ? "var(--accent-red-light)" : m.val === "Real" ? "var(--accent-green-light)" : "var(--text-muted)",
                  fontSize: "0.72rem",
                }}>{m.val || "—"} {m.conf ? `(${Math.round(m.conf * 100)}%)` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extra info row */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        {result.original_language && result.original_language !== "en" && (
          <span className="badge badge-gold">
            🌐 Translated from {LANG_NAMES[result.original_language] || result.original_language}
          </span>
        )}
        {result.transcription && (
          <span className="badge badge-gold">🎙️ Voice Transcribed</span>
        )}
        {result.extracted_text && (
          <span className="badge badge-gold">🔍 OCR Extracted</span>
        )}
      </div>

      {/* LLM Reasoning */}
      {!compact && result.reasoning && result.reasoning !== "LLM unavailable" && (
        <div style={{
          marginTop: 14,
          padding: "10px 14px",
          background: "var(--surface-4)",
          borderRadius: "var(--radius)",
          borderLeft: `3px solid ${accentColor}`,
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          fontStyle: "italic",
        }}>
          <span style={{ color: "var(--accent-gold)", fontStyle: "normal", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.65rem", textTransform: "uppercase", display: "block", marginBottom: 4 }}>AI Reasoning</span>
          {result.reasoning}
        </div>
      )}

      {/* Transcription preview */}
      {!compact && result.transcription && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ fontSize: "0.78rem", color: "var(--text-muted)", cursor: "pointer" }}>
            View transcription
          </summary>
          <div style={{
            marginTop: 8, padding: "10px 12px",
            background: "var(--surface-3)", borderRadius: "var(--radius)",
            fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.7,
          }}>{result.transcription}</div>
        </details>
      )}
    </div>
  );
};

export default ResultCard;
