import React, { useState, useEffect } from "react";
import Footer from "./Footer";

const API = "http://127.0.0.1:5000";

const RSSFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [source, setSource]     = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFeed = () => {
    setLoading(true);
    fetch(`${API}/rss`)
      .then(r => r.json())
      .then(d => {
        setArticles(d);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeed();
    const id = setInterval(fetchFeed, 60000); // refresh every 60s
    return () => clearInterval(id);
  }, []);

  const sources = ["all", ...new Set(articles.map(a => a.source))];

  const filtered = articles.filter(a => {
    const byFilter = filter === "all" || a.prediction.toLowerCase() === filter;
    const bySource = source === "all" || a.source === source;
    return byFilter && bySource;
  });

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="section-label">Live Classification</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              RSS News Feed
            </h1>
            {lastUpdated && (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                Updated {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 60s
              </div>
            )}
          </div>
          <button onClick={fetchFeed} className="btn btn-ghost" style={{ padding: "10px 20px" }}>
            ↻ Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {["all", "real", "fake"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "8px 18px",
                borderRadius: 100,
                border: "1px solid",
                borderColor: filter === f
                  ? f === "fake" ? "var(--accent-red-light)" : f === "real" ? "var(--accent-green-light)" : "var(--accent-gold)"
                  : "var(--border)",
                background: filter === f ? "rgba(201,168,76,0.08)" : "transparent",
                color: filter === f
                  ? f === "fake" ? "var(--accent-red-light)" : f === "real" ? "var(--accent-green-light)" : "var(--accent-gold)"
                  : "var(--text-muted)",
                cursor: "pointer", fontWeight: 600, fontSize: "0.78rem",
                textTransform: "uppercase", letterSpacing: "0.05em",
                transition: "var(--transition)",
              }}>
              {f === "all" ? "All" : f === "fake" ? "🚫 Fake" : "✅ Real"}
            </button>
          ))}
          <div className="divider" style={{ width: 1, height: 36, margin: "0 4px" }} />
          {sources.map(s => (
            <button key={s} onClick={() => setSource(s)}
              style={{
                padding: "8px 18px",
                borderRadius: 100,
                border: "1px solid",
                borderColor: source === s ? "var(--border-bright)" : "var(--border)",
                background: source === s ? "var(--surface-3)" : "transparent",
                color: source === s ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer", fontSize: "0.78rem",
                transition: "var(--transition)",
              }}>
              {s === "all" ? "All Sources" : s}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Loading news feed…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>No articles match the filter.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((article, i) => {
              const isFake = article.prediction === "Fake";
              return (
                <div key={i} className="card fade-up" style={{
                  borderLeft: `3px solid ${isFake ? "var(--accent-red-light)" : "var(--accent-green-light)"}`,
                  padding: "16px 20px",
                  animationDelay: `${i * 0.04}s`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          color: "var(--accent-gold)", background: "rgba(201,168,76,0.1)",
                          padding: "2px 8px", borderRadius: 100,
                        }}>{article.source}</span>
                        {article.language && article.language !== "en" && (
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>🌐 {article.language.toUpperCase()}</span>
                        )}
                      </div>
                      <a href={article.link} target="_blank" rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}>
                        <h3 style={{
                          fontFamily: "var(--font-display)", fontSize: "1rem",
                          fontWeight: 700, color: "var(--text-primary)",
                          lineHeight: 1.4, marginBottom: 6,
                        }}>{article.title}</h3>
                      </a>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                        {article.summary}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 100 }}>
                      <span className={`badge ${isFake ? "badge-fake" : "badge-real"}`}>
                        {isFake ? "🚫 Fake" : "✅ Real"}
                      </span>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                        color: "var(--text-muted)", marginTop: 6,
                      }}>
                        {Math.round((article.confidence || 0) * 100)}% conf.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RSSFeed;
