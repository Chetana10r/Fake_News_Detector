from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import re
import cv2
import numpy as np
import feedparser
import requests
import json
from datetime import datetime
from pydub import AudioSegment
from sentence_transformers import SentenceTransformer
from faster_whisper import WhisperModel
import pytesseract
from deep_translator import GoogleTranslator
from langdetect import detect

app = Flask(__name__)
CORS(app)

# ── Load Models ────────────────────────────────────────────────────────────────
embedding_model = SentenceTransformer("all-mpnet-base-v2")
with open("fake_news_classifier.pkl", "rb") as f:
    clf = pickle.load(f)
whisper_model = WhisperModel("base")

# ── Stats Tracking ─────────────────────────────────────────────────────────────
stats_data = {
    "total": 0, "fake": 0, "real": 0,
    "by_input_type": {"text": 0, "image": 0, "audio": 0, "youtube": 0, "rss": 0},
    "history": []   # last 50 predictions
}

FFMPEG_PATH = os.environ.get("FFMPEG_PATH", "")

# ── Helpers ────────────────────────────────────────────────────────────────────
def preprocess(text: str) -> str:
    text = re.sub(r'[^\w\s]', '', text)
    return text.lower().strip()

def translate_to_english(text: str) -> tuple[str, str]:
    """Detect language, translate to English if needed. Returns (english_text, detected_lang)."""
    try:
        lang = detect(text)
    except Exception:
        lang = "en"
    if lang == "en":
        return text, lang
    try:
        translated = GoogleTranslator(source='auto', target='en').translate(text)
        return translated, lang
    except Exception:
        return text, lang

def rf_predict(text: str) -> tuple[str, float]:
    """Random Forest prediction. Returns (label, confidence)."""
    text = preprocess(text)
    emb = embedding_model.encode([text])
    proba = clf.predict_proba(emb)[0]
    pred  = clf.predict(emb)[0]
    confidence = float(max(proba))
    label = "Fake" if pred == 1 else "Real"
    return label, confidence

def ollama_predict(text: str) -> tuple[str, float, str]:
    """
    LLM-based secondary classification using local Ollama llama3.2:1b.
    Returns (label, confidence, reasoning).
    """
    prompt = f"""You are a fake news detection expert. Analyze the following news text and determine if it is FAKE or REAL.

News text: "{text[:1500]}"

Respond ONLY in this exact JSON format:
{{
  "label": "Fake" or "Real",
  "confidence": a number between 0.5 and 1.0,
  "reasoning": "1-2 sentence explanation"
}}"""
    try:
        resp = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3.2:1b", "prompt": prompt, "stream": False},
            timeout=30
        )
        raw = resp.json().get("response", "{}")
        # Extract JSON from response
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            data = json.loads(match.group())
            return data.get("label", "Unknown"), float(data.get("confidence", 0.5)), data.get("reasoning", "")
    except Exception as e:
        pass
    return "Unknown", 0.5, "LLM unavailable"

def ensemble_predict(text: str) -> dict:
    """Combine RF + LLM predictions for final result."""
    rf_label, rf_conf = rf_predict(text)
    llm_label, llm_conf, reasoning = ollama_predict(text)

    # Weighted ensemble: RF=60%, LLM=40%
    rf_fake_score = rf_conf if rf_label == "Fake" else (1 - rf_conf)
    if llm_label == "Fake":
        llm_fake_score = llm_conf
    elif llm_label == "Real":
        llm_fake_score = 1 - llm_conf
    else:
        llm_fake_score = rf_fake_score  # fallback to RF if LLM unavailable

    ensemble_fake = 0.6 * rf_fake_score + 0.4 * llm_fake_score
    final_label = "Fake" if ensemble_fake >= 0.5 else "Real"
    final_conf = ensemble_fake if final_label == "Fake" else (1 - ensemble_fake)

    return {
        "prediction": final_label,
        "confidence": round(final_conf, 4),
        "rf_label": rf_label,
        "rf_confidence": round(rf_conf, 4),
        "llm_label": llm_label,
        "llm_confidence": round(llm_conf, 4),
        "reasoning": reasoning
    }

def update_stats(result: dict, input_type: str, original_text: str, lang: str):
    stats_data["total"] += 1
    if result["prediction"] == "Fake":
        stats_data["fake"] += 1
    else:
        stats_data["real"] += 1
    stats_data["by_input_type"][input_type] = stats_data["by_input_type"].get(input_type, 0) + 1
    entry = {
        "id": stats_data["total"],
        "timestamp": datetime.now().isoformat(),
        "input_type": input_type,
        "text_preview": original_text[:100],
        "language": lang,
        **result
    }
    stats_data["history"].insert(0, entry)
    if len(stats_data["history"]) > 50:
        stats_data["history"].pop()

# ── Audio/Image helpers ────────────────────────────────────────────────────────
def transcribe_audio(audio_path: str) -> str:
    segments, _ = whisper_model.transcribe(audio_path)
    return " ".join(seg.text for seg in segments)

def extract_text_from_image(image_path: str) -> str:
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Enhance contrast
    gray = cv2.equalizeHist(gray)
    return pytesseract.image_to_string(gray).strip()

def youtube_to_mp3(url: str) -> str | None:
    import yt_dlp
    out = "downloads/yt_audio.%(ext)s"
    os.makedirs("downloads", exist_ok=True)
    opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3', 'preferredquality': '128'}],
        'outtmpl': out,
        'noplaylist': True,
    }
    if FFMPEG_PATH:
        opts['ffmpeg_location'] = FFMPEG_PATH
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
            fname = ydl.prepare_filename(info)
            return fname.replace(".webm", ".mp3").replace(".m4a", ".mp3")
    except Exception as e:
        print(f"YouTube error: {e}")
        return None

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/predict", methods=["POST"])
def predict():
    text = request.json.get("text", "").strip()
    if not text:
        return jsonify({"error": "Empty text"}), 400
    en_text, lang = translate_to_english(text)
    result = ensemble_predict(en_text)
    result["original_language"] = lang
    result["translated"] = lang != "en"
    update_stats(result, "text", text, lang)
    return jsonify(result)

@app.route("/predict-image", methods=["POST"])
def predict_image():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400
    path = "temp_image.jpg"
    request.files["image"].save(path)
    try:
        raw_text = extract_text_from_image(path)
        if not raw_text:
            return jsonify({"error": "No text detected in image"}), 400
        en_text, lang = translate_to_english(raw_text)
        result = ensemble_predict(en_text)
        result["extracted_text"] = raw_text[:300]
        result["original_language"] = lang
        result["translated"] = lang != "en"
        update_stats(result, "image", raw_text, lang)
        return jsonify(result)
    finally:
        if os.path.exists(path):
            os.remove(path)

@app.route("/predict-audio", methods=["POST"])
def predict_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio"}), 400
    path = "temp_audio.mp3"
    request.files["audio"].save(path)
    try:
        raw_text = transcribe_audio(path)
        if not raw_text.strip():
            return jsonify({"error": "No speech detected"}), 400
        en_text, lang = translate_to_english(raw_text)
        result = ensemble_predict(en_text)
        result["transcription"] = raw_text[:500]
        result["original_language"] = lang
        result["translated"] = lang != "en"
        update_stats(result, "audio", raw_text, lang)
        return jsonify(result)
    finally:
        if os.path.exists(path):
            os.remove(path)

@app.route("/predict-youtube", methods=["POST"])
def predict_youtube():
    url = request.json.get("youtube_url", "").strip()
    if not url:
        return jsonify({"error": "No URL"}), 400
    audio_path = youtube_to_mp3(url)
    if not audio_path or not os.path.exists(audio_path):
        return jsonify({"error": "Failed to process YouTube video"}), 500
    try:
        raw_text = transcribe_audio(audio_path)
        en_text, lang = translate_to_english(raw_text)
        result = ensemble_predict(en_text)
        result["transcription"] = raw_text[:500]
        result["original_language"] = lang
        result["translated"] = lang != "en"
        update_stats(result, "youtube", raw_text, lang)
        return jsonify(result)
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

@app.route("/rss", methods=["GET"])
def get_rss():
    """Fetch & classify latest RSS headlines."""
    feeds = {
        "BBC": "http://feeds.bbci.co.uk/news/rss.xml",
        "Reuters": "https://feeds.reuters.com/reuters/topNews",
        "Al Jazeera": "https://www.aljazeera.com/xml/rss/all.xml",
        "The Hindu": "https://www.thehindu.com/feeder/default.rss",
        "NDTV": "https://feeds.feedburner.com/ndtvnews-top-stories",
    }
    results = []
    for source, url in feeds.items():
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:4]:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                combined = f"{title} {summary}".strip()
                if not combined:
                    continue
                en_text, lang = translate_to_english(combined)
                rf_label, rf_conf = rf_predict(en_text)
                results.append({
                    "source": source,
                    "title": title,
                    "summary": summary[:200],
                    "link": entry.get("link", "#"),
                    "published": entry.get("published", ""),
                    "prediction": rf_label,
                    "confidence": round(rf_conf, 4),
                    "language": lang,
                })
        except Exception as e:
            print(f"RSS error {source}: {e}")
    return jsonify(results)

@app.route("/stats", methods=["GET"])
def get_stats():
    return jsonify(stats_data)

@app.route("/health", methods=["GET"])
def health():
    ollama_ok = False
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=3)
        ollama_ok = r.status_code == 200
    except Exception:
        pass
    return jsonify({"status": "ok", "ollama": ollama_ok})

if __name__ == "__main__":
    os.makedirs("downloads", exist_ok=True)
    app.run(debug=True, port=5000)
