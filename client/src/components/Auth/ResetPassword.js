import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const email = new URLSearchParams(window.location.search).get("email");
    const requestId = new URLSearchParams(window.location.search).get(
      "requestId"
    );

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/user/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, requestId }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        navigate("/");
      } else {
        setMessage(data.error || "Failed to reset password.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Reset Password</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </div>
  );
}

export default ResetPassword;
