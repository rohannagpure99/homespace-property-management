
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Login user
  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (!data.token) {
        throw new Error(
          "Login response did not contain an authentication token."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email || email);

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Password reset placeholder
  async function handleResetPassword(event) {
    event.preventDefault();

    setMessage(
      "Password reset is not connected yet. Your backend needs a secure password-reset API."
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* HomeSpace building logo */}
        <div className="auth-building" aria-hidden="true">
          <svg
            viewBox="0 0 48 48"
            width="38"
            height="38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 42V15L24 6L40 15V42"
              stroke="#7DD3FC"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            <path
              d="M18 42V32H30V42"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            <path
              d="M15 19H19M29 19H33M15 25H19M29 25H33"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1>HomeSpace</h1>

        <p className="auth-subtitle">
          Real Estate Agent / Builder Portal
        </p>

        {!showReset ? (
          <>
            <h2>Welcome Back</h2>

            <p>Sign in to manage your properties.</p>

            {/* Login form */}
            <form onSubmit={handleLogin}>
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />

              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  title={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Forgot password */}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setShowReset(true);
                setMessage("");
                setResetEmail(email);
              }}
            >
              Forgot Password?
            </button>
          </>
        ) : (
          <>
            {/* Password reset form */}
            <h2>Reset Password</h2>

            <p>Enter your registered email address.</p>

            <form onSubmit={handleResetPassword}>
              <label htmlFor="resetEmail">Email Address</label>

              <input
                id="resetEmail"
                type="email"
                placeholder="Enter your registered email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <button type="submit">Reset Password</button>
            </form>

            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setShowReset(false);
                setMessage("");
              }}
            >
              Back to Login
            </button>
          </>
        )}

        {/* Error and status messages */}
        {message && (
          <p className="auth-message" role="alert">
            {message}
          </p>
        )}

        {/* Small registration link */}
        <p className="auth-signup">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Sign up
          </button>
        </p>

        {/* Footer */}
        <p className="auth-footer">
          Property management, all in one place.
        </p>
      </div>
    </div>
  );
}
