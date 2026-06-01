import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { FiMoon, FiSun, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* LOGIN */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login({
        username: email.trim(),
        password: password.trim(),
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* THEME TOGGLE */}

      <div className="login-theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? (
          <FiMoon className="login-theme-icon" />
        ) : (
          <FiSun className="login-theme-icon sun" />
        )}
      </div>

      {/* CARD */}

      <div className="login-card">
        {/* AVATAR */}

        <div className="login-avatar">
          <FiUser className="avatar-icon" />
        </div>

        {/* FORM */}

        <form className="login-form" onSubmit={handleLogin}>
          {/* EMAIL */}

          <input
            type="text"
            placeholder="Email or Username"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ERROR */}

          {error && <p className="login-error">{error}</p>}

          {/* BUTTON */}

          <button
            type="submit"
            className="login-primary-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* DIVIDER */}

        <div className="login-divider">
          <span></span>
        </div>

        {/* GOOGLE */}

        <div className="google-login-btn">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                setLoading(true);

                setError("");

                const response = await loginWithGoogle({
                  token: credentialResponse.credential,
                });

                if (response?.is_new_user) {
                  navigate("/profile-setup");
                } else {
                  navigate("/dashboard");
                }
              } catch (error) {
                console.error(error);

                setError(
                  error?.response?.data?.detail ||
                    error?.message ||
                    "Google login failed.",
                );
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              setError("Google login failed.");
            }}
          />
        </div>

        {/* FOOTER */}

        <p className="login-footer">
          Don&apos;t have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            <u>Sign Up here</u>
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
