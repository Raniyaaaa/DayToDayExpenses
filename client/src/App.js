import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound"; // Import NotFound page

// Helper functions to check login and premium status
const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // Check if a token exists
};

const isPremiumUser = () => {
  return localStorage.getItem("isPremium") === "true"; // Check premium status
};

// Protected route for authentication
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/" />;
};

// Protected route for premium users
const PremiumRoute = ({ element }) => {
  return isAuthenticated() && isPremiumUser() ? element : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/leaderboard" element={<PremiumRoute element={<Leaderboard />} />} />

        {/* 404 Not Found Route (MUST be the last route) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
