import React from "react";

const Footer = () => (
  <footer style={{
    borderTop: "1px solid var(--border)",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--surface)",
    fontSize: "0.78rem",
    color: "var(--text-muted)",
    flexWrap: "wrap",
    gap: 8,
  }}>
    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent-gold)", fontSize: "0.9rem" }}>
      FactualAI
    </div>
    <div style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
      © {new Date().getFullYear()} FactualAI · Random Forest + LLaMA Ensemble
    </div>
    <div style={{ display: "flex", gap: 16 }}>
      <span>Text · Image · Audio · YouTube</span>
    </div>
  </footer>
);

export default Footer;
