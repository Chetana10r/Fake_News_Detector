import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "👋 Welcome! Enter a news headline and I’ll check if it's Fake or Real.",
      sender: "bot",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const currentTime = new Date().toLocaleTimeString();
    const newMessages = [...messages, { text: userInput, sender: "user", time: currentTime }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        text: userInput,
      });
      const { prediction, confidence } = response.data;
      const confidencePercent = (confidence * 100).toFixed(2);

      const resultMsg =
        prediction.toLowerCase() === "fake"
          ? `🚫 Alert! This news appears to be FAKE with ${confidencePercent}% confidence.`
          : `✅ Good news! This news appears to be REAL with ${confidencePercent}% confidence.`;

      const resultClass = prediction.toLowerCase() === "fake" ? "bot-fake" : "bot-real";

      setMessages([
        ...newMessages,
        { text: resultMsg, sender: "bot", className: resultClass, time: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { text: "❌ Error checking news. Please try again!", sender: "bot", time: currentTime },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <>
      <div className="chat-toggle-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? "Close Chatbot ✖" : "Open Chatbot 💬"}
      </div>

      {isChatOpen && (
        <div className="chat-container">
          <h2 className="chat-title">📰 Fake News Detection Chatbot</h2>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender} ${msg.className || ""}`}
              >
                <div className="message-content">{msg.text}</div>
                <div className="timestamp">{msg.time}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a news headline..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
