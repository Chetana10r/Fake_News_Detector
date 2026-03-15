import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ResultCard from "./ResultCard";
import Footer from "./Footer";

const API = "http://127.0.0.1:5000";

const TABS = [
  { id: "text",    icon: "📝", label: "Text"       },
  { id: "image",   icon: "🖼️", label: "Image"      },
  { id: "audio",   icon: "🎵", label: "Audio File"  },
  { id: "record",  icon: "🎙️", label: "Record"     },
  { id: "youtube", icon: "▶️", label: "YouTube"    },
];

/* ── Live waveform visualiser ── */
const Waveform = ({ analyser, active }) => {
  const canvasRef = useRef();
  const rafRef    = useRef();

  useEffect(() => {
    if (!analyser || !active) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const bufLen = analyser.frequencyBinCount;
    const data   = new Uint8Array(bufLen);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth   = 2;
      ctx.strokeStyle = "#c9a84c";
      ctx.beginPath();
      const sliceW = canvas.width / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, active]);

  return (
    <canvas
      ref={canvasRef}
      width={500} height={80}
      style={{
        width: "100%", height: 80,
        background: "var(--surface-3)",
        borderRadius: "var(--radius)",
        border: active ? "1px solid var(--accent-gold)" : "1px solid var(--border)",
        transition: "border-color 0.3s",
        display: "block",
      }}
    />
  );
};

const Home = () => {
  const [activeTab, setActiveTab]     = useState("text");
  const [text, setText]               = useState("");
  const [youtubeUrl, setYoutubeUrl]   = useState("");
  const [file, setFile]               = useState(null);
  const [recording, setRecording]     = useState(false);
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [recDuration, setRecDuration] = useState(0);
  const [analyser, setAnalyser]       = useState(null);
  const [liveWords, setLiveWords]     = useState("");

  const mediaRecorderRef  = useRef(null);
  const audioChunksRef    = useRef([]);
  const audioCtxRef       = useRef(null);
  const streamRef         = useRef(null);
  const timerRef          = useRef(null);
  const recognitionRef    = useRef(null);

  /* ── live speech-to-text preview using Web Speech API ── */
  const startSpeechPreview = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous   = true;
    rec.interimResults = true;
    rec.lang = ""; // auto-detect
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        interim += e.results[i][0].transcript;
      }
      setLiveWords(interim);
    };
    rec.start();
    recognitionRef.current = rec;
  };

  const startRecording = async () => {
    setError("");
    setResult(null);
    setLiveWords("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Waveform analyser
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source  = audioCtx.createMediaStreamSource(stream);
      const anlsr   = audioCtx.createAnalyser();
      anlsr.fftSize = 512;
      source.connect(anlsr);
      setAnalyser(anlsr);

      // MediaRecorder
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current   = [];
      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await sendAudioBlob(blob);
      };
      mr.start();
      setRecording(true);

      // Timer
      let s = 0;
      timerRef.current = setInterval(() => setRecDuration(++s), 1000);

      // Live preview
      startSpeechPreview();
    } catch (e) {
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    setRecDuration(0);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    setAnalyser(null);
    recognitionRef.current?.stop();
  };

  const sendAudioBlob = async (blob) => {
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("audio", blob, "recording.wav");
    try {
      const res = await axios.post(`${API}/predict-audio`, fd);
      setResult(res.data);
    } catch {
      setError("Audio prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      let res;
      if (activeTab === "text") {
        if (!text.trim()) { setError("Please enter some text."); setLoading(false); return; }
        res = await axios.post(`${API}/predict`, { text });
      } else if (activeTab === "youtube") {
        if (!youtubeUrl.trim()) { setError("Please enter a YouTube URL."); setLoading(false); return; }
        res = await axios.post(`${API}/predict-youtube`, { youtube_url: youtubeUrl });
      } else if (activeTab === "image") {
        if (!file) { setError("Please select an image."); setLoading(false); return; }
        const fd = new FormData(); fd.append("image", file);
        res = await axios.post(`${API}/predict-image`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else if (activeTab === "audio") {
        if (!file) { setError("Please select an audio file."); setLoading(false); return; }
        const fd = new FormData(); fd.append("audio", file);
        res = await axios.post(`${API}/predict-audio`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      if (res) setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || "Prediction failed. Is the backend running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fmtDuration = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <div style={{
        padding: "60px 24px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative vertical rule */}
        <div style={{
          position: "absolute", top: 0, left: "50%", width: 1,
          height: "100%", background: "var(--border)", opacity: 0.4,
          transform: "translateX(-50%)",
        }} />

        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.7rem",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--accent-gold)", marginBottom: 16,
        }}>
          ◆ AI-Powered Truth Verification ◆
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.4rem, 5vw, 4rem)",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          maxWidth: 800,
          margin: "0 auto 16px",
        }}>
          Fake News<br />
          <span style={{
            background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Detection System</span>
        </h1>

        <p style={{
          color: "var(--text-secondary)", fontSize: "1rem",
          maxWidth: 560, margin: "0 auto",
          fontFamily: "var(--font-body)",
        }}>
          Multi-modal verification in any language — text, image, voice, or video.
          Ensemble ML + LLM analysis for maximum accuracy.
        </p>
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Result */}
        {result && (
          <div style={{ marginBottom: 28 }}>
            <ResultCard result={result} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20,
            padding: "12px 16px",
            background: "rgba(192,57,43,0.1)",
            border: "1px solid rgba(192,57,43,0.3)",
            borderRadius: "var(--radius)",
            color: "var(--accent-red-light)",
            fontSize: "0.85rem",
          }}>⚠️ {error}</div>
        )}

        {/* Input card */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setResult(null); setError(""); }}
                style={{
                  flex: 1,
                  padding: "14px 8px",
                  border: "none",
                  background: activeTab === t.id ? "var(--surface-2)" : "transparent",
                  color: activeTab === t.id ? "var(--accent-gold)" : "var(--text-muted)",
                  fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600,
                  cursor: "pointer",
                  borderBottom: activeTab === t.id ? "2px solid var(--accent-gold)" : "2px solid transparent",
                  transition: "var(--transition)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: 28 }}>

            {/* ── TEXT ── */}
            {activeTab === "text" && (
              <div>
                <div className="section-label">Enter news content (any language)</div>
                <textarea
                  rows={6}
                  placeholder="Paste or type news text in English, Hindi, Marathi, or any language…"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "var(--font-body)", lineHeight: 1.7 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {text.length} chars
                  </span>
                  <button onClick={() => setText("")} className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: "0.75rem" }}>
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* ── IMAGE ── */}
            {activeTab === "image" && (
              <div>
                <div className="section-label">Upload a news image or screenshot</div>
                <label style={{
                  display: "block",
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "40px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--surface-3)",
                  transition: "var(--transition)",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-gold)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <input type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => setFile(e.target.files[0])} />
                  {file ? (
                    <div>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>🖼️</div>
                      <div style={{ color: "var(--accent-gold)", fontWeight: 600 }}>{file.name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📁</div>
                      <div style={{ color: "var(--text-secondary)" }}>Click to upload image</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 4 }}>
                        PNG, JPG, WEBP supported — OCR will extract text
                      </div>
                    </div>
                  )}
                </label>
                {file && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    style={{ marginTop: 12, maxHeight: 200, borderRadius: "var(--radius)", objectFit: "cover" }}
                  />
                )}
              </div>
            )}

            {/* ── AUDIO FILE ── */}
            {activeTab === "audio" && (
              <div>
                <div className="section-label">Upload an audio file</div>
                <label style={{
                  display: "block",
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "40px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--surface-3)",
                  transition: "var(--transition)",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-gold)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <input type="file" accept="audio/*" style={{ display: "none" }}
                    onChange={e => setFile(e.target.files[0])} />
                  {file ? (
                    <div>
                      <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎵</div>
                      <div style={{ color: "var(--accent-gold)", fontWeight: 600 }}>{file.name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                      <audio controls src={URL.createObjectURL(file)} style={{ marginTop: 12, width: "100%" }} />
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎙️</div>
                      <div style={{ color: "var(--text-secondary)" }}>Click to upload audio</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: 4 }}>
                        MP3, WAV, M4A — Whisper will transcribe in any language
                      </div>
                    </div>
                  )}
                </label>
              </div>
            )}

            {/* ── RECORD ── */}
            {activeTab === "record" && (
              <div>
                <div className="section-label">Live voice recording</div>

                <Waveform analyser={analyser} active={recording} />

                {/* Live words preview */}
                {(recording || liveWords) && (
                  <div style={{
                    marginTop: 12, padding: "10px 14px",
                    background: "var(--surface-3)",
                    borderRadius: "var(--radius)",
                    minHeight: 48,
                    border: "1px solid var(--border)",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    fontStyle: "italic",
                    lineHeight: 1.7,
                  }}>
                    {liveWords || <span style={{ color: "var(--text-muted)" }}>Listening…</span>}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "14px 28px",
                      background: recording ? "rgba(192,57,43,0.2)" : "rgba(26,122,74,0.2)",
                      border: `1px solid ${recording ? "var(--accent-red-light)" : "var(--accent-green-light)"}`,
                      borderRadius: "var(--radius)",
                      color: recording ? "var(--accent-red-light)" : "var(--accent-green-light)",
                      fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9rem",
                      cursor: "pointer", transition: "var(--transition)",
                    }}
                  >
                    {recording ? (
                      <>
                        <span style={{
                          width: 10, height: 10,
                          background: "var(--accent-red-light)",
                          borderRadius: "50%",
                          animation: "blink-dot 1s ease-in-out infinite",
                          display: "inline-block",
                        }} />
                        Stop Recording
                      </>
                    ) : "🎙️ Start Recording"}
                  </button>

                  {recording && (
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: "1.1rem",
                      color: "var(--accent-gold)",
                    }}>
                      {fmtDuration(recDuration)}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Speak in any language — Whisper auto-detects and transcribes, then translates to English for analysis.
                </div>
              </div>
            )}

            {/* ── YOUTUBE ── */}
            {activeTab === "youtube" && (
              <div>
                <div className="section-label">YouTube URL</div>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                />
                <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Audio will be downloaded, transcribed via Whisper, then classified.
                </div>
              </div>
            )}

            {/* ── Submit ── */}
            {activeTab !== "record" && (
              <button
                onClick={handlePredict}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  marginTop: 24, width: "100%",
                  padding: "16px 24px",
                  fontSize: "1rem",
                  opacity: loading ? 0.7 : 1,
                  position: "relative", overflow: "hidden",
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 18, height: 18,
                      border: "2px solid rgba(0,0,0,0.3)",
                      borderTopColor: "var(--ink)",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    Analysing…
                  </>
                ) : "🔍 Analyse Content"}
              </button>
            )}

          </div>
        </div>

        {/* Language notice */}
        <div style={{
          marginTop: 16,
          padding: "10px 16px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          display: "flex", alignItems: "center", gap: 10,
          fontSize: "0.78rem", color: "var(--text-muted)",
        }}>
          <span style={{ fontSize: "1rem" }}>🌐</span>
          <span>
            Supports <strong style={{ color: "var(--text-secondary)" }}>Hindi, Marathi, English, Tamil, Telugu, Bengali, Gujarati, Urdu</strong> and 100+ other languages via automatic translation.
          </span>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Home;
