import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <>
    <Router>
      <Routes>
      
        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
   
    </>
  );
}

export default App;
