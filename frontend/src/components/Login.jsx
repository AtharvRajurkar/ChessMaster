import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChessGame from "./HomePage";
import { Eye, EyeOff, User, Mail, Lock, Crown } from "lucide-react";

// Login/Signup Component
const AuthForm = ({ onLogin, loading, error, setError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    playerName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (isLogin) {
      // For login: pass email and password
      await onLogin({
        email: formData.email,
        password: formData.password,
        type: "login",
      });
    } else {
      // For register: validate and pass all fields
      if (!formData.playerName || !formData.email || !formData.password) {
        setError("All fields are required");
        return;
      }

      await onLogin({
        playerName: formData.playerName,
        email: formData.email,
        password: formData.password,
        type: "register",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Crown className="w-12 h-12 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Chess Master</h1>
          <p className="text-gray-300">
            {isLogin ? "Welcome back, champion!" : "Join the battle of minds"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Player Name (Signup only) */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="playerName"
                placeholder="Player Name"
                value={formData.playerName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </div>

        {/* Toggle Form */}
        <div className="text-center mt-6">
          <p className="text-gray-300">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({ playerName: "", email: "", password: "" });
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Success Message (after successful auth)
const AuthSuccess = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl text-center">
        <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome, {user.playerName}!
        </h1>
        <p className="text-gray-300 mb-6">Authentication successful</p>
        <button
          onClick={onLogout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Main App Component
export default function ChessAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL + "/api";

  const handleAuth = async (authData) => {
    setLoading(true);
    setError("");
    try {
      let response;
      let requestBody;
      if (authData.type === "login") {
        requestBody = {
          email: authData.email,
          password: authData.password,
        };
        response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      } else {
        requestBody = {
          playerName: authData.playerName,
          email: authData.email,
          password: authData.password,
        };
        response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      }
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setError("");
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              playerName: data.user.playerName,
              playerId: data.user.playerId,
              email: data.user.email,
              playerRating: data.user.playerRating,
              gamesWon: data.user.gamesWon,
              gamesLost: data.user.gamesLost,
              gamesDrawn: data.user.gamesDrawn,
              totalGames: data.user.totalGames,
            })
          );
          localStorage.setItem("token", data.token);
        }
        // Redirect to dashboard after login
        navigate("/dashboard/profile");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (error) {
      setError("Network error - please check if your server is running");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setError("");
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthForm
      onLogin={handleAuth}
      loading={loading}
      error={error}
      setError={setError}
    />
  );
}
