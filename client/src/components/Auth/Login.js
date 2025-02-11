import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8000/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!!");
        navigate("/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Login</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="button" type="submit">Login</button>
      </form>
      <p className="form-text">
        <a href="/forgot-password">Forgot Password?</a>
      </p>
      <p className="form-text">
        New User? <a href="/signup">SignUp Now</a>
      </p>
    </div>
  );
}

export default Login;
