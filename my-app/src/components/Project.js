import React from "react";

const Project = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-4xl bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        {/* Header */}
        <h2 className="text-3xl font-bold mb-4">Project Details</h2>

        {/* Overview */}
        <p className="text-md text-gray-300 mb-6">
          An AI-powered Fake News Detection system that utilizes Machine Learning and NLP 
          to analyze news articles and determine their authenticity instantly.
        </p>

        {/* Key Features & Tech Stack - Grid Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Key Features */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✅ High-accuracy detection</li>
              <li>📊 Confidence scores provided</li>
              <li>📡 NLP & Transformer-based model</li>
              <li>💡 Fast & user-friendly UI</li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Technology Stack</h3>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {["React", "Flask", "ML", "NLP", "Tailwind CSS", "Scikit-Learn"].map((tech, index) => (
                <span key={index} className="bg-blue-500 px-3 py-1 rounded-md">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Try It Now Button */}
        <div className="mt-6">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-5 rounded-lg shadow-md">
            Try It Now!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Project;
