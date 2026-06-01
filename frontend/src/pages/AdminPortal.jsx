import { useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoDark from "../assets/images/logo-dark.png";
import logoLight from "../assets/images/logo-light.png";
import { useTheme } from "../context/ThemeContext";
import { adminLogin } from "../middleware/adminMiddleware";

import "../styles/AdminPortal.css";

const AdminPortal = () => {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const logo = theme === "dark" ? logoDark : logoLight;

  const [adminId, setAdminId] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* LOGIN */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!adminId.trim() || !password.trim()) {
      setError("Please fill all fields.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      /* BACKEND LOGIN */

      const response = await adminLogin({
        admin_id: adminId.trim(),

        password: password.trim(),
      });

      /* SAVE TOKEN */

      if (response?.access_token) {
        localStorage.setItem(
          "admin_token",

          response.access_token,
        );
      }

      /* OPTIONAL ADMIN INFO */

      if (response?.admin) {
        localStorage.setItem("admin_data", JSON.stringify(response.admin));
      }

      /* NAVIGATE */

      navigate("/admin-dashboard");
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.detail ||
          error?.message ||
          "Admin login failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* THEME TOGGLE */}

      <div className="admin-login-theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? (
          <FiMoon className="admin-login-theme-icon" />
        ) : (
          <FiSun className="admin-login-theme-icon sun" />
        )}
      </div>

      {/* CONTAINER */}

      <div className="admin-login-container">
        {/* LOGO */}

        <div className="admin-login-logo">
          <img src={logo} alt="ReMIND Logo" />
        </div>

        {/* TITLE */}

        <h1>Admin Portal</h1>

        <p>
          Secure administrative access for monitoring users, AI activity,
          memories, analytics, and system controls.
        </p>

        {/* FORM */}

        <form className="admin-login-form" onSubmit={handleLogin}>
          {/* ADMIN ID */}

          <input
            type="text"
            placeholder="Admin ID"
            className="admin-login-input"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Password"
            className="admin-login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ERROR */}

          {error && <p className="admin-login-error">{error}</p>}

          {/* BUTTON */}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPortal;
