import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hi! Enter a news headline and I'll check if it's fake or real.",
      sender: "bot",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const newMessages = [...messages, { text: userInput, sender: "user" }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        text: userInput,
      });
      const { prediction, confidence } = response.data;
      const confidencePercent = (confidence * 100).toFixed(2);
      let resultMsg = "";
      let resultClass = "";

      if (prediction.toLowerCase() === "fake") {
        resultMsg = `🚫 Alert! This news appears to be FAKE with ${confidencePercent}% confidence.`;
        resultClass = "bot-fake";
      } else {
        resultMsg = `✅ Good news! This news appears to be REAL with ${confidencePercent}% confidence.`;
        resultClass = "bot-real";
      }

      setMessages([...newMessages, { text: resultMsg, sender: "bot", className: resultClass }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { text: "Error checking news. Try again!", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container small-chatbox">
      <h2 className="text-center text-lg font-bold mb-2">
        Fake News Detection Chatbot
      </h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender} ${msg.className || ""}`}>
            {msg.text}
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
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter a news headline..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;