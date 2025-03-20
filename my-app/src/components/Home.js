// src/components/Home.js
import React, { useState, useRef } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  FaMicrophone,
  FaImage,
  FaYoutube,
  FaFileAudio,
  FaStop,
  FaPaperPlane,
  FaComments,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Footer from "./Footer";
import Chatbot from "./Chatbot";

const Home = () => {
  const [activeTab, setActiveTab] = useState("text");
  const [text, setText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handlePredict = async () => {
    const formData = new FormData();
    try {
      if (activeTab === "text") {
        const response = await axios.post("http://127.0.0.1:5000/predict", {
          text,
        });
        setResult(response.data);
      } else if (activeTab === "youtube") {
        const response = await axios.post(
          "http://127.0.0.1:5000/predict-youtube",
          { youtube_url: youtubeUrl }
        );
        setResult(response.data);
      } else if (activeTab === "image") {
        formData.append("image", file);
        const response = await axios.post(
          "http://127.0.0.1:5000/predict-image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setResult(response.data);
      } else if (activeTab === "audio") {
        formData.append("audio", file);
        const response = await axios.post(
          "http://127.0.0.1:5000/predict-audio",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setResult(response.data);
      }
    } catch (error) {
      console.error("Prediction Error:", error);
    }
  };

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
  const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
  const formData = new FormData();
  formData.append("audio", audioBlob);

  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/predict-audio",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    
    setResult(response.data);
    
    // 👇 Show transcribed text in text area (if backend sends it)
    if (response.data.transcription) {
      setText(response.data.transcription);
    }
  } catch (err) {
    console.error("Recording Prediction Error:", err);
  }
};

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center px-6 py-10 relative"
      style={{
        backgroundImage: "url('/assets/newspaper-bg.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backgroundBlendMode: "overlay",
      }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-center mb-2 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        FAKE NEWS DETECTION SYSTEM
      </motion.h1>
      <motion.p
        className="text-lg text-gray-300 mb-6 text-center max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Combat misinformation using our advanced multimodal AI system. Analyze
        text, images, audio, and YouTube videos with high accuracy.
      </motion.p>

      {result && (
        <motion.div
          className={`rounded-xl text-center py-6 px-6 w-96 shadow-2xl mb-6 border-2 ${
            result.prediction === "Real"
              ? "border-green-400 bg-green-950"
              : "border-red-400 bg-red-950"
          }`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <h3 className="text-3xl font-bold tracking-wide mb-1">
            {result.prediction === "Real"
              ? "✅ This is Real News"
              : "🚫 This is Fake News"}
          </h3>
          <p className="text-sm text-gray-300">
            Confidence Score:{" "}
            <span className="font-semibold">
              {result.confidence
                ? Math.round(result.confidence * 100) + "%"
                : "N/A"}
            </span>
          </p>
        </motion.div>
      )}

      <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-3xl">
        <Tabs>
          <TabsList>
            <TabsTrigger
              value="text"
              activeTab={activeTab}
              onClick={setActiveTab}
            >
              Text
            </TabsTrigger>
            <TabsTrigger
              value="youtube"
              activeTab={activeTab}
              onClick={setActiveTab}
            >
              <FaYoutube className="inline mr-1" /> YouTube
            </TabsTrigger>
            <TabsTrigger
              value="image"
              activeTab={activeTab}
              onClick={setActiveTab}
            >
              <FaImage className="inline mr-1" /> Image
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              activeTab={activeTab}
              onClick={setActiveTab}
            >
              <FaFileAudio className="inline mr-1" /> Audio
            </TabsTrigger>
            <TabsTrigger
              value="record"
              activeTab={activeTab}
              onClick={setActiveTab}
            >
              <FaMicrophone className="inline mr-1" /> Record
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" activeTab={activeTab}>
            <textarea
              className="w-full h-32 p-3 rounded-lg bg-gray-700 text-sm"
              placeholder="Type or paste the news text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="youtube" activeTab={activeTab}>
            <input
              type="text"
              placeholder="Enter YouTube video URL..."
              className="w-full p-3 rounded-lg bg-gray-700 text-sm"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="image" activeTab={activeTab}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 bg-gray-700 rounded-lg"
            />
          </TabsContent>

          <TabsContent value="audio" activeTab={activeTab}>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 bg-gray-700 rounded-lg"
            />
          </TabsContent>

          <TabsContent value="record" activeTab={activeTab}>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-full flex justify-center items-center gap-2 py-3 px-6 rounded-lg ${
                recording ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {recording ? (
                <>
                  <FaStop /> Stop Recording
                </>
              ) : (
                <>
                  <FaMicrophone /> Start Recording
                </>
              )}
            </button>
          </TabsContent>
        </Tabs>

        {activeTab !== "record" && (
          <button
            onClick={handlePredict}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
          >
            <FaPaperPlane /> Predict
          </button>
        )}
      </div>

      <Footer />

      {/* Chatbot Icon */}
      <button
  onClick={() => setShowChatbot(!showChatbot)}
  className="fixed bottom-6 right-6 z-50 bg-yellow-500 hover:bg-yellow-600 text-black p-4 rounded-full shadow-2xl text-xl"
  title="Open Chatbot"
>
  <FaComments />
</button>


      {/* Chatbot Box */}
      {showChatbot && (
  <div className="fixed bottom-24 right-6 z-50 w-80 bg-white text-black rounded-2xl shadow-2xl border border-gray-300">
    <div className="flex justify-end p-2 border-b border-gray-300">
      <button onClick={() => setShowChatbot(false)} className="text-gray-600 hover:text-black text-lg font-bold">
        ×
      </button>
    </div>
    <Chatbot />
  </div>
)}


    </div>
  );
};

export default Home;
