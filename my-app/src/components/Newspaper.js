// src/components/Newspaper.js
export default function Newspaper() {
    return (
      <div
        className="w-full min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/newspaper-bg.jpg')"
        }}
      >
        <div className="bg-black bg-opacity-50 text-white p-6 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">News Analysis</h1>
          <p className="text-lg max-w-2xl text-center">
            Here you can see the analysis of real-time news data and how the system classifies it into fake or real categories.
          </p>
        </div>
      </div>
    );
  }
  