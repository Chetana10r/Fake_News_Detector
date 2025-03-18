from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import yt_dlp
import cv2
import numpy as np
from pydub import AudioSegment
from sentence_transformers import SentenceTransformer
from faster_whisper import WhisperModel
import pytesseract

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Load models
embedding_model = SentenceTransformer("all-mpnet-base-v2")
with open("fake_news_classifier.pkl", "rb") as f:
    clf = pickle.load(f)
whisper_model = WhisperModel("base")

# === Statistics Tracking ===
stats_data = {"total": 0, "fake": 0, "real": 0}

# === Prediction Functions ===
def preprocess(text):
    import re
    text = re.sub(r'[^\w\s]', '', text)
    return text.lower().strip()

def predict_fake_news(text):
    text = preprocess(text)
    embedding = embedding_model.encode([text])
    prediction_proba = clf.predict_proba(embedding)[0]
    prediction = clf.predict(embedding)[0]
    confidence = max(prediction_proba)
    
    # Update statistics
    stats_data["total"] += 1
    if prediction == 1:
        stats_data["fake"] += 1
        label = "Fake"
    else:
        stats_data["real"] += 1
        label = "Real"
        
    return label, confidence

def predict_fake_news_from_image(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    text = pytesseract.image_to_string(gray)
    return predict_fake_news(text)

def transcribe_audio(audio_path):
    segments, _ = whisper_model.transcribe(audio_path)
    return " ".join([segment.text for segment in segments])

def predict_fake_news_from_audio(audio_path):
    text = transcribe_audio(audio_path)
    return predict_fake_news(text)

# === YouTube Audio Extraction ===
FFMPEG_PATH = r"C:\Users\cheta\Downloads\ffmpeg-7.1-essentials_build\ffmpeg-7.1-essentials_build\bin"

def youtube_to_mp3(youtube_url):
    output_path = "downloads/%(title)s.%(ext)s"
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'ffmpeg_location': FFMPEG_PATH,
        'outtmpl': output_path,
        'noplaylist': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            return ydl.prepare_filename(info).replace(".webm", ".mp3").replace(".m4a", ".mp3")
    except Exception as e:
        print(f"❌ YouTube download failed: {e}")
        return None

# === Flask Routes ===
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data.get("text", "")
    if not text.strip():
        return jsonify({"error": "Empty text received"}), 400
    prediction, confidence = predict_fake_news(text)
    return jsonify({"prediction": prediction, "confidence": confidence})

@app.route("/predict-image", methods=["POST"])
def predict_image():
    if "image" not in request.files:
        return jsonify({"error": "No image file received"}), 400
    image_file = request.files["image"]
    image_path = "temp_image.jpg"
    image_file.save(image_path)
    prediction, confidence = predict_fake_news_from_image(image_path)
    os.remove(image_path)
    return jsonify({"prediction": prediction, "confidence": confidence})

@app.route("/predict-audio", methods=["POST"])
def predict_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file received"}), 400
    audio_file = request.files["audio"]
    audio_path = "temp_audio.mp3"
    audio_file.save(audio_path)
    prediction, confidence = predict_fake_news_from_audio(audio_path)
    os.remove(audio_path)
    return jsonify({"prediction": prediction, "confidence": confidence})

@app.route("/predict-youtube", methods=["POST"])
def predict_youtube():
    data = request.json
    youtube_url = data.get("youtube_url", "")
    if not youtube_url:
        return jsonify({"error": "No YouTube URL received"}), 400
    audio_path = youtube_to_mp3(youtube_url)
    if audio_path and os.path.exists(audio_path):
        prediction, confidence = predict_fake_news_from_audio(audio_path)
        os.remove(audio_path)
        return jsonify({"prediction": prediction, "confidence": confidence})
    return jsonify({"error": "Failed to process YouTube video"}), 500

@app.route("/stats", methods=["GET"])
def get_stats():
    return jsonify(stats_data)

if __name__ == "__main__":
    app.run(debug=True)
