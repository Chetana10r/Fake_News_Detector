import React, { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaMicrophone, FaImage, FaYoutube, FaStop, FaFileAudio } from "react-icons/fa";
import Footer from "./Footer";

const Home = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [recording, setRecording] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", { text });
      setResult(response.data);
    } catch (error) {
      console.error("Error predicting:", error);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);
    try {
      const response = await axios.post(`http://127.0.0.1:5000/predict-${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (error) {
      console.error(`Error predicting ${type}:`, error);
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl) return;
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict-youtube", { youtube_url: youtubeUrl });
      setResult(response.data);
    } catch (error) {
      console.error("Error predicting YouTube video:", error);
    }
  };

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.start();
  };

  const stopRecording = async () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", audioBlob);
      try {
        const response = await axios.post("http://127.0.0.1:5000/predict-audio", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResult(response.data);
      } catch (error) {
        console.error("Error predicting audio:", error);
      }
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4" style={{ backgroundImage: "url('/newspaper.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      {result && (
        <motion.div
          className={`p-4 w-80 text-center rounded-lg text-lg font-semibold shadow-md ${
            result.prediction === "Real" ? "bg-green-500" : "bg-red-500"
          }`}
          animate={{ scale: [0.9, 1.1, 0.9], transition: { duration: 1.5, repeat: Infinity } }}
        >
          <p className="flex items-center justify-center gap-2">
            {result.prediction === "Real" ? <FaCheckCircle className="text-white text-2xl" /> : <FaTimesCircle className="text-white text-2xl" />}
            {result.prediction}
          </p>
          <p className="text-sm">Confidence: {result.confidence ? Math.round(result.confidence * 100) + "%" : "N/A"}</p>
        </motion.div>
      )}

      <div className="w-full max-w-2xl bg-gray-800 p-6 shadow-lg rounded-lg mt-6 flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-center">Fake News Detection</h2>
        
        <textarea
          className="w-full p-3 border rounded-lg bg-gray-700 text-white text-sm resize-none"
          rows="4"
          placeholder="Type news here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 text-lg rounded-lg shadow-md">
          Predict
        </button>
        
        <input
          type="text"
          className="w-full p-3 border rounded-lg bg-gray-700 text-white text-sm"
          placeholder="Enter YouTube video URL"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <button onClick={handleYoutubeSubmit} className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 text-lg rounded-lg shadow-md">
          <FaYoutube className="mr-2" /> Predict YouTube
        </button>
        
        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center gap-2">
          <FaImage /> Choose Image
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "image")} />
        </label>
        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center gap-2">
          <FaFileAudio /> Choose Audio
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, "audio")} />
        </label>
        
        <button onClick={recording ? stopRecording : startRecording} className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 text-lg rounded-lg shadow-md">
          {recording ? <FaStop className="mr-2" /> : <FaMicrophone className="mr-2" />} {recording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
