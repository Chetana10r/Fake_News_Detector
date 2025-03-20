import React from "react";
import { FaNewspaper } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="w-full bg-gray-800 py-4 px-8 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FaNewspaper /> FactualAI
      </h1>
      <div className="space-x-8 text-lg">
        <a href="/" className="hover:text-yellow-400">Home</a>
        <a href="/about" className="hover:text-yellow-400">About</a>
        <a href="/project" className="hover:text-yellow-400">Project</a>
        <a href="/statistics" className="hover:text-yellow-400">Statistics</a>
      </div>
      <a href="/login" className="hover:text-yellow-400 text-lg font-semibold">Login</a>
    </nav>
  );
};

export default Navbar;
