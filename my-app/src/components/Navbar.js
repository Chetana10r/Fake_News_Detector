import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/health")
      .then(r => r.json())
      .then(d => setOllamaStatus(d.ollama))
      .catch(() => setOllamaStatus(false));
  }, []);

  const links = [
    { to: "/", label: "Detect" },
    { to: "/rss", label: "Live Feed" },
    { to: "/statistics", label: "Statistics" },
    { to: "/project", label: "Project" },
    { to: "/about", label: "About" },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: scrolled ? "rgba(10,10,15,0.96)" : "rgba(10,10,15,0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      transition: "var(--transition)",
    }}>
      {/* Top strip */}
      <div style={{
        height: "3px",
        background: "linear-gradient(90deg, var(--accent-red), var(--accent-gold), var(--accent-green))"
      }} />

      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: "var(--accent-gold)",
            borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ink)", fontSize: 16, fontWeight: 900,
            fontFamily: "var(--font-display)",
          }}>F</div>
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "1.1rem", color: "var(--text-primary)", letterSpacing: "-0.01em",
              lineHeight: 1,
            }}>FactualAI</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "0.6rem",
              color: "var(--accent-gold)", letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>Truth Engine</div>
          </div>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: "var(--radius)",
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              fontWeight: location.pathname === l.to ? 600 : 400,
              color: location.pathname === l.to ? "var(--accent-gold)" : "var(--text-secondary)",
              background: location.pathname === l.to ? "rgba(201,168,76,0.08)" : "transparent",
              border: location.pathname === l.to ? "1px solid var(--border)" : "1px solid transparent",
              transition: "var(--transition)",
            }}
              onMouseEnter={e => { if (location.pathname !== l.to) e.target.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { if (location.pathname !== l.to) e.target.style.color = "var(--text-secondary)"; }}
            >{l.label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Ollama indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 100,
            fontSize: "0.7rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: ollamaStatus === null ? "var(--text-muted)" : ollamaStatus ? "var(--accent-green-light)" : "var(--accent-red-light)",
              display: "inline-block",
              boxShadow: ollamaStatus ? "0 0 6px var(--accent-green-light)" : "none",
            }} />
            LLM {ollamaStatus === null ? "…" : ollamaStatus ? "ON" : "OFF"}
          </div>

          <Link to="/login" style={{
            textDecoration: "none",
            padding: "8px 18px",
            background: "var(--accent-gold)",
            color: "var(--ink)",
            borderRadius: "var(--radius)",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            transition: "var(--transition)",
          }}
            onMouseEnter={e => e.target.style.background = "var(--accent-gold-light)"}
            onMouseLeave={e => e.target.style.background = "var(--accent-gold)"}
          >Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
