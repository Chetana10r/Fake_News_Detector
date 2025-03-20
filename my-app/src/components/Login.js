import React, { useState } from "react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || (!forgotPassword && !password)) {
      alert("Please check your inputs.");
      return;
    }
    if (forgotPassword) {
      console.log("Forgot password email sent to:", email);
      setResetEmailSent(true);
    } else if (isLogin) {
      console.log("Logging in with", email, password);
    } else {
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      console.log("Signing up with", email, password);
    }
  };

  const handleBackToLogin = () => {
    setForgotPassword(false);
    setResetEmailSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-2xl rounded-2xl text-center">
        <h2 className="text-3xl font-bold text-white">
          {forgotPassword
            ? resetEmailSent
              ? "Reset Link Sent"
              : "Forgot Password"
            : isLogin
            ? "Login"
            : "Sign Up"}
        </h2>
        <p className="text-gray-400 mt-2">
          {forgotPassword
            ? resetEmailSent
              ? `A password reset link has been sent to ${email}.`
              : "Enter your email to reset your password."
            : isLogin
            ? "Welcome back! Please log in."
            : "Create a new account."}
        </p>

        {!resetEmailSent && (
          <form onSubmit={handleSubmit} className="mt-6">
            <div>
              <label className="block text-gray-300 text-left">Email:</label>
              <input
                type="email"
                className="w-full p-3 mt-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!forgotPassword && (
              <>
                <div className="mt-4">
                  <label className="block text-gray-300 text-left">Password:</label>
                  <input
                    type="password"
                    className="w-full p-3 mt-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="mt-4">
                    <label className="block text-gray-300 text-left">
                      Confirm Password:
                    </label>
                    <input
                      type="password"
                      className="w-full p-3 mt-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-lg transition duration-300"
            >
              {forgotPassword
                ? "Send Reset Link"
                : isLogin
                ? "Login"
                : "Sign Up"}
            </button>
          </form>
        )}

        {!forgotPassword && !resetEmailSent && (
          <p className="text-gray-400 mt-4">
            <button
              className="text-blue-400 hover:underline text-sm"
              onClick={() => setForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </p>
        )}

        {forgotPassword && (
          <p className="text-gray-400 mt-4">
            <button
              className="text-blue-400 hover:underline text-sm"
              onClick={handleBackToLogin}
            >
              Back to Login
            </button>
          </p>
        )}

        {!forgotPassword && !resetEmailSent && (
          <p className="text-gray-400 mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"} {" "}
            <button
              className="text-blue-400 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;