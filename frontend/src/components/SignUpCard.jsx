import React, { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Move this outside the main component
const InputField = ({ Icon, placeholder, type = "text", value, onChange, EndIcon }) => {
  return (
    <div className="relative">
      <Icon className="absolute top-1/2 left-4 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
      />
      {EndIcon && <EndIcon className="absolute top-1/2 right-4 transform -translate-y-1/2 h-5 w-5 text-gray-400" />}
    </div>
  );
};

const SignUpCard = () => {
  const primaryBlue = "#4285F4";
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      alert("Please agree to Terms & Conditions");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/signup", {
        full_name: fullName,
        email,
        password,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      navigate("/chat");
    } catch (error) {
      console.error("Signup failed", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div
        className="w-full max-w-lg p-10 bg-white rounded-xl shadow-lg border border-blue-100"
        style={{ borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-1">Sign up for your AI Legal Assistant</p>
        </div>

        <form className="space-y-6" onSubmit={handleSignup}>
          <InputField
            Icon={User}
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <InputField
            Icon={Mail}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            EndIcon={Lock}
          />
          <InputField
            Icon={Lock}
            placeholder="Create Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center">
              <input
                id="terms-and-conditions"
                name="terms-and-conditions"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="terms-and-conditions" className="ml-2 text-gray-600 select-none">
                I agree to{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms & Conditions
                </a>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-xl transition duration-150 ease-in-out shadow-md hover:shadow-lg"
            style={{ backgroundColor: primaryBlue }}
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpCard;
