import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Project from "./components/Project";
import Login from "./components/Login";
import Statistics from "./components/Statistics";
import RSSFeed from "./components/RSSFeed";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import "./index.css";

const App = () => {
  return (
    <Router>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/project" element={<Project />} />
          <Route path="/login" element={<Login />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/rss" element={<RSSFeed />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
};

export default App;
