# 🔍 AI-Powered Fake News Detection System

This project is a complete **AI-powered Fake News Detection System** that detects fake news from multiple sources such as **text, images, audio files, and YouTube videos**. It uses advanced **Natural Language Processing (NLP)** models, **Machine Learning**, **Optical Character Recognition (OCR)**, and **Speech-to-Text Transcription** for multimodal analysis.

---

## 📌 Features

- ✅ Text-based Fake News Detection  
- 🖼️ Image-based Fake News Detection using OCR  
- 🔊 Audio-based Fake News Detection using Whisper ASR  
- 🎥 YouTube Video Fake News Detection (audio extraction & transcription)  
- 📊 Real-time Statistics Tracking  
- 🌐 User-friendly React Frontend Interface  
- ⚙️ Flask-based REST API backend

---

## 🔧 Tech Stack

| Category       | Tools/Technologies                              |
|----------------|--------------------------------------------------|
| Frontend       | React.js, Tailwind CSS, React Router DOM        |
| Backend        | Flask, Flask-CORS                               |
| ML/NLP         | SentenceTransformers (MiniLM), Random Forest    |
| OCR            | OpenCV, pytesseract                            |
| Audio          | Faster-Whisper, Pydub, FFmpeg                   |
| YouTube        | yt-dlp                                          |
| Deployment     | Flask Server (can be hosted on Render, Heroku)  |

---

## 📂 Project Structure

```
AI-Fake-News-Detection/
│
├── backend/
│   ├── app.py                  # Flask API
│   ├── fake_news_model.pkl    # Trained ML model
│   ├── utils/
│   │   ├── ocr_utils.py       # Image OCR utilities
│   │   ├── audio_utils.py     # Whisper transcription utilities
│   │   └── youtube_utils.py   # YouTube MP3 extractor
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Home.js
│   │   │   ├── TextPredict.js
│   │   │   ├── ImagePredict.js
│   │   │   ├── AudioPredict.js
│   │   │   ├── YoutubePredict.js
│   │   │   └── Statistics.js
│   └── package.json
│
├── dataset/
│   ├── Fake.csv
│   └── True.csv
│
└── README.md
```

---

## 🧠 ML Model Workflow

1. **Data Preprocessing:**
   - `Fake.csv` → label = 1 (Fake News)
   - `True.csv` → label = 0 (Real News)

2. **Text Embedding:**
   - Using `SentenceTransformer (MiniLM-L6-v2)` to convert text into numerical vectors.

3. **Model Training:**
   - Random Forest Classifier is trained on the embeddings.

4. **Prediction Confidence:**
   - Classifier returns both label and prediction confidence.

---

## 🚀 Setup Instructions

### 1️⃣ Backend Setup (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

> **Note:** Make sure `ffmpeg` is installed and available in system PATH.

### 2️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

### 3️⃣ Required Installations

```bash
pip install sentence-transformers scikit-learn pandas numpy
pip install opencv-python pytesseract faster-whisper flask-cors yt-dlp pydub ffmpeg-python
```

---

## 📡 API Endpoints (Flask)

| Endpoint              | Method | Description                          |
|-----------------------|--------|--------------------------------------|
| `/predict`            | POST   | Predict from raw text                |
| `/predict-image`      | POST   | Predict from image (OCR)             |
| `/predict-audio`      | POST   | Predict from audio file              |
| `/predict-youtube`    | POST   | Predict from YouTube video           |
| `/stats`              | GET    | Get usage statistics                 |

---

## 🌐 Example API Usage

- **Text Prediction:**
```json
POST /predict
{
  "text": "Trump says Russia probe will be fair, but timeline unclear"
}
```

- **Image Prediction:** `POST /predict-image` (upload image file)

- **Audio Prediction:** `POST /predict-audio` (upload audio file)

- **YouTube Prediction:**
```json
POST /predict-youtube
{
  "youtube_url": "https://www.youtube.com/shorts/n7RDui1hOdY"
}
```

---

## 📊 Statistics Feature

Tracks total predictions made and class-wise breakdown:
```json
{
  "total": 50,
  "fake": 30,
  "real": 20
}
```

---

## 📊 Accuracy

The current Random Forest model achieves **95%** on test data.

---

## 📸 FRONTEND Pages

- Home Page  
- Text Prediction Interface  
- Image Upload Page  
- Audio & YouTube Prediction Interface  
- Statistics Dashboard

---

## 💡 Future Improvements

- Advanced Deep Learning models like LSTM, BERT
- Multilingual news support
- Fake News Reporting system
- User Authentication & Logging

---

## 👩‍💻 Authors

- **Chetana Rane**  
- **Vijayan Naidu**  
- **Bhavesh Chaudhari**  
- Contributions: ML model, Flask API, React Frontend

---

**College:** **Fergusson College, Pune**  
**Project Title:** **Fake News Detector**
