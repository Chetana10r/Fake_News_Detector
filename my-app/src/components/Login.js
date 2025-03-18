import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with", email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-xl rounded-lg text-center">
        <h2 className="text-3xl font-bold text-white">Login</h2>
        <p className="text-gray-400 mt-2">Welcome back! Please log in.</p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label className="block text-gray-300 text-left">Email:</label>
            <input
              type="email"
              className="w-full p-3 mt-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-300 text-left">Password:</label>
            <input
              type="password"
              className="w-full p-3 mt-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-lg transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-gray-400 mt-4">
          Don't have an account?{" "}
          <a href="#" className="text-blue-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
