import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Footer from "./Footer";

const API = "http://127.0.0.1:5000";
const COLORS = { fake: "#e74c3c", real: "#27ae60" };

const StatBox = ({ label, value, sub, color }) => (
  <div className="card" style={{ textAlign: "center", padding: "24px 16px" }}>
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 900, color: color || "var(--text-primary)", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>{sub}</div>}
  </div>
);

const Statistics = () => {
  const [stats, setStats]     = useState({ total: 0, fake: 0, real: 0, by_input_type: {}, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      fetch(`${API}/stats`)
        .then(r => r.json())
        .then(d => { setStats(d); setLoading(false); })
        .catch(() => setLoading(false));
    };
    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, []);

  const pieData = [
    { name: "Fake", value: stats.fake },
    { name: "Real", value: stats.real },
  ];

  const inputData = Object.entries(stats.by_input_type || {}).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    count: v,
  }));

  const fakeRate = stats.total > 0 ? ((stats.fake / stats.total) * 100).toFixed(1) : 0;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div className="section-label" style={{ marginBottom: 8 }}>Platform Statistics</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 900, marginBottom: 32, letterSpacing: "-0.02em" }}>
          Detection Analytics
        </h1>

        {/* Stat boxes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatBox label="Total Analysed" value={stats.total} />
          <StatBox label="Fake News" value={stats.fake} color="var(--accent-red-light)" sub={`${fakeRate}% of total`} />
          <StatBox label="Real News" value={stats.real} color="var(--accent-green-light)" sub={`${(100 - parseFloat(fakeRate)).toFixed(1)}% of total`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          {/* Pie chart */}
          <div className="card">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>Fake vs Real Distribution</div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? COLORS.fake : COLORS.real} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 4 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart by input type */}
          <div className="card">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>By Input Type</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={inputData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 4 }} />
                <Bar dataKey="count" fill="var(--accent-gold)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent history */}
        <div className="card">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
            Recent Predictions
          </div>
          {stats.history.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 32, fontSize: "0.85rem" }}>No predictions yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["#", "Time", "Input", "Language", "RF", "LLM", "Final", "Confidence"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.history.slice(0, 20).map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "8px 12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{row.id}</td>
                      <td style={{ padding: "8px 12px", color: "var(--text-muted)", fontSize: "0.75rem" }}>{new Date(row.timestamp).toLocaleTimeString()}</td>
                      <td style={{ padding: "8px 12px" }}><span className="badge badge-gold">{row.input_type}</span></td>
                      <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>{row.language?.toUpperCase()}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ color: row.rf_label === "Fake" ? "var(--accent-red-light)" : "var(--accent-green-light)", fontWeight: 600 }}>{row.rf_label}</span>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ color: row.llm_label === "Fake" ? "var(--accent-red-light)" : row.llm_label === "Real" ? "var(--accent-green-light)" : "var(--text-muted)", fontWeight: 600 }}>{row.llm_label || "—"}</span>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span className={`badge ${row.prediction === "Fake" ? "badge-fake" : "badge-real"}`}>{row.prediction}</span>
                      </td>
                      <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                        {Math.round((row.confidence || 0) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Statistics;
