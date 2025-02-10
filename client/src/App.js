import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";


function App() {
  return (
    <>
    <Router>
      <Routes>
      
        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
      </Routes>
    </Router>
   
    </>
  );
}

export default App;
