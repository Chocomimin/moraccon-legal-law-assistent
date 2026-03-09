import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthContext";

const LoginCard = () => {
  const primaryBlue = '#4285F4';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Async function for login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission refresh
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post("http://localhost:8000/token", formData);
      const token = response.data.access_token;

      // Save token and user info
      localStorage.setItem("token", token);
      login({ email });

      navigate("/chat"); // Redirect to chat page after login
    } catch (error) {
      console.error("Login failed", error);
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div
        className="w-full max-w-lg p-10 bg-white rounded-xl shadow-lg border border-blue-100"
        style={{ borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-1/2 left-4 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-xl transition duration-150 ease-in-out shadow-md"
            style={{ backgroundColor: primaryBlue }}
          >
            Log In
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
